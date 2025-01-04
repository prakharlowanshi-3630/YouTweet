import dotenv from"dotenv"
import mongoose from "mongoose";
import express from "express"
import { DB_NAME } from "./constants.js";
import connectDB from "./db/db.js";
import {app} from "./app.js"

dotenv.config({
    path:"./.env"
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 4000 , ()=>{
        console.log("server is start running sucessfully");
    })
})
.catch((err)=>{
    console.log("connection with database is failed")
})

// ;(async()=>{
//    try{
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//       app.on("error" ,(error)=>{
//           console.log(error)
//       })
//       app.listen(process.env.PORT,()=>{
//         console.log(`server is running at ${process.env.PORT}`)
//       })
//    }
//    catch(error){
//     console.log(error)
//    }
// })()