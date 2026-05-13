import express from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getRestaurantMenu,
  toggleMenuStock,
  updateMenuItem,
} from "../Controllers/RestaurantMenuController.js";
import { authenticateRestaurant, checkRole } from "../Middleware/auth.js";
import { uploadMenuStorage } from "../Middleware/UploadFile.js";

const MenuRouter = express.Router();

MenuRouter.post(
  "/add-item",
  authenticateRestaurant,
  checkRole,
  uploadMenuStorage.single("image"),
  createMenuItem,
);

MenuRouter.get(
  "/all-menu",
  authenticateRestaurant,
  checkRole,
  getRestaurantMenu,
);

MenuRouter.put(
  "/update-item/:id",
  authenticateRestaurant,
  checkRole,
  updateMenuItem,
);

MenuRouter.patch(
  "/:id/toggle-stock",
  authenticateRestaurant,
  checkRole,
  toggleMenuStock,
);

MenuRouter.delete(
  "/delete-item/:id",
  authenticateRestaurant,
  checkRole,
  deleteMenuItem,
);

export default MenuRouter;