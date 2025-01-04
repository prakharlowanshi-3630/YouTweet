import mongoose from "mongoose";
import { asyncHandler } from "../utiles/asyncHandler.js";
import { ApiError } from "../utiles/Apierror.js";
import { uploadOnCloudinary } from "../utiles/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utiles/Apiresponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
     if ([title,description].some((feilds)=> feilds?.trim() ==="")){
        throw new ApiError(400 , "All feilds are required")
     } 
     console.log("hjsgdfjdshb");
     console.log(req.files);
     const videolocalpath = await req.files?.videofile[0]?.path;
     const thumbnaillocalpath = await req.files?.thumbnail[0]?.path;
     console.log(videolocalpath);
     console.log(thumbnaillocalpath);
     if (!videolocalpath){
        throw new ApiError(400 , "videolocalpath not found");
     }
     if (!thumbnaillocalpath){
        throw new ApiError(400 , " thumbnaillocalpath not found");
     }
     console.log(thumbnaillocalpath)
     const videoAtUpload = await uploadOnCloudinary(videolocalpath);
     const thumbnailAtUpload =  await uploadOnCloudinary(thumbnaillocalpath);
    
     if (!videoAtUpload){
        throw new ApiError(500 , "something went wrong on uplaod");
     }
     if (!thumbnailAtUpload){
        throw new ApiError(500 , "something went wrong on upload");
     }
     console.log(req.user._id);

     const video = await Video.create(
        {
            videofile:videoAtUpload.url,
            thumbnaill:thumbnailAtUpload.url,
            title:title,
            description:description,
            duration:videoAtUpload.duration,
            owner:req.user._id

        }
     );

    const videouploaded = await Video.findById(video._id);
    if(!videouploaded){
        throw new ApiError(500 , "somthing went wrong");
    }
    return res.status(200).json(new ApiResponse(200 ,"video uploaded successfully" , videouploaded ));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId){
        throw new ApiError(400 , "VideoId is required");

    }
    const videodetail = await Video.findById(videoId);
    if (!videodetail){
        throw new ApiError(404 ,"videodetail not found");
    }
    return res.status(200).json(new ApiResponse(200 , "success" , videodetail));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}