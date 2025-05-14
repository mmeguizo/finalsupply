import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js"; // Assuming you have a Sequelize instance

const PurchaseOrderItems = sequelize.define(
  "PurchaseOrderItems",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    iarId : {
      type: DataTypes.STRING,
      allowNull: true,
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "purchaseOrders", // Assuming the table for purchase orders is named 'purchaseOrders'
        key: "id", // The referenced column in the 'purchaseOrders' table
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      index: true, // Index for optimization
    },
    itemName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    actualQuantityReceived: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    category: {
      type: DataTypes.ENUM(
        "property acknowledgement reciept",
        "inventory custodian slip",
        "requisition issue slip"
      ),
      allowNull: true,
      defaultValue: "requisition issue slip", // Default value
    },
    tag : {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "none", // Default value
    },
    isDeleted: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "purchase_order_items", // Specify the table name
    underscored: true,
    timestamps: true, // Sequelize will automatically manage createdAt and updatedAt
  }
);

// No association is needed here because ponumber is not a foreign key

export default PurchaseOrderItems;
