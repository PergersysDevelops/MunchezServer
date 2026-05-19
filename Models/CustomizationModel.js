import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    logo: {
      type: String,
      default: "",
    },

    motto: {
      type: String,
      default: "",
      trim: true,
    },

    primaryColor: {
      type: String,
      default: "#0f172a",
    },

    secondaryColor: {
      type: String,
      default: "#ffffff",
    },
    currency:{
      type:String,
      default:"GHS"
    }
  },
  {
    timestamps: true,
  }
);

const CustomizationModel = mongoose.model(
  "Customization",
  customizationSchema
);

export default CustomizationModel;