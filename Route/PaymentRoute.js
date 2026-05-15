import express from "express"
import { initializePayment,payWithCash,verifyPayment} from "../Controllers/Payment.js"

export const paymentRoute = express.Router()


paymentRoute.post("/initiate-payment",initializePayment)
paymentRoute.get("/verify-payment/:reference", verifyPayment)
paymentRoute.post("/pay-with-cash",payWithCash)