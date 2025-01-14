import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{
    try{
        console.log(process.env.MONGODB_URI)
       const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log("connection sucessful")
    }
    catch(error){
        console.log(error)
    }
}
export default connectDB;