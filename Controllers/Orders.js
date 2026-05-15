import { orderModel } from "../Models/Order.js";

export const getAllOrders = async (req, res) => {
  try {
    const restaurantId  = req.user._id;

    // Fetch all restaurant tables
    const orders = await orderModel
      .find({
        restaurantId,
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      count: orders.length,
      data: orders,
    });
    console.log(orders)
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};


export const togglePaidStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // const { outOfStock } = req.body;

    const item = await orderModel.findOneAndUpdate(
      {
        _id: id,
        restaurantId: req.user._id,
      },
      {
        paymentStatus:"paid",
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


