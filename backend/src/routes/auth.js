const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const router = express.Router();

// Inscription
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, age, gender, location } = req.body;
        let user = await User.findOne({ email });

        if (user) return res.status(400).json({ msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, age, gender, location });
        await user.save();

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ token, userId: user.id });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Connexion
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ token, userId : user.id });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

module.exports = router;
