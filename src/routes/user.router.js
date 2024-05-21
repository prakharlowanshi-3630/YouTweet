import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import{upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.controller.js";
const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    //this upload come from multer
    //the field is take an array of object
    //this is used to upload file image on db using the middleware
    {
      name: "avatar", //it should be same from the frontend and backend to comuunicate easily
      maxCount: 1, //how many images we wants to take from user
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT , logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken)
export default userRouter