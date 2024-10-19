// import dependencies
const express = require("express");
// create express router
const router = express.Router();
// controller
const { authCheck } = require("../middleware/authCheck");
const { changeOrderStatus,getOrderAdmin } = require("../controller/admin");
// routing path
router.put("/user/order",authCheck,changeOrderStatus);
router.get("/admin/orders",authCheck,getOrderAdmin);
module.exports = router;