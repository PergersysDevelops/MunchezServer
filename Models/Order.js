import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
   restaurantId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"restaurants"
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
    },
    orderStatus:{
        type: String,
        enum: ["pending","processing","ready"],
        default:"pending"
    }
},{
    timestamps:true
})

export const orderModel = mongoose.model("order",orderSchema)