import express from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getRestaurantMenu,
  toggleMenuStock,
  updateMenuItem,
  getPublicRestaurantMenu
} from "../Controllers/RestaurantMenuController.js";
import { authenticateRestaurant, checkRole } from "../Middleware/auth.js";
import { uploadMenuStorage } from "../Middleware/UploadFile.js";

const MenuRouter = express.Router();

MenuRouter.post(
  "/restaurant/menu/create",
  authenticateRestaurant,
  checkRole,
  uploadMenuStorage.single("image"),
  createMenuItem,
);

MenuRouter.get(
  "/restaurant/menu/all",
  authenticateRestaurant,
  checkRole,
  getRestaurantMenu,
);
MenuRouter.get(
  "/restaurant/public/menu/all/:id",
  getPublicRestaurantMenu,
);

MenuRouter.put(
  "/restaurant/menu/update/:id",
  authenticateRestaurant,
  checkRole,
  uploadMenuStorage.single("image"),
  updateMenuItem,
);

MenuRouter.patch(
  "/restaurant/menu/stock/:id",
  authenticateRestaurant,
  checkRole,
  toggleMenuStock,
);

MenuRouter.delete(
  "/restaurant/menu/delete/:id",
  authenticateRestaurant,
  checkRole,
  deleteMenuItem,
);

export default MenuRouter;