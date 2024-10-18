const prisma = require("../config/prisma");

exports.listUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        address: true,
      },
    });
    res.send(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};
exports.changeStatus = async (req, res) => {
  try {
    //code
    const { id, enabled } = req.body;
    console.log(id, enabled);
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { enabled: enabled },
    });

    res.send("Update Status Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.changeRole = async (req, res) => {
  try {
    //code
    const { id, role } = req.body;

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: role },
    });

    res.send("Update Role Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        id: Number(req.user.id),
      },
    });

    // delete old cart items
    await prisma.productOnCart.deleteMany({
      where: {
        cart: {
          orderedById: user.id,
        },
      },
    });
    // delete old cart
    await prisma.cart.deleteMany({
      where: {
        orderedById: user.id,
      },
    });
    // function: Prepare products
    const products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));
    // function:Calculate the sum of the cartTotal
    const cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );
    // create the New Cart to the database
    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products,
        },
        cartTotal: cartTotal,
        orderedById: user.id,
      },
    });
    res.send(newCart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};
exports.getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    res.json({
      products: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};
exports.emptyCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
    });
    if (!cart) {
      return res.status(400).json({ message: "server error" });
    }
    await prisma.productOnCart.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    const result = await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id),
      },
    });
    res.json({ message: " cart empty success", deletedCount: result.count });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "No cart" });
  }
};
exports.saveAddress = async (req, res) => {
  try {
    const { address } = req.body;

    // Validate that the address is provided
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    // Update the user's address
    const addressUser = await prisma.user.update({
      where: {
        id: Number(req.user.id),
      },
      data: {
        address: address,
      },
    });

    res
      .status(200)
      .json({ message: "Address updated successfully", user: addressUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.saveOrder = async (req, res) => {
  try {
    // Step 1: Get user cart
    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: true,
      },
    });

    // Step 2: Check if the cart is empty
    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Step 3: Check product quantities
    for (const item of userCart.products) {
      const product = await prisma.product.findUnique({
        where: {
          id: item.productId,
        },
        select: {
          quantity: true,
          title: true,
        },
      });

      // Check if product exists and if there is enough stock
      if (!product || item.count > product.quantity) {
        return res.status(400).json({
          message: `Sorry, ${product?.title || "product"} is sold out`,
        });
      }
    }

    // Step 4: Create a new order
    const newOrder = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: { id: req.user.id },
        },
        cartTotal: userCart.cartTotal,
      },
    });

    // Step 5: Update product stock and sold count
    await Promise.all(
      userCart.products.map((item) =>
        prisma.product.update({
          where: {
            id: item.productId,
          },
          data: {
            quantity: {
              decrement: item.count,
            },
            sold: {
              increment: item.count, // Fixed the spelling
            },
          },
        })
      )
    );

    // Step 6: Clear the cart after successful order creation
    await prisma.cart.deleteMany({
      where: {
        orderedById: Number(req.user.id), // Fixed to match the cart's owner
      },
    });

    // Step 7: Send the new order as the response
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findMany({
      where: {
        orderedById: Number(req.user.id),
      },
      include:{
        products:{
          include:{
            product:true,
          }
        }
      }
    });
    if (order.length === 0) {
      res.status(400).json({ message: "no order" });
    }
    res.send(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};
