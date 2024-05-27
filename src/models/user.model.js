import dotenv from 'dotenv';

import mongoose from "mongoose";
import { Schema } from "mongoose";
import jwt from "jsonwebtoken";

//SON Web Tokens (JWTs) are a standardized way to securely send data between two parties. They contain information (claims) encoded in the JSON format

import bcrypt from "bcrypt";
dotenv.config();
 //this help to encrpyt the password

const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      index: true, //this is used to add the attribute in search, this make search easy from the data base
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url that store avtar

       required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Vedio",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is Requireed"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //check if the password is modified or not
  this.password = await bcrypt.hash(this.password, 10);
  // console.log("password from the user model", this.password);
  next(); // if the password is modified then brcrpyt or encrypt the password
}); //pre is used to apply some operation before storing data to the server or database

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); //this is custom method that help to check the password is true or not this method return the value in boolean
};
userSchema.methods.generateAccessToken = function () {
  console.log("acesstoeney", process.env.ACCESS_TOKEN_SECRET, )
  return jwt.sign(
    {
      _id: this.id,
      email: this.email,
      userName: this.userName,
      fullname: this.fullname,
    },
    'qwertyuioplkjhgfdsazxcvbnm',
    {
      expiresIn: '15m',
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  console.log( process.env.REFESH_TOKEN_SECRET)
  return jwt.sign(
    {
      _id: this.id,
    },
    'qwertyuioplkjhgfdsazxcvbnm' ,
    {
      expiresIn: '15m',
    }
  );
};
export const User = mongoose.model("User", userSchema);