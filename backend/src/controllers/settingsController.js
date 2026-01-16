const { getSettings, updateSettings } = require("../models/settingsModel");

exports.getSystemSettings = async (req, res) => {
    try {
        const settings = await getSettings();
        res.json({
            success: true,
            data: settings || { minimum_order_amount: 0, free_delivery_min_amount: 0 }
        });
    } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateSystemSettings = async (req, res) => {
    try {
        await updateSettings(req.body);
        res.json({ success: true, message: "Settings updated successfully" });
    } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
