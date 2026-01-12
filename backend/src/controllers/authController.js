const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserByEmail, updateLastLogin } = require("../models/authModel");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Note: If passwords are not hashed, bcrypt.compare will fail. 
        // If you are using plain text for testing, change this to a direct comparison.
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Temporary: If bcrypt fails, check if it's a plain text match for legacy compatibility
            if (password === user.password) {
                console.warn("User logged in with plain text password. Please hash all passwords.");
            } else {
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "24h" }
        );

        await updateLastLogin(user.id);

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.logout = (req, res) => {
    // Logout is handled by the frontend by clearing the token
    res.json({ success: true, message: "Logout successful" });
};
