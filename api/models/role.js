import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js"; // Import sequelize connection

const Role = sequelize.define(
  "Role", // Model name (capitalized by convention)
  {
   name : {
    type : DataTypes.STRING,
    allowNull : false,
    unique : true
   },
    description: {
      type: DataTypes.STRING,
      allowNull: true, // Description can be null
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    // Add some additional settings
    timestamps: true, // Sequelize automatically adds `created_at` and `updated_at` fields
    tableName: "roles", // Name of the table in MySQL
    underscored: true, // Converts camelCase field names to snake_case
  }
);

// Export the model
export default Role;
