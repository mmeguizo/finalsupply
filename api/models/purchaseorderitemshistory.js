import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";
import PurchaseOrderItems from "./purchaseorderitems.js";

const PurchaseOrderItemsHistory = sequelize.define(
  "PurchaseOrderItemsHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    purchaseOrderItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "purchase_order_items",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      index: true,
    },
    previousQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    newQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previousActualQuantityReceived: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    newActualQuantityReceived: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previousAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    newAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    changeType: {
      type: DataTypes.ENUM("quantity_update", "received_update", "amount_update", "marking_complete", "item_creation", "po_completed", "item_details_update"),
      allowNull: false,
    },
    changedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    changeReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "purchase_order_items_history",
    underscored: true,
    timestamps: true,
  }
);

// Set up association with PurchaseOrderItems
PurchaseOrderItemsHistory.belongsTo(PurchaseOrderItems, {
  foreignKey: "purchaseOrderItemId",
});

PurchaseOrderItems.hasMany(PurchaseOrderItemsHistory, {
  foreignKey: "purchaseOrderItemId",
});

export default PurchaseOrderItemsHistory;