const express = require("express");
const router = express.Router();

const {
    getProducts,
    getProduct,
    addProduct,
    updateProductData,
    removeProduct
} = require("../src/controllers/productController");
const { upload } = require("../middleware/upload");

router.get("/products", getProducts);
router.get("/products/:id", getProduct);
router.post("/products", upload.array("product_images", 10), addProduct);
router.put("/products/:id", upload.array("product_images", 10), updateProductData);
router.delete("/products/:id", removeProduct);

module.exports = router;
