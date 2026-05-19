export const getOrderAnalytics = async (
  req,
  res
) => {
  try {
    const restaurantId =
      req.user._id;

      
    // all orders for this restaurant
    const orders =
      await orderModel.find({
        restaurantId,
      });

    // total orders
    const totalOrders =
      orders.length;

    // pending orders
    const pendingOrders =
      orders.filter(
        (order) =>
          order.paymentStatus ===
          "pending"
      ).length;

    // completed orders
    const completedOrders =
      orders.filter(
        (order) =>
          order.completed === true
      ).length;

    // total revenue
    const totalRevenue =
      orders.reduce(
        (sum, order) => {
          return (
            sum +
            Number(
              order.total || 0
            )
          );
        },
        0
      );

    return res.status(200).json({
      success: true,

      analytics: {
        totalOrders,

        pendingOrders,

        completedOrders,

        totalRevenue,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch analytics",
      error: error.message,
    });
  }
};