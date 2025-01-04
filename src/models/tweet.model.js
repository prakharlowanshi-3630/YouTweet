import mongoose, { Schema } from "mongoose";

const tweetSchema = new mongoose.Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    contemt :{
        type:String,
         require:true
    }
},{timestamps:true})
export const Tweet = mongoose.model("Tweet" , tweetSchema)