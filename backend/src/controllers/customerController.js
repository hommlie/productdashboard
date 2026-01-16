const { getAllCustomers, getCustomerByPhone } = require('../models/customerModel');

async function listCustomers(req, res) {
    try {
        const customers = await getAllCustomers();
        res.json({ success: true, data: customers });
    } catch (error) {
        console.error("List customers error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function findCustomer(req, res) {
    try {
        const { phone } = req.query;
        const customer = await getCustomerByPhone(phone);
        res.json({ success: true, data: customer });
    } catch (error) {
        console.error("Find customer error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = { listCustomers, findCustomer };
