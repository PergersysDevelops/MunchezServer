import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const generateRefreshToken = (userId)=>{
    try{

        const refreshToken = jwt.sign({id:userId},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})

        return refreshToken



    }catch(error){
        console.log(error)
    }
}