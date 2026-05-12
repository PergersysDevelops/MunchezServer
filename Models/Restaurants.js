import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const tenantSchema = new mongoose.Schema({

  businessName: {
    type: String,
    required: true
  },

  slug: {
    type: String,
    unique: true,
    required:true
  },

  phone:{
    type:String,
    requires:true
    
  },
  password:{
    type:String,
    required:true
  },

  logo: {
    type:String,
    default:""
  },

  address: {
    type:"String",
    default:""
  },
  role:{
    type:"String",
    enum:["admin","manager"]
  }


},{
    timestamps:true
});

tenantSchema.pre("save", async function (next) {
  try {
    // Only hash if password was modified or is new
    if (!this.isModified("password")) next()

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next;
  }
});

tenantSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const restaurantModel = mongoose.model("restaurants", tenantSchema)
