import mongoose from "mongoose";

const addonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    default: 0,
  },
});

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurants",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    categories: [
      {
        type: String,
      },
    ],

    outOfStock: {
      type: Boolean,
      default: false,
    },

    addons: [addonSchema],
  },
  {
    timestamps: true,
  }
);

export const RestaurantMenuModel = mongoose.model(
  "menuitems",
  menuItemSchema
);