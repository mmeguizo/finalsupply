import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Align with other models (users, department) which use is_active for soft enabling/disabling
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isDeleted: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "roles",
    underscored: true,
    timestamps: true,
  }
);

export default Role;