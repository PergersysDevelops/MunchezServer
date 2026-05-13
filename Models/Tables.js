import mongoose, { Schema } from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurants",
      required: true,
    },

    tableNumber: {
      type: Number,
      required: true,
    },

    menuUrl: {
      type: String,
      required: true,
    },

    qrImageUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

tableSchema.index(
  {
    restaurantId: 1,
    tableNumber: 1,
  },
  {
    unique: true,
  }
);

export const tableModel = mongoose.model("Table", tableSchema);