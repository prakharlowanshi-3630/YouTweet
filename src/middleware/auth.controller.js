import { ApiError } from "../utiles/Apierror.js";
import { asyncHandler } from "../utiles/asyncHandler.js ";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();
export const verifyJWT  =  asyncHandler(async(req,res,next)=>{
 try {
     const token = req.cookies?.accessToken || 
     req.header("Authorization")?.replace("Bearer ","" )
     if (!token){
       throw new ApiError(401 , "unauthorized access");
     }
       const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
       const user = await User.findById(decodedToken?._id).select("-refreshToken -password");
   
       if (!user){
           throw new ApiError(401 , "invalid access token");
           
       }
       req.user = user;
         next();
 } catch (error) {
    console.log(error)
    throw new ApiError(401 , "invalid ")
 }
})