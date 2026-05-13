import express from "express"
import dotenv from "dotenv"
import { connectDb } from "./Configs/DbConfig.js"
import { authRoute } from "./Route/authRoute.js"
import { tableRouter } from "./Route/TableRoute.js"
import cookieparser from "cookie-parser"
import cors from "cors"
import MenuRouter from "./Route/RestaurantMenuRoute.js"
dotenv.config()


const app = express()

const port = process.env.PORT

app.use(express.json())
app.use(cookieparser())
app.use(cors({
  origin: process.env.FRONTEND_BASE_URL,
  credentials: true
}));

app.listen(port, ()=>{
    console.log(`Server running at ${port}`)

    connectDb()
})

app.use("/api/v1", authRoute)
app.use("/api/v1", tableRouter)
app.use("/api/v1",MenuRouter)

