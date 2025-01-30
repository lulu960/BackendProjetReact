const mongoose = require("mongoose");
require("dotenv").config();


const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://root:yoloswag369!@84.7.118.50:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName:"tinder",
        });
        console.log("MongoDB Connected...");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
