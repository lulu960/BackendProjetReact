const { io } = require("socket.io-client");
const socket = io("ws://localhost:3000");

// Simuler une connexion
socket.emit("userConnected", "679ba0e01c37088594a1488b");

socket.on("receiveMessage", (data) => {
    console.log("📥 Message reçu :", data);
});

socket.emit("sendMessage", {
    sender: "679ba0e01c37088594a1488b",
    receiver: "679ba0a51c37088594a14888",
    message: "Salut !"
});
