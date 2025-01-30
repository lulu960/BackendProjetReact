const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    location: { type: String },
    likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
