// POST /initiate-payment
import axios from "axios";
import dotenv from "dotenv"
import { orderModel } from "../Models/Order.js";
// import { io } from "../server.js";

dotenv.config()

export const initializePayment = async (req, res) => {
  try {
    const { amount , orderData, restaurantId,table } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: "super.admin@pergersys.com",
        amount: amount, // convert to pesewas 
        callback_url: `${process.env.FRONTEND_BASE_URL}/m/${restaurantId}/table/${table}`,
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
      `${process.env.FRONTEND_BASE_URL}/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;
    // console.log(response)
    if (data.status === "success") {
      const newOrder = new orderModel({...JSON.parse(req.params.orderData), paid:"paid"})

      newOrder.save()
      io.emit("new_order", newOrder);
      
      return res.json({success:true, data})

    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Verification failed" });
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

