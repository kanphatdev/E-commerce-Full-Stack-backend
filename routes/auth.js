// import dependencies
const express = require("express");
// controller
const { register, login, currentUser } = require("../controller/auth");
const { authCheck, adminCheck } = require("../middleware/authCheck");
// create express router
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/current-user",authCheck, currentUser);
router.post("/current-admin",authCheck,adminCheck, currentUser);
module.exports = router;