import express from "express"
import { getDashboardAnalytics } from "../Controllers/OrderAnalytics.js";
import { authenticateRestaurant,checkRole } from "../Middleware/auth.js";

export const analyticsRouter = express.Router();

analyticsRouter.get("/dashboard-analytics",authenticateRestaurant,checkRole,getDashboardAnalytics)


// export default router;