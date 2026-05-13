import express from "express"
import { signUpRestaurant, loginRestaurant, refreshToken } from "../Controllers/User.js"


export const authRoute = express.Router()

authRoute.post("/sign-up",signUpRestaurant)
authRoute.post("/login",loginRestaurant)
authRoute.post("/refresh-access-token", refreshToken)