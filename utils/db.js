import mongoose from "mongoose";

const db = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("✅ MongoDB connected successfully!");
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error.message);
    });
};

export default db;
