import { RestaurantMenuModel } from "../Models/RestaurantMenu.js";
import cloudinary  from "../Configs/CloudinaryConfig.js";
import CustomizationModel from "../Models/CustomizationModel.js";

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
      currencySymbol
    } = req.body;

    console.log(currencySymbol)

    const menuItem = await RestaurantMenuModel.create({
      restaurantId,
      name,
      description,
      image: req.file ? req.file.path : null,
      price,
      currency,
      categories: JSON.parse(categories),
      outOfStock,
      addons: JSON.parse(addons),
    });

    const restaurantCustomization = await CustomizationModel.findOne({user: restaurantId})

    if(!restaurantCustomization){
      await CustomizationModel.create({
          user: restaurantId,
          primaryColor: "",
          secondaryColor:"",
          motto: "",
          currency:currencySymbol,
          logo:""
        });
    }
    else{

      const updateCustomization = await CustomizationModel.findByIdAndUpdate(restaurantCustomization._id,{curency:currencySymbol}, {new:true})
      console.log()

    }

    // console.log(`image ${req.file}`)

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

export const updateMenuItem = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
    };

    // image from middleware
    if (req.file) {
      updateData.image =
        req.file.path ||
        req.file.secure_url ||
        req.file.url;
    }

    // parse categories
    if (req.body.categories) {
      updateData.categories =
        JSON.parse(
          req.body.categories
        );
    }

    // parse addons
    if (req.body.addons) {
      updateData.addons =
        JSON.parse(req.body.addons);
    }

    // convert boolean string
    if (
      req.body.outOfStock !==
      undefined
    ) {
      updateData.outOfStock =
        req.body.outOfStock ===
        "true";
    }

    // convert number string
    if (req.body.price !== undefined) {
      updateData.price = Number(
        req.body.price
      );
    }

    const updated =
      await RestaurantMenuModel.findOneAndUpdate(
        {
          _id: id,
          restaurantId:
            req.user._id,
        },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message:
          "Menu item not found",
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
