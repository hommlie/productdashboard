const { pool } = require("../../db");

exports.getUserByEmail = async (email) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? AND deleted_at IS NULL", [email]);
    return rows[0];
};

exports.updateLastLogin = async (id) => {
    await pool.query("UPDATE users SET updated_at = NOW() WHERE id = ?", [id]);
};
