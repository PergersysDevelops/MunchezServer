import { restaurantModel } from "../Models/Restaurants.js";
import jwt from "jsonwebtoken"
import { generateAccessToken } from "../Utils/GenerateAccessToken.js";
import { generateRefreshToken } from "../Utils/GenerateRefreshToken.js";
import { redis } from "../Configs/RedisConfig.js";
import dotenv from "dotenv"
import { generateUniqueSlug } from "../Utils/GenerateSlug.js";
dotenv.config()



export const signUpRestaurant = async(req , res)=>{
    try{
        const {businessName, phone, password,role} = req.body

        const slug = await generateUniqueSlug(restaurantModel, businessName)

        const user = await restaurantModel.findOne({businessName,phone})

        if(user){
            return res.json({success:false,message:"user already registered"})
        }

        const newRestaurant = new restaurantModel({businessName,phone,role,slug,password})

        await newRestaurant.save()

        const refreshToken = generateRefreshToken(newRestaurant._id)

        const accessToken = generateAccessToken(newRestaurant._id)

        await redis.set(`refreshtoken${newRestaurant._id}`, refreshToken, "EX", 7*24*60*60)

        res.cookie("accessToken",accessToken,{
            httpOnly:true,
            secure: process.env.NODE_ENV,
            maxAge: 7*24*60*60*1000,
            sameSite:"strict"
            
        })
        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure: process.env.NODE_ENV,
            maxAge: 15*60*1000,
            sameSite:"strict"
            
        })

        delete newRestaurant.password



        return res.json({success:true, user:newRestaurant})




    }catch(error){
        console.log(error)
        return res.json({success:false, error: error.message})

    }
}
export const loginRestaurant = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const restaurant = await restaurantModel.findOne({ phone });

    if (!restaurant) {
      return res.json({
        success: false,
        message: "invalid credentials",
      });
    }

    const passwordMatch = await restaurant.comparePassword(password);

    if (!passwordMatch) {
      return res.json({
        success: false,
        message: "invalid credentials",
      });
    }

    const refreshToken = generateRefreshToken(restaurant._id);

    const accessToken = generateAccessToken(restaurant._id);

    await redis.set(
      `refreshtoken${restaurant._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    const userData = restaurant.toObject();

    delete userData.password;

    console.log("Cookies set");

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      error: error.message,
    });
  }
};


export const refreshToken = async(req,res)=>{
    try{
        const storedRefreshToken = req.cookies?.refreshToken

        if(!storedRefreshToken){
            return res.json({success:false,message:"No token provided"})
        }
        const decoded = jwt.verify(storedRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const redisRefreshToken = await redis.get(`refreshToken${decoded.id}`)

        if(storedRefreshToken!=redisRefreshToken){
            return res.json({message:"Invalid refresh token"})
        }
        
        const accessToken = generateAccessToken(decoded.id)

        res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
        });

        return res.json({message:"Token refreshed successfully"})





    }catch(error){
        res.json({success:false, message:"Error in refreshing access token", error: error.message})
    }
}