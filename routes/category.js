// import dependencies
const express = require("express");
const { create, list, remove } = require("../controller/category");
const { adminCheck, authCheck } = require("../middleware/authCheck");
// create express router
const router = express.Router();
router.post("/category",authCheck,adminCheck, create);
router.get("/category",authCheck,adminCheck,list);
router.delete("/category/:id",authCheck,adminCheck, remove);
module.exports = router;