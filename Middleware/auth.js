import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redis } from "../Configs/RedisConfig.js";
import { restaurantModel } from "../Models/Restaurants.js";

export const authenticateRestaurant = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    console.log(accessToken)

    if (!accessToken) {
      return res.json({
        success: false,
        message: "No tokens provided",
      });
    }

    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );

      const user = await restaurantModel
        .findById(decoded.id)
        .select("-password");

      if (!user) {
        return res.json({
          success: false,
          message: "User not existing",
        });
      }

      req.user = user;

      next();
    } catch (err) {
      // access token invalid/expired
      if (err.name === "TokenExpiredError") {
        console.log(err)
        return res.json({
          success: false,
          message: "Token Expired",
        });
      }

      return res.json({
        success: false,
        message: "Invalid access token",
      });
    }
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Unauthorised, invalid accesstoken",
    });
  }
};


export const checkRole = async(req,res,next)=>{
    try{
        if(req.user.role=="admin" || req.user.role=="manager"){
            next()
        }



    }catch(error){
        console.log(error)
        return res.json({success:false, message:error})
    }
}
