import mongoose from "mongoose";
import { Router } from "express";
import{upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.controller.js";
import { getVideoById, publishAVideo } from "../controllers/video.controller.js";
const videoRouter = Router();
videoRouter.route("/uploadvideo").post(verifyJWT,
    upload.fields([
        {
            name:"videofile",
            maxCount:1
        },
        {
            name: "thumbnail",
            maxCount:1

        }
    ]),
    publishAVideo
);
videoRouter.route("/c/:getvideobyid").get(verifyJWT,getVideoById);

export default videoRouter;