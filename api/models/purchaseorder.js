import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";
import PurchaseOrderItems from "./purchaseorderitems.js";
const PurchaseOrder = sequelize.define(
  "PurchaseOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    poNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    modeOfProcurement: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    placeOfDelivery: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dateOfDelivery: {
      type: DataTypes.DATEONLY, // Using DATEONLY for date type without time
      allowNull: false,
    },
    dateOfPayment: {
      type: DataTypes.DATEONLY, // Using DATEONLY for date type without time
      allowNull: false,
    },
    deliveryTerms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "partial",
        "closed",
        "cancel",
        "completed",
        "pending"
      ),
      allowNull: true,
      defaultValue: "pending", // Default status as 'pending'
    },
    completed_status_date : {
      type: DataTypes.DATEONLY, // Using DATEONLY for date type without time
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
    },
    supplier: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    invoice: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telephone: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "purchase_orders", // Specify the table name
    underscored: true,
    timestamps: true, // Sequelize will automatically manage createdAt and updatedAt
  }
);

// You may add associations if necessary (e.g., PurchaseOrder has many PurchaseOrderItems)

PurchaseOrder.hasMany(PurchaseOrderItems, { foreignKey: "purchaseOrderId" });
PurchaseOrderItems.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });
export default PurchaseOrder;
