import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    restaurantId:{
        type:String
    },
    table:{
        type:Number
    },
    customerName:{
        type:String
    },
    
    orderData:{
        type:Object
    },
    paymentMethod:{
        type: String
    },
    paymentStatus:{
        type:String
    },
    paymentReference:{
        type:String
    },
    total:{
        type:String
    }
},{
    timestamps:true
})

export const orderModel = mongoose.model("order",orderSchema)