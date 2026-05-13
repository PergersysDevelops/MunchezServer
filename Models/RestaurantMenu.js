import mongoose , {Schema} from "mongoose"

const MenuAddonSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const RestaurantMenuSchema = new mongoose.Schema(
  {
    restaurantOwnerId: {
      type: Schema.Types.ObjectId,
      ref:"restaurants",
      required: true,
      index: true,
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

    imageDataUrl: {
      type: String,
      default: "",
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },

    outOfStock: {
      type: Boolean,
      default: false,
    },

    categories: {
      type: [String],
      default: [],
    },

    addons: {
      type: [MenuAddonSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const RestaurantMenuModel = mongoose.model(
  "RestaurantMenu",
  RestaurantMenuSchema,
);