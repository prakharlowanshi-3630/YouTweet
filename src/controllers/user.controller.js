import { asyncHandler } from "../utiles/asyncHandler.js";
import {ApiError} from "../utiles/Apierror.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary }from "../utiles/cloudinary.js"
import { ApiResponse } from "../utiles/Apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId)
      // console.log( "jdhfj" user.generateAccessToken());
      const accessToken = await user.generateAccessToken()
      const refreshToken = await user.generateRefreshToken()
      console.log("acess" , accessToken);

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false  })

      return {accessToken, refreshToken}


  } catch (error) {
    console.log(error)
      // throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
   // res.status(200).json({
   //   message: "something come",
   // }); //this is used as a dummy message so that we can check wheather or backend is connecting or not
 
   //steps to get data from the user and store it into db
   /*get user details from frontend
   1. validation: so that to check no field are empty
   2. check if the user is already exists or not
   3. check for image ,check for avatar that they are valid or not
   4. upload them into cloudinary
   5. reate user object - create entry in db //we send object in nosql database
   6. remove password and refresh token field from resp
   7. check for user creation
   return re
   */
 
   const { fullname, email, userName, password } = req.body;
   //  console.log("user body request from usercontroller.js", req.body);
   if (
     [fullname, email, userName, password].some((field) => field?.trim() === "") //some method is used to check all the field if either one of the empty then it will throw the error
   ) {
     throw new ApiError(400, "All fields are required");
   }
 
   const existedUser = await User.findOne({
     //this method find the first value of the userName or email for the database return it
     $or: [{ userName }, { email }],
   });
 
   if (existedUser) {
     throw new ApiError(409, "User already exist");
   }
 
   let avatarLocalPath = await req.files?.avatar[0]?.path; // this will the path of the image
   console.log("cloudinary files check from usercontroller.js", req.files);
 
   let coverImageLocalPath = "";
   if (
     req.files &&
     Array.isArray(req.files.coverImage) &&
     req.files.coverImage.length > 0
   ) {
     coverImageLocalPath = req.files.coverImage[0].path;
   }
   //console.log("cover Images values", coverImageLocalPath);
   console.log("avatar path", avatarLocalPath);
 
   if (!avatarLocalPath) throw new ApiError(400, "Avatar image is required");
 
   const avatar = await uploadOnCloudinary(avatarLocalPath);

 
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log("Avatar is uploaded or not", avatar);
   if (!avatarLocalPath) throw new ApiError(400, "Avatar image is required");
 
   const user = await User.create({
     fullname,
     avatar: avatar.url,
     coverImage: coverImageLocalPath||"",
     email,
     password,
     userName: userName.toLowerCase(),
   });
   const createdUser = await User.findById(user._id).select(
     "-password -refreshToken"
   ); //select method is used to remove the field which we donot want to enter in our database it takes strings as a paramater with a negative sign and spaces
 
   if (!createdUser)
     throw new ApiError(500, "Something went wrong while registering the user");
 
   return res
     .status(201)
     .json(new ApiResponse(200,  "User registered Successfully",createdUser));
 })
 const loginUser = asyncHandler(async(req,res)=>{
    const{userName,email,password} = req.body;
    if(!userName && !email){
       throw new ApiError(400 , "username or email is required");
    }
    const user =  await User .findOne({
      $or:[{userName},{email}]

    })
    if (!user){
      throw new ApiError (404 , "user not found")
    }
    const isPasswordvalid = await user.isPasswordCorrect(password);
    if (!isPasswordvalid){
         throw new ApiError(401, "user credential incorrect")
    }
    console.log(user._id);
    const { accessToken , refreshToken } = await generateAccessAndRefereshTokens(user._id);
    console.log("yess");
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
     // send cookies
   console.log(loggedInUser);
     const options = {
      httpOnly :true,
      secure :true
     }
      return res.status(200)
      .cookie("accessToken" , accessToken,options)
      .cookie("refreshToken", refreshToken,options)
      .json(new ApiResponse(200,"user logged in succesfully ", loggedInUser))
    
 })
 const logoutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    $set:{
       refreshToken:undefined
    }
  },
  {
    new:true
  }
)
const options = {
  httpOnly :true,
  secure :true
 }
  res.status(200)
  .clearCookie("refreshToken",options)
  .clearCookie("accessToken",options)
  .json( new ApiError(200 , {} , "user logout"))

 })
 const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  console.log("dufh");
    if (!incomingRefreshToken){
      console.log("errorfh");
      throw new ApiError(401 , "user unauthorized accesss")
    }
    const decodedToken = jwt.verify(incomingRefreshToken , "jkdsgggwbuiveruilurbyuieytbuivhggecvebguiycubiyeurnhgfjhbgjchfg" )
    const user = await User.findById(decodedToken._id);
    if (!user){
      throw new ApiError(401 , "unauthorized access")
    }
    if (incomingRefreshToken!== user?.refreshToken){
     throw new ApiError(401 , "invalid refresh token")
    }
    const options ={
      httpOnly:true,
      secure:true
    }
  const {accessToken , newrefreshToken} =  await  generateAccessAndRefereshTokens(user._id)
   return res.status(200)
   .cookie("accessToken" , accessToken,options)
   .cookie("refreshToken", newrefreshToken,options)
   .json(new ApiResponse(200,"user refresh access token succesfully ", user ))
 })
 const changePassword = asyncHandler(async(req,res)=>{
  const {oldPassword , newPassword} = req.body;
   const user = await User.findById(req.user?._id);
   const isPasswordvalid =  await user.isPasswordCorrect(oldPassword);
   if (!isPasswordvalid){
    throw new ApiError(400 ,"invalid detail or oldpassword");
   } 
   user.password = newPassword;
   await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200 , "password change successfullt" ));
 })
 const getCurrentUser = asyncHandler(async(req,res)=>{
   return res .status(200).json(new ApiResponse(200, "current user fetch suucessfully" , req.user))
 })
 const changeUserDetail = asyncHandler(async(req,res)=>{
   const {fullname , email } = req.body ;
   if (!fullname || !email){
    throw new ApiError(400 , "all feild are reqiure");
   }
   const user = await User.findByIdAndUpdate(req.user?._id ,{
    $set:{
      fullname , email 
    }
   },{
      new:true
   }).select("-password");
   return res.status(200).json(new ApiResponse(200, "changes success" , user));
 })
 const changeUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.avatar;
  if (!avatarLocalPath){
    throw new ApiError(404 , "avatarlocalpath not found");
  }
    const avatar = await  uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url){
      throw new ApiError(404 ,"url not found");
    }
    const user = await User.findByIdAndUpdate(req.user?._id ,{
      $set:{
         avatar:avatar.url
      }
    },{new:true}).select("-password");
    
     return res.status(200).json(new ApiResponse(200 , "avatar change succesfully",user));
 })

export {registerUser,loginUser,logoutUser,refreshAccessToken,changePassword,getCurrentUser,changeUserDetail,changeUserAvatar }