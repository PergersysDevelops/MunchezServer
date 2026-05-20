import mongoose from "mongoose";
import { orderModel } from "../Models/Order.js"

export const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = "today" } = req.query;

    const restaurantId = req.user._id;

    const now = new Date();

    let startDate;

    if (period === "today") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
    }

    if (period === "week") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    }

    if (period === "month") {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
    }

    let orders = [];

    if (period === "custom") {
      const { from, to } = req.query;

      orders = await orderModel.find({
        restaurantId,
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      });
    } else {
      orders = await orderModel.find({
        restaurantId,
        createdAt: {
          $gte: startDate,
        },
      });
    }

    // TOTAL REVENUE
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    // TOTAL ORDERS
    const totalOrders = orders.length;

    // AVG ORDER VALUE
    const averageOrderValue =
      totalOrders > 0
        ? totalRevenue / totalOrders
        : 0;

    // ORDER STATUS COUNTS
    const orderStatusMap = {
      pending: 0,
      processing: 0,
      ready: 0,
    };

    orders.forEach((order) => {
      if (orderStatusMap[order.orderStatus] !== undefined) {
        orderStatusMap[order.orderStatus]++;
      }
    });

    const orderStatus = [
      {
        name: "Pending",
        value: orderStatusMap.pending,
        color: "#4285F4",
      },
      {
        name: "Processing",
        value: orderStatusMap.processing,
        color: "#FBBC04",
      },
      {
        name: "Ready",
        value: orderStatusMap.ready,
        color: "#34A853",
      },
    ];

    // SALES OVERVIEW
    const salesOverview = orders.map((order) => ({
      day: new Date(order.createdAt).toLocaleDateString(),
      value: Number(order.total),
    }));

    // RECENT ORDERS
    const recentOrders = orders
      .slice(-5)
      .reverse()
      .map((order) => ({
        id: order._id,
        table: `Table ${order.table}`,
        customer: order.customerName,
        items:
          order.orderData?.lineItems?.length || 0,
        amount: `GHS ${Number(order.total).toFixed(2)}`,
        status: order.orderStatus,
      }));

    // TOP SELLING ITEMS
    const itemMap = {};

    orders.forEach((order) => {
      order.orderData?.lineItems?.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = {
            name: item.name,
            sold: 0,
            revenue: 0,
          };
        }

        itemMap[item.name].sold += item.quantity;

        itemMap[item.name].revenue +=
          item.quantity * item.unitPrice;
      });
    });

    const topSellingItems = Object.values(itemMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        revenue: `GHS ${item.revenue.toFixed(2)}`,
      }));

    // PAYMENT SUMMARY
    const momoRevenue = orders
      .filter((o) => o.paymentMethod === "mobile_money")
      .reduce(
        (sum, o) => sum + Number(o.total),
        0
      );

    const cardRevenue = orders
      .filter((o) => o.paymentMethod === "card")
      .reduce(
        (sum, o) => sum + Number(o.total),
        0
      );

    const cashRevenue = orders
      .filter((o) => o.paymentMethod === "cash")
      .reduce(
        (sum, o) => sum + Number(o.total),
        0
      );

    const paymentSummary = [
      {
        method: "Mobile Money",
        amount: momoRevenue,
      },
      {
        method: "Card Payments",
        amount: cardRevenue,
      },
      {
        method: "Cash Payments",
        amount: cashRevenue,
      },
    ];

    // TODAY RESERVATIONS (placeholder)
    const todaysReservations = [];

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        salesOverview,
        orderStatus,
        recentOrders,
        topSellingItems,
        paymentSummary,
        todaysReservations,
      },
    });

    
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Analytics fetch failed",
    });
  }
};