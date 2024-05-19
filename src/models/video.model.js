import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema({
    videofile:{
        type:String,
        require:true
    },
    thumbnail:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true
    },
    descryption:{
        type:String,
        require:true
    },
    duration:{
        type:Number,
        require:true
    },
    views:{
        type:Number,
       default:0
    },
    ispublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
//aggregation pipeline
 videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",videoSchema)