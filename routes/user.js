// import dependencies
const express = require("express");
// create express router
const router = express.Router();
// Import controllers
const {
  listUser,
  changeStatus,
  changeRole,
  userCart,
  getUserCart,
  emptyCart,
  saveAddress,
  saveOrder,
  getOrder,
} = require("../controller/user");
const { authCheck, adminCheck } = require("../middleware/authCheck");
// route
router.get("/users", authCheck, adminCheck, listUser);
router.post("/change-status", authCheck, adminCheck, changeStatus);
router.post("/change-role", authCheck, adminCheck, changeRole);

router.get("/user/cart", authCheck, getUserCart);
router.post("/user/cart", authCheck, userCart);
router.delete("/user/cart", authCheck, emptyCart);
router.post("/user/address", authCheck, saveAddress);
router.post("/user/order", authCheck, saveOrder);
router.get("/user/order", authCheck, getOrder);

module.exports = router;
