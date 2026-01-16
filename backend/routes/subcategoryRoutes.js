const express = require("express");
const router = express.Router();

const {
  getSubcategories,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategoriesByCat,
} = require("../src/controllers/subcategoryController");
const { upload } = require("../middleware/upload");

router.get("/subcategories", getSubcategories);
router.get("/subcategory/category/:categoryId", getSubcategoriesByCat);
router.post("/subcategories", upload.single("subcategory_image"), addSubcategory);
router.put("/subcategories/:id", upload.single("subcategory_image"), updateSubcategory);
router.delete("/subcategories/:id", deleteSubcategory);

module.exports = router;