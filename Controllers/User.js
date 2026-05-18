import CustomizationModel from "../models/CustomizationModel.js";
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
            secure: process.env.NODE_ENV=="production",
            maxAge: 1*24*60*60*1000,
            sameSite:"none",
            path:"/"
            
        })
        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure: process.env.NODE_ENV== "production",
            maxAge: 7*24*60*60*1000,
            sameSite:"none",
            path:"/"
            
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
      maxAge: 1*24*60*60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60* 1000,
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
    console.log(error.message);

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
        maxAge: 15 * 60 * 1000,
        path: "/",
        });

        console.log("Token refreshed successfully")

        return res.json({message:"Token refreshed successfully"})





    }catch(error){
        res.json({success:false, message:"Error in refreshing access token", error: error.message})
    }
}




export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;

    const { oldPassword, newPassword } = req.body;

    // validations
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    // find user
    const user = await restaurantModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // compare old password
    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // update password
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};







export const updateCustomization = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const {
      primaryColor,
      secondaryColor,
      motto,
    } = req.body;

    // image from multer/cloudinary middleware
    let logo = "";

    if (req.file) {
      logo = req.file.path;
    }

    // check if customization already exists
    let customization =
      await CustomizationModel.findOne({
        user: userId,
      });

    // create if it doesn't exist
    if (!customization) {
      customization =
        await CustomizationModel.create({
          user: userId,
          primaryColor:
            primaryColor || "#0f172a",
          secondaryColor:
            secondaryColor || "#ffffff",
          motto: motto || "",
          logo,
        });
    } else {
      // update existing customization
      if (primaryColor) {
        customization.primaryColor =
          primaryColor;
      }

      if (secondaryColor) {
        customization.secondaryColor =
          secondaryColor;
      }

      if (motto !== undefined) {
        customization.motto = motto;
      }

      if (logo) {
        customization.logo = logo;
      }

      await customization.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "Customization updated successfully",
      customization,
    });
  } catch (error) {
    console.log(
      "UPDATE CUSTOMIZATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





// controllers/organization.controller.js



export const updateRestaurantDetails =
  async (req, res) => {
    try {
      const userId = req.user._id;

      const {
        businessName,
        phone,
        address,
      } = req.body;

      // find organization belonging to user
      const organization =
        await restaurantModel.findById(userId)

      if (!organization) {
        return res.status(404).json({
          success: false,
          message: "Organization not found",
        });
      }

      // update fields
      if (businessName !== undefined) {
        organization.businessName =
          businessName;
      }

      if (phone !== undefined) {
        organization.phone = phone;
      }

      if (address !== undefined) {
        organization.address = address;
      }

      await organization.save();

      return res.status(200).json({
        success: true,
        message:
          "Organization details updated successfully",
        organization,
      });
    } catch (error) {
      console.log(
        "UPDATE ORGANIZATION DETAILS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };


  // controllers/settings.controller.js



export const getAllDetails = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    // fetch restaurant
    const restaurant =
      await restaurantModel.findById(userId)

    // fetch customization
    const customization =
      await CustomizationModel.findOne({
        user: userId,
      });

    return res.status(200).json({
      success: true,

      // restaurant details
      businessName:
        restaurant?.businessName || "",

      address: restaurant?.address || "",

      slug: restaurant?.slug || "",

      phone: restaurant?.phone || "",

      // customization details
      primaryColor:
        customization?.primaryColor ||
        "#0f172a",

      secondaryColor:
        customization?.secondaryColor ||
        "#ffffff",

      motto: customization?.motto || "",

      logo: customization?.logo || "",
    });
  } catch (error) {
    console.log(
      "GET ALL DETAILS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllPublicDetails = async (
  req,
  res
) => {
  try {
    const userId = req.params.id;

    // fetch restaurant
    const restaurant =
      await restaurantModel.findById(userId)

    // fetch customization
    const customization =
      await CustomizationModel.findOne({
        user: userId,
      });

    return res.status(200).json({
      success: true,

      // restaurant details
      businessName:
        restaurant?.businessName || "",

      address: restaurant?.address || "",

      slug: restaurant?.slug || "",

      phone: restaurant?.phone || "",

      // customization details
      primaryColor:
        customization?.primaryColor ||
        "#0f172a",

      secondaryColor:
        customization?.secondaryColor ||
        "#ffffff",

      motto: customization?.motto || "",

      logo: customization?.logo || "",
    });
  } catch (error) {
    console.log(
      "GET ALL DETAILS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};