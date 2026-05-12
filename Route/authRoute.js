import express from "express"
import { signUpRestaurant, loginRestaurant } from "../Controllers/User.js"


export const authRoute = express.Router()

authRoute.post("/sign-up",signUpRestaurant)
authRoute.post("/login",loginRestaurant)