import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv";
import { response } from "express";
dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
 
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response);
         fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
     
         console.log(error);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        
    }
}
const removeFromCloudinary = async(filePath)=>{
  try {
      if (!filePath){
        return null;
      
      }
      const urlArray = filePath.split('/');
      const image =  urlArray[urlArray.length -1];
      const imageName = image.split('.')[0];
      console.log("image name",imageName);

      const res = await cloudinary.uploader.destroy(imageName,{resource_type:'image'});
      console.log("image removed successfully");
      return response;
  } catch (error) {
    console.log(error);
  }
}



export {uploadOnCloudinary,removeFromCloudinary}