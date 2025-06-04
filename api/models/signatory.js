import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";
import PurchaseOrder from "./purchaseorder.js";

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
    role: {
      type: DataTypes.ENUM(
        "Inspector Officer", 
        "Property And Supply Officer", 
        "Recieved From", 
        "Recieved By"
      ),
      allowNull: false,
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
    }
  },
  {
    tableName: "signatories",
    underscored: true,
    timestamps: true, // Will manage createdAt and updatedAt automatically
  }
);

// Define associations - assuming signatories are related to purchase orders
Signatory.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });
PurchaseOrder.hasMany(Signatory, { foreignKey: "purchaseOrderId" });

export default Signatory;
