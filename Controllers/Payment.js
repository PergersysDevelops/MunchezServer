// POST /initiate-payment
import axios from "axios";
import dotenv from "dotenv"
import { orderModel } from "../Models/Order.js";

import { restaurantModel } from "../Models/Restaurants.js";
import { io } from "../index.js";

// import { io } from "../server.js";

dotenv.config()

export const initializePayment = async (req, res) => {
  try {
    const { amount , orderData} = req.body;

    console.log(orderData)

    const frontendBaseUrl = process.env.NODE_ENV == "production"? process.env.FRONTEND_BASE_URL:process.env.FRONTEND_LOCALHOST_URL

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: "super.admin@pergersys.com",
        amount: amount, // convert to pesewas 
        callback_url: `${frontendBaseUrl}/m/${orderData.restaurantOwnerId}/table/${orderData.tableNumber}/verify-payment`,
        metadata: orderData, // attach order info
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
    console.log(response)

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
}




export const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response?.data?.data;

    // console.log(paymentData);

    // payment not successful
    if (!paymentData || paymentData.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // metadata sent during initialize payment
    const metadata = paymentData.metadata || {};

    // orderData from metadata
    const orderData = metadata;

    if (!orderData) {
      return res.status(400).json({
        success: false,
        message: "Order data missing from metadata",
      });
    }

    // prevent duplicate orders
    const existingOrder = await orderModel.findOne({
      paymentReference: reference,
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order: existingOrder,
      });
    }

    const restaurant = await restaurantModel.findById(orderData.restaurantOwnerId)


    console.log(`orderData ${orderData.tableNumber}`)
   

    // create order
    const createdOrder = await orderModel.create({
      restaurantId: orderData.restaurantOwnerId,

      table: orderData.tableNumber,

      customerName: orderData.customerName,

      paymentMethod: orderData.paymentMethod,

      paymentStatus: "paid",

      paymentReference: reference,

      orderData: {
        lineItems: orderData.lineItems.map((item) => ({
          menuItemId: item.menuItemId,

          name: item.name,

          quantity: item.quantity,

          unitPrice: item.unitPrice,

          addons: (item.addons || []).map((addon) => ({
            addonId: addon.addonId,
            name: addon.name,
            price: addon.price,
          })),
        })),
      },


    
      total: orderData.total,
    });

      io.to(orderData.restaurantOwnerId).emit(
        "newOrder",
        {
          ...createdOrder.toObject(),
          restaurantName:
            restaurant?.businessName || "",
        }
      );


    console.log(createdOrder)

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: {...createdOrder, restaurantName: restaurant._doc.businessName},
    });
  } catch (error) {
    console.error(
      error?.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};




export const handlePayment = async (req, res) => {
  try {
    const { email, amount, phone, provider, split_code } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/charge",
      {
        email,
        amount,
        mobile_money: { phone, provider },
        currency: "GHS",
        split_code, // 💰 include your split code here
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);

    console.log(response)
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

export const refundPayment = async(req,res)=>{
  try{
    const {reference}= req.params
    const response = await axios.post(
        "https://api.paystack.co/refund",
        {
          transaction: reference,  // use Paystack’s transaction reference
          customer_note: "Order could not be processed, refunding payment.",
          merchant_note: "Restaurant system error.",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
);


res.json(response.data)




  }catch(error){
    console.log(error)
    res.status(500).json({error:"Payment refund failed"})
  }
}

export const createRestaurantSplit= async(req,res)=> {
  const {subaccount, total}= req.body
  const platformShare = 1; // ₵1 = 100 pesewas
  const restaurantShare = total - platformShare;

  const response = await axios.post(
    "https://api.paystack.co/split",
    {
      name: `Split for ${subaccount}`,
      type: "flat",
      currency: "GHS",
      subaccounts: [
        {
          subaccount:`ACCT${subaccount}`,
          share: restaurantShare
        }
      ],
      bearer_type: "account" // main account pays fees
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  console.log(response)
  console.log("Split created:", response.data.data.split_code);
  return res.json({success:true, splitCode: response.data.data.split_code});
}




export const payWithCash = async (
  req,
  res
) => {
  try {
    const {
      restaurantOwnerId,
      tableNumber,
      paymentMethod,
      customerName,
      lineItems,
      total,
    } = req.body;

    // validation
    if (!restaurantOwnerId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant ID is required",
      });
    }

    if (!tableNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Table number is required",
      });
    }

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name is required",
      });
    }

    if (
      !lineItems ||
      !Array.isArray(lineItems) ||
      lineItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order items are required",
      });
    }

    // get restaurant
    const restaurant =
      await restaurantModel.findById(
        restaurantOwnerId
      );

    // create order
    const newOrder =
      await orderModel.create({
        restaurantId:
          restaurantOwnerId,

        table: tableNumber,

        paymentMethod:
          paymentMethod || "cash",

        paymentStatus: "pending",

        paymentReference: "NA",

        customerName,

        orderData: {
          lineItems,
        },

        total,
      });

    // REALTIME SOCKET EMIT
    io.to(restaurantOwnerId).emit(
      "newOrder",
      {
        ...newOrder.toObject(),

        restaurantName:
          restaurant?.businessName ||
          "",
      }
    );

    return res.status(201).json({
      success: true,

      message:
        "Cash order placed successfully",

      data: {
        ...newOrder.toObject(),

        restaurantName:
          restaurant?.businessName ||
          "",
      },
    });
  } catch (error) {
    console.error(
      "PAY WITH CASH ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to place cash order",

      error: error.message,
    });
  }
};

