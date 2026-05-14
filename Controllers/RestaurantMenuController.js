import { RestaurantMenuModel } from "../Models/RestaurantMenu.js";
import cloudinary  from "../Configs/CloudinaryConfig.js";

export const createMenuItem = async (req, res) => {
  try {
    const restaurantId = req.user._id;

    const {
      name,
      description,
      image,
      price,
      currency,
      categories,
      outOfStock,
      addons,
    } = req.body;

    const menuItem = await RestaurantMenuModel.create({
      restaurantId,
      name,
      description,
      image,
      price,
      currency,
      categories,
      outOfStock,
      addons,
    });

    console.log(`image ${req.file}`)

    return res.status(201).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getRestaurantMenu = async (req, res) => {
  try {
    const restaurantId = req.user._id;

    const items = await RestaurantMenuModel.find({
      restaurantId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getPublicRestaurantMenu = async (req, res) => {
  try {
    const restaurantId = req.params.id;

    const items = await RestaurantMenuModel.find({
      restaurantId,outOfStock:false
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      items,
    });
    console.log("menu fetched for public")
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await RestaurantMenuModel.findOneAndUpdate(
      {
        _id: id,
        restaurantId: req.user._id,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    return res.status(200).json({
      success: true,
      item: updated,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RestaurantMenuModel.findOneAndDelete({
      _id: id,
      restaurantId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu item deleted",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleMenuStock = async (req, res) => {
  try {
    const { id } = req.params;

    const { outOfStock } = req.body;

    const item = await RestaurantMenuModel.findOneAndUpdate(
      {
        _id: id,
        restaurantId: req.user._id,
      },
      {
        outOfStock,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
