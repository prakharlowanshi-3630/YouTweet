import { asyncHandler } from "../utiles/asyncHandler.js";
import {ApiError} from "../utiles/Apierror.js"
import {User} from "../models/user.model.js"
import {removeFromCloudinary, uploadOnCloudinary }from "../utiles/cloudinary.js"
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
    const loggedInUser = await User.findById(user._id).select("-password ");
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
    $unset:{
       refreshToken:1
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
 
    if (!incomingRefreshToken){
     
      throw new ApiError(401 , "user unauthorized accesss")
    }
    
    try {
      const decodedToken = jwt.verify(incomingRefreshToken , "qwertyuioplkjhgfdsazxcvbnm" )
      
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
    }
     catch (error) {
      console.log( "error",error); 
    }
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
    console.log(req.file?.path)
  const avatarLocalPath = await req.file?.path;
  console.log("avatar local", avatarLocalPath);
  if (!avatarLocalPath){
    throw new ApiError(404 , "avatarlocalpath not found");
  }
    
    const avatar = await  uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url){
      throw new ApiError(404 ,"url not found");
    }
     const tempuser = await User.findById(req.user?._id);
     const oldimageurl = tempuser.avatar;
     
    const user = await User.findByIdAndUpdate(req.user?._id ,{
      $set:{
         avatar:avatar.url
      }
    },{new:true}).select("-password");
      const removeOldImageFromCloudnary = await removeFromCloudinary(oldimageurl);
      if (!removeOldImageFromCloudnary){
        throw new ApiError(500 , "image not removed");
      } 
     return res.status(200).json(new ApiResponse(200 , "avatar change succesfully",user));
 })

 const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {userName} = req.params;
    if(!userName?.trim()){
      throw new ApiError(400 ,"username not found");
    }
    const channel = await User.aggregate([
      // first pipeline
      {
        $match:{
          userName:userName
        }
      },
      // second pipeline
     {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }
      },
      // thirdpipeline
      { 
        $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
      },
      // fouth pipeline
      {
        $addFields:{
           subscribersCount:{
            $size:"$subscribers"
           },
           channelToSubscribeCount:{
             $size:"$subscribedTo"
           },
           isSubscribed:{
            if :{$in :[req.user?._id,"$subscribers.subscriber"]},
             then: true,
             else:false
           }
          }
      },
      // fifth pipeline
      {
            $project:{
              fullname:1,
               userName:1,
               avatar:1,
               coverImage:1,
               subscribersCount:1,
               channelToSubscribeCount:1,
               isSubscribed:1
            }
      }
  ])
  if (!channel?.length){
    throw new ApiError(404 , "channel does not exist");
  }
  return res.status(200).json (new ApiResponse(200,"" , channel[0]))
 })
 const userWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
      {
          $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
          }
      },
      {
        $lookup:{
          from:"videos",
           localField:"watchHistory",
           foreignField:"_id",
           as:"watchHistory",
          //   sub pipeline 1
           pipeline:[
            {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              // sub pipeline 2
              pipeline:[{
                $project:{
                   fullname:1,
                   userName:1,
                   avatar:1
                }
              }]
            } 
            } ,
              //  OR 
            // {
            //   $project:{
            //     fullname:1,
            //     userName:1,
            //     avatar:1
            //  }
              
            // }
            {
              $addFields:{
                 $first: "$owner"
              }
            }
           ]

        }
      }
  ])
  return res.status(200).json(new ApiResponse(200 ,"" , user[0]));
 })

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  changeUserDetail,
  changeUserAvatar,
  getUserChannelProfile,
  userWatchHistory
}