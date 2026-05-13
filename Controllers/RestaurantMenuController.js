import { RestaurantMenuModel } from "../Models/RestaurantMenu.js";
import cloudinary  from "../Configs/CloudinaryConfig.js";

export const createMenuItem = async (req, res) => {
  try {
    const imageUrl = req.files?.image ? req.files.image[0].path : ""

    const menu = await RestaurantMenu.create({...req.body,imageDataUrl:imageUrl,restaurantOwnerId:req.user._id});

    res.status(201).json({
      success: true,
      message: "Menu item created",
      data: menu,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create menu item",
    });
  }
};

export const getRestaurantMenu = async (req, res) => {
  try {
    const  ownerId  = req.user._id;

    const menu = await RestaurantMenu.find({
      restaurantOwnerId: ownerId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
    });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updated =
      await RestaurantMenu.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu updated",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update menu",
    });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted =
      await RestaurantMenu.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete menu",
    });
  }
};

export const toggleMenuStock = async (req, res) => {
  try {
    const { id } = req.params;

    const item =
      await RestaurantMenu.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    item.outOfStock = !item.outOfStock;

    await item.save();

    res.status(200).json({
      success: true,
      message: "Stock updated",
      data: item,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};

