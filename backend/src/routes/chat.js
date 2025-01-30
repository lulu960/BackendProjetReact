const express = require("express");
const Message = require("../models/message");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware d'authentification
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

// ✅ Route pour envoyer un message
router.post("/send", auth, async (req, res) => {
    try {
        const { receiver, message } = req.body;
        const sender = req.user;

        // Vérifier que les deux utilisateurs ont matché
        const senderUser = await User.findById(sender);
        const receiverUser = await User.findById(receiver);

        if (!receiverUser || !senderUser.matches.includes(receiver)) {
            return res.status(403).json({ msg: "Vous ne pouvez pas envoyer de message à cet utilisateur." });
        }

        // Enregistrer le message en base de données
        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        res.json(newMessage);
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// ✅ Route pour récupérer les messages entre deux utilisateurs
router.get("/messages/:userId", auth, async (req, res) => {
    try {
        const sender = req.user;
        const receiver = req.params.userId;

        // Vérifier si les deux utilisateurs ont matché
        const senderUser = await User.findById(sender);
        if (!senderUser.matches.includes(receiver)) {
            return res.status(403).json({ msg: "Vous ne pouvez pas voir cette conversation." });
        }

        // Récupérer les messages entre les deux utilisateurs
        const messages = await Message.find({
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).send("Server error");
    }
});


router.get("/messages/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
        $or: [
            { sender: user1, receiver: user2 },
            { sender: user2, receiver: user1 }
        ]
    }).sort({ createdAt: 1 });

    res.json(messages);
});


module.exports = router;
