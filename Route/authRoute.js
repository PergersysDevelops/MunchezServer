import express from "express"
import { signUpRestaurant, loginRestaurant, refreshToken, changePassword, updateCustomization, updateRestaurantDetails, getAllDetails, getAllPublicDetails } from "../Controllers/User.js"
import { authenticateRestaurant, checkRole } from "../Middleware/auth.js"
import { uploadMenuStorage } from "../Middleware/UploadFile.js"



export const authRoute = express.Router()

authRoute.post("/sign-up",signUpRestaurant)
authRoute.post("/login",loginRestaurant)
authRoute.post("/refresh-access-token", refreshToken)
authRoute.put("/change-password",authenticateRestaurant,checkRole,changePassword)
authRoute.put("/update-customizations",authenticateRestaurant,checkRole,uploadMenuStorage.single("image"),updateCustomization)
authRoute.put("/update-details",authenticateRestaurant,checkRole,updateRestaurantDetails)
authRoute.get("/all-details",authenticateRestaurant,checkRole,getAllDetails)
authRoute.get("/all-details/:id",getAllPublicDetails)