import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    restaurantId:{
        type:String
    },
    food:{
        type:Object
    }
},{
    timestamps:true
})

export const orderModel = mongoose.model("order",orderSchema)