import express from "express"
import dotenv from "dotenv"
import { connectDb } from "./Configs/DbConfig.js"
import { authRoute } from "./Route/authRoute.js"
import cookieparser from "cookie-parser"
import cors from "cors"
dotenv.config()


const app = express()

const port = process.env.PORT

app.use(express.json())
app.use(cookieparser())
app.use(cors({
  origin: "https://munchez-ochre.vercel.app/",
  credentials: true
}));

app.listen(port, ()=>{
    console.log(`Server running at ${port}`)

    connectDb()
})

app.use("/api/v1", authRoute)

