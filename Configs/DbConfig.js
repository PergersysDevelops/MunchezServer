import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const MONGO_URL = process.env.MONGO_URL

export const connectDb = async()=>{
    try{

        const connection = await mongoose.connect(MONGO_URL)

        console.log(`Database connected ${connection.connection.host}`)


    }catch(error){
        

        console.log(`error connecting to database ${error}`)

        process.exit(1)

    }
}