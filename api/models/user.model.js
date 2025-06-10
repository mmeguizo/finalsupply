import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js"; // Import sequelize connection

const User = sequelize.define(
  "User", // Model name (capitalized by convention)
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // firstname: {
    //   type: DataTypes.STRING,
    // },
    // lastname: {
    //   type: DataTypes.STRING,
    // },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    employee_id: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    department : {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    position : {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    profile_pic: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "others"),
      defaultValue: "male",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },
  },
  {
    // Add some additional settings
    timestamps: true, // Sequelize automatically adds `created_at` and `updated_at` fields
    tableName: "users", // Name of the table in MySQL
    underscored: true, // Converts camelCase field names to snake_case
  }
);

// Export the model
export default User;
