import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js"; // Assuming you have a Sequelize instance

const inspectionAcceptanceReport = sequelize.define(
  "inspectionAcceptanceReport",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    iarId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icsId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    risId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "purchase_orders", // FIX: table name
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      index: true,
    },
    purchaseOrderItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "purchase_order_items", // FIX: table name
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      index: true,
    },
    iarStatus: {
      type: DataTypes.ENUM("partial", "complete", "none"),
      defaultValue: "none",
      allowNull: true,
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
        "requisition issue slip",
      ),
      allowNull: true,
      defaultValue: "requisition issue slip", // Default value
    },
    tag: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "none", // Default value
    },
    isDeleted: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0,
    },
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    inventoryNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    itemName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
    // IAR-specific invoice (separate from PO main invoice)
    invoice: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Invoice number specific to this IAR receipt",
    },
    // IAR-specific invoice date
    invoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Invoice date specific to this IAR receipt",
    },
    // IAR-specific income field
    income: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Income info specific to this IAR",
    },
    // IAR-specific MDS field
    mds: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "MDS info specific to this IAR",
    },
    // IAR-specific details field
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Details specific to this IAR",
    },
    // PAR-specific signatory fields for per-ID assignment
    parReceivedFrom: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "PAR signatory - Received From name",
    },
    parReceivedFromPosition: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "PAR signatory - Received From position/role",
    },
    parReceivedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "PAR signatory - Received By name",
    },
    parReceivedByPosition: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "PAR signatory - Received By position",
    },
    parDepartment: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Department assigned for this PAR item",
    },
    parAssignedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Date when PAR ID was assigned",
    },
    // RIS-specific signatory fields for per-ID assignment
    risReceivedFrom: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "RIS signatory - Received From name",
    },
    risReceivedFromPosition: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "RIS signatory - Received From position/role",
    },
    risReceivedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "RIS signatory - Received By name",
    },
    risReceivedByPosition: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "RIS signatory - Received By position",
    },
    risDepartment: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Department assigned for this RIS item",
    },
    risAssignedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Date when RIS ID was assigned",
    },
    // ICS-specific signatory fields for per-ID assignment
    icsReceivedFrom: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ICS signatory - Received From name",
    },
    icsReceivedFromPosition: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ICS signatory - Received From position/role",
    },
    icsReceivedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ICS signatory - Received By name",
    },
    icsReceivedByPosition: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ICS signatory - Received By position",
    },
    icsDepartment: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Department assigned for this ICS item",
    },
    icsAssignedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Date when ICS ID was assigned",
    },
    // Purpose field for ICS and RIS printing
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Purpose field for ICS/RIS print reports (manually entered)",
    },
    // Remarks field for PAR printing
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Remarks field for PAR print reports (manually entered)",
    },
    // Split tracking fields
    splitGroupId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment:
        "Shared ID among all items created from the same split operation. Traces siblings.",
    },
    splitFromItemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment:
        "The original IAR item ID this record was split from. Traces back to source.",
    },
    splitIndex: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1-based index within the split group (1 = first split, etc.)",
    },
  },
  {
    tableName: "inspection_acceptance_report", // Specify the table name
    underscored: true,
    timestamps: true, // Sequelize will automatically manage createdAt and updatedAt
  },
);

// No association is needed here because ponumber is not a foreign key

export default inspectionAcceptanceReport;
