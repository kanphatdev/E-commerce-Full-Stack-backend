const prisma = require("../config/prisma");

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    // Validate order ID and order status
    if (!orderId || !orderStatus) {
      return res
        .status(400)
        .json({ message: "Order ID and order status are required" });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status
    const orderUpdate = await prisma.order.update({
      where: {
        id: Number(orderId), // Ensure orderId is a number
      },
      data: {
        orderStatus: orderStatus,
      },
    });

    res.status(200).json({
      message: "Order status updated successfully",
      order: orderUpdate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderAdmin = async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          products: {
            include: {
              product: true, // Assuming your schema supports this relation
            },
          },
          orderedBy: {
            select: {
              id: true,
              email: true,
              address: true, // Make sure the User model has 'address' field
            },
          },
        },
      });
  
      res.status(200).json(orders); // Use res.json() to send the response as JSON
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  