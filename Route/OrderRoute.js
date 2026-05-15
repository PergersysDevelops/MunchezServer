import express from "express"
import { authenticateRestaurant, checkRole } from "../Middleware/auth.js"
import { getAllOrders , togglePaidStatus} from "../Controllers/Orders.js"


export const orderRoute = express.Router()

orderRoute.get("/all-orders",authenticateRestaurant,checkRole,getAllOrders)
orderRoute.patch("/mark-order-paid/:id",authenticateRestaurant,checkRole,togglePaidStatus)