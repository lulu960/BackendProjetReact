const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware d'auth
const auth = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid token" });
    }
};

// Liker un utilisateur
router.post("/like/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const likedUser = await User.findById(req.params.id);

        if (!likedUser) return res.status(404).json({ msg: "User not found" });

        // Ajouter le like
        if (!user.likedUsers.includes(likedUser._id)) {
            user.likedUsers.push(likedUser._id);
            await user.save();
        }

        // Vérifier si c'est un match
        if (likedUser.likedUsers.includes(user._id)) {
            user.matches.push(likedUser._id);
            likedUser.matches.push(user._id);
            await user.save();
            await likedUser.save();
            return res.json({ msg: "It's a match!", match: true });
        }

        res.json({ msg: "Like enregistré", match: false });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

router.get("/matches", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).populate("matches", "name email");

        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json(user.matches);
    } catch (err) {
        res.status(500).send("Server error");
    }
});


router.get("/likes", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).populate("likedUsers", "name email");
        
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json(user.likedUsers);
    } catch (err) {
        res.status(500).send("Server error");
    }
});

router.get("/users/swipe", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Exclure l'utilisateur actuel et ceux déjà likés ou matchés
        const users = await User.find({
            _id: { $ne: userId },
            likedUsers: { $nin: [userId] },
            matches: { $nin: [userId] },
        }).limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});


module.exports = router;
