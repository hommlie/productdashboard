const { pool } = require("../../db");

exports.getSettings = async () => {
    const [rows] = await pool.query("SELECT * FROM settings LIMIT 1");
    return rows[0];
};

exports.updateSettings = async (data) => {
    // Check if settings exist, if not insert, else update
    const [existing] = await pool.query("SELECT id FROM settings LIMIT 1");

    if (existing.length === 0) {
        const [result] = await pool.query(
            "INSERT INTO settings (minimum_order_amount, free_delivery_min_amount, delivery_charge) VALUES (?, ?, ?)",
            [data.minimum_order_amount || 0, data.free_delivery_min_amount || 0, data.delivery_charge || 0]
        );
        return result;
    } else {
        const [result] = await pool.query(
            "UPDATE settings SET minimum_order_amount = ?, free_delivery_min_amount = ?, delivery_charge = ? WHERE id = ?",
            [data.minimum_order_amount || 0, data.free_delivery_min_amount || 0, data.delivery_charge || 0, existing[0].id]
        );
        return result;
    }
};
