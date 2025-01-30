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

// Stocker les utilisateurs connectés (clé = userId, valeur = socket.id)
let connectedUsers = {};

io.on("connection", (socket) => {
    console.log(`🟢 Utilisateur connecté : ${socket.id}`);

    // Associer un userId à un socket lorsqu'il se connecte
    socket.on("userConnected", (userId) => {
        connectedUsers[userId] = socket.id;
        console.log(`👤 Utilisateur ${userId} est en ligne.`);
    });

    // Envoyer un message uniquement aux utilisateurs qui ont matché
    socket.on("sendMessage", async (data) => {
        const { sender, receiver, message } = data;

        // Vérifier si les utilisateurs ont matché
        const senderUser = await User.findById(sender);
        if (!senderUser || !senderUser.matches.includes(receiver)) {
            console.log(`❌ Impossible d'envoyer le message : ${sender} et ${receiver} ne sont pas matchés.`);
            return;
        }

        // Sauvegarder le message en base de données
        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        // Vérifier si le destinataire est en ligne
        if (connectedUsers[receiver]) {
            io.to(connectedUsers[receiver]).emit("receiveMessage", newMessage);
            console.log(`📩 Message envoyé à ${receiver}`);
        }

        // Toujours envoyer une copie du message à l'expéditeur
        io.to(socket.id).emit("receiveMessage", newMessage);
    });

    // Gérer la déconnexion des utilisateurs
    socket.on("disconnect", () => {
        console.log(`🔴 Utilisateur déconnecté : ${socket.id}`);

        // Retirer l'utilisateur de la liste des connectés
        Object.keys(connectedUsers).forEach(userId => {
            if (connectedUsers[userId] === socket.id) {
                console.log(`👤 Utilisateur ${userId} est hors ligne.`);
                delete connectedUsers[userId];
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Serveur WebSocket actif sur ws://localhost:${PORT}`));
