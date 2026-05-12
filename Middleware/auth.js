import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redis } from "../Configs/RedisConfig.js";
import { restaurantModel } from "../Models/Restaurants.js";

export const authenticateRestaurant = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken) {
        
        return res.json({succcess:false,message:"No tokens provided"})
    }
         
        
    try {

        const decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );

        const user = await restaurantModel.findById(decoded.id).select("-pasword")

        if(!user){
            return res.json({success:false, message:"User not existing"})
        }

        req.user = user;
        
        next();
        


       
      } catch (err) {
        // access token invalid/expired
        if(error.name == "TokenExpiredError"){
            return res.json({success:false , message:"Token Expired"})
        }
      }
    }

   
  catch (error) {
   console.log(error)
   return res.json({success:false, message:"Unaithorsed, invalid accesstoken"})
}
}


export const checkRole = async(req,res)=>{
    try{
        if(req.user.role=="admin" || req.user.role=="manager"){
            next()
        }



    }catch(error){
        console.log(error)
        return res.json({success:false, message:error})
    }
}
