import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js"; // Import sequelize connection

const User = sequelize.define(
  "User", // Model name (capitalized by convention)
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // NOTE: removed `unique: true` to avoid Sequelize `ALTER TABLE` trying to
      // add a UNIQUE key repeatedly which can hit MySQL's max index limit.
      // Create a single UNIQUE index manually in the database (or via a
      // dedicated migration) instead of relying on `sync({ alter: true })`.
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
     location : {
      type: DataTypes.ENUM("Talisay", "Fortune Town", "Alijis", "Binalbagan",),
      defaultValue: "Talisay",
    }
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
