const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../models/productModel");

exports.getProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        res.json({ success: true, data: products });
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const {
            subcategory_id,
            product_name,
            product_desc,
            contains,
            product_price,
            product_discount_price,
            tax_percentage,
            tax_type,
            estimated_time,
            stock,
            sort_order,
            shipping_cost,
            is_return,
            return_days,
            is_recomanded,
            payment_mode,
            rating,
            total_reviews,
            faqs,
            faqs_for_mobile,
            location,
            includes,
            excludes
        } = req.body;

        const images = req.files ? req.files.map(f => f.filename) : [];
        const image = JSON.stringify(images);
        const user_id = 1; // Temporary user_id

        // Ensure JSON fields are valid
        const ensureJson = (val) => {
            if (!val) return JSON.stringify([]);
            try {
                JSON.parse(val);
                return val;
            } catch (e) {
                return JSON.stringify(val);
            }
        };

        const productId = await createProduct({
            user_id,
            subcategory_id,
            product_name,
            product_image: image,
            product_desc,
            contains: ensureJson(contains),
            product_price,
            product_discount_price,
            tax_percentage,
            tax_type,
            estimated_time,
            stock: Number(stock) || 0,
            product_status: 1, // Default active
            status: 1, // Default not deleted
            sort_order,
            shipping_cost: Number(shipping_cost) || 0,
            is_return: Number(is_return) || 0,
            return_days: return_days ? Number(return_days) : null,
            is_recomanded: Number(is_recomanded) || 0,
            payment_mode: Number(payment_mode) || 0,
            rating: Number(rating) || 0,
            total_reviews: Number(total_reviews) || 0,
            faqs: ensureJson(faqs),
            faqs_for_mobile: ensureJson(faqs_for_mobile),
            location,
            includes,
            excludes
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            productId
        });
    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateProductData = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => f.filename);
            let existingImages = [];
            if (req.body.existing_images) {
                try {
                    existingImages = JSON.parse(req.body.existing_images);
                } catch (e) {
                    existingImages = [];
                }
            }
            updateData.product_image = JSON.stringify([...existingImages, ...newImages]);
        } else if (req.body.existing_images) {
            // If no new files but existing_images loop changes (e.g. deletion)
            try {
                const existingImages = JSON.parse(req.body.existing_images);
                updateData.product_image = JSON.stringify(existingImages);
            } catch (e) { }
        }

        // Ensure JSON fields are valid if provided
        const jsonFields = ['contains', 'faqs', 'faqs_for_mobile'];
        jsonFields.forEach(field => {
            if (updateData[field] !== undefined) {
                try {
                    JSON.parse(updateData[field]);
                } catch (e) {
                    updateData[field] = JSON.stringify(updateData[field] || "");
                }
            }
        });

        // Ensure numeric values for numeric/boolean fields
        const numericFields = [
            'product_status', 'status', 'stock', 'sort_order',
            'shipping_cost', 'is_return', 'return_days', 'is_recomanded', 'payment_mode',
            'rating', 'total_reviews', 'subcategory_id', 'product_price', 'product_discount_price', 'tax_percentage'
        ];

        numericFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateData[field] = updateData[field] === "" || updateData[field] === null ? null : Number(updateData[field]);
            }
        });

        await updateProduct(id, updateData);
        res.json({ success: true, message: "Product updated successfully" });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.removeProduct = async (req, res) => {
    try {
        await deleteProduct(req.params.id);
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
