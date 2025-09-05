import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";
import PurchaseOrder from "./purchaseorder.js";
import Role from "./role.js"; // new role model

const Signatory = sequelize.define(
  "Signatory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // store role name as string so roles can be managed in a roles table
    role: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    // optional foreign key to roles table (keeps referential link)
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "purchase_orders",
        key: "id",
      },
    },
    isDeleted: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "signatories",
    underscored: true,
    timestamps: true,
  }
);

// Associations
Signatory.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });
PurchaseOrder.hasMany(Signatory, { foreignKey: "purchaseOrderId" });

// optional association to Role
Signatory.belongsTo(Role, { foreignKey: "roleId" });
Role.hasMany(Signatory, { foreignKey: "roleId" });

export default Signatory;
