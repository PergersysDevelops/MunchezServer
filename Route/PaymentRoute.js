import express from "express"
import { initializePayment,verifyPayment} from "../Controllers/Payment.js"

export const paymentRoute = express.Router()


paymentRoute.post("/initiate-payment",initializePayment)
paymentRoute.post("/verify-payment/:reference", verifyPayment)