const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

exports.authCheck = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;
   

    if (!headerToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = headerToken.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token format invalid" });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode;

    const user = await prisma.user.findFirst({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.enabled) {
      return res.status(403).json({ message: "Account access denied" });
    }

    req.user = user; // Store the user object for later use (adminCheck)
    next();
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Token validation failed" });
  }
};

exports.adminCheck = (req, res, next) => {
  try {
    const { role } = req.user; // The user is already stored in req.user from authCheck

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied: admin only" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying admin status" });
  }
};