const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const Message = require("./models/message");
const User = require("./models/user");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

connectDB();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/match", require("./routes/match"));
app.use("/api/chat", require("./routes/chat"));

// Stocker les utilisateurs connectés
let connectedUsers = {};

io.on("connection", (socket) => {
    console.log(`🟢 Utilisateur connecté : ${socket.id}`);

    // Associer l'utilisateur au socket
    socket.on("userConnected", (userId) => {
        connectedUsers[userId] = socket.id;
        console.log(`👤 Utilisateur ${userId} connecté avec le socket ${socket.id}`);
    });

    // Envoyer un message à tous les utilisateurs (broadcast)
    socket.on("sendMessage", async (data) => {
        const { sender, receiver, message } = data;

        // Vérifier si les utilisateurs ont matché
        const senderUser = await User.findById(sender);
        if (!senderUser || !senderUser.matches.includes(receiver)) {
            return;
        }

        // Sauvegarder le message en base de données
        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        // Envoyer le message à TOUS les utilisateurs connectés
        io.emit("broadcastMessage", newMessage);

        console.log(`📩 Message envoyé de ${sender} à ${receiver}: ${message}`);
    });

    // Gérer la déconnexion des utilisateurs
    socket.on("disconnect", () => {
        console.log(`🔴 Utilisateur déconnecté : ${socket.id}`);

        // Retirer l'utilisateur de la liste
        Object.keys(connectedUsers).forEach(userId => {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
            }
        });
    });
});

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "connect-src 'self' ws://localhost:5000;");
    next();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serveur WebSocket actif sur ws://localhost:${PORT}`));
