import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, // Database Name
  process.env.MYSQL_USER, // Username
  process.env.MYSQL_PASSWORD, // Password
  {
    host: process.env.MYSQL_HOST, // MySQL Server Host
    dialect: "mysql", // Use MySQL as the database
    logging: false, // Set to true to enable SQL query logging
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected!");
  } catch (error) {
    console.error("❌ MySQL Connection Failed:", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await sequelize.close();
    console.log("🔌 MySQL Disconnected");
  } catch (error) {
    console.error("❌ Error while disconnecting from MySQL:", error);
  }
};

// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       maxPoolSize: 20,
//       minPoolSize: 5,
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 45000,
//     });

//     console.log(
//       `MongoDB Connected: ${conn.connection.name.toLocaleUpperCase()}`
//     );

//     // Handle connection errors after initial connection
//     mongoose.connection.on("error", (err) => {
//       console.error("MongoDB connection error:", err);
//     });

//     mongoose.connection.on("disconnected", () => {
//       console.log("MongoDB disconnected");
//     });
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// export const disconnectDB = async () => {
//   try {
//     await mongoose.disconnect();
//     console.log("MongoDB connection closed");
//   } catch (error) {
//     console.error("Error while disconnecting from MongoDB:", error);
//     process.exit(1);
//   }
// };
