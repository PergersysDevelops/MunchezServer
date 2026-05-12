import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const generateAccessToken = (userId)=>{
    try{

        const accessToken = jwt.sign({id:userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15min"})

        return accessToken



    }catch(error){
        console.log(error)
    }
}