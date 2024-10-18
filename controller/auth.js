const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

// Register controller
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate that email and password are not empty
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if the user already exists
    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password before saving it to the database
    const hashPassword = await bcrypt.hash(password, 10);

    // Create new user
    await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
      },
    });

    // If successful, send a success message
    res.send("Success! Registration completed.");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error during registration" });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate that email and password are not empty
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find the user by email
    const user = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token with user information
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role, // Assuming 'role' exists in the database schema
    };

    jwt.sign(payload, "akatsuki", { expiresIn: "1d" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: "Error generating token" });
      }

      // Return the token and payload
      return res.status(200).json({ payload, token });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error during login" });
  }
};
exports.currentUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
      select:{
        id:true,
        email:true,
        name: true,
        role: true
      }
    });
    res.json({user});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};