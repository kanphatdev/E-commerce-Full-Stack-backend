// import dependencies
const express = require("express");
const {
  create,
  list,
  update,
  read,
  remove,
  listby,
  searchFilters,
  createImages,
  removeImage
} = require("../controller/product");
const {adminCheck,authCheck}= require("../middleware/authCheck")
// create express router
const router = express.Router();

router.post("/product", create);
router.get("/products/:count", list);
router.put("/product/:id", update);
router.get("/product/:id", read);
router.delete("/product/:id", remove);
router.post("/productby", listby);
router.post("/search/filters", searchFilters);
router.post('/images', authCheck, adminCheck, createImages)
router.post('/removeimages', authCheck, adminCheck, removeImage)
module.exports = router;
