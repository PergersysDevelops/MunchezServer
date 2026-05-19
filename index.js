import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import { connectDb } from "./Configs/DbConfig.js";

import { authRoute } from "./Route/authRoute.js";
import { paymentRoute } from "./Route/PaymentRoute.js";
import { tableRouter } from "./Route/TableRoute.js";
import { orderRoute } from "./Route/OrderRoute.js";
import MenuRouter from "./Route/RestaurantMenuRoute.js";

import cookieparser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    
    origin: process.env.FRONTEND_BASE_URL,
    credentials: true,
  },
});

const port = process.env.PORT;

app.use(express.json());
app.use(cookieparser());

app.use(
  cors({
    origin: process.env.FRONTEND_BASE_URL,
    credentials: true,
  })
);

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // restaurant joins their own room
  socket.on("joinRestaurant", (restaurantId) => {
    socket.join(restaurantId);

    console.log(
      `Socket ${socket.id} joined restaurant ${restaurantId}`
    );
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use("/api/v1", authRoute);
app.use("/api/v1", tableRouter);
app.use("/api/v1", MenuRouter);
app.use("/api/v1", paymentRoute);
app.use("/api/v1", orderRoute);

server.listen(port, () => {
  console.log(`Server running at ${port}`);

  connectDb();
});