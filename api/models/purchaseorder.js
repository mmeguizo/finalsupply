import { DataTypes } from "sequelize";
import { sequelize } from "../db/connectDB.js";

const PurchaseOrder = sequelize.define("PurchaseOrder", {
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
}, {
  tableName: "purchase_orders", // Specify the table name
  underscored: true,
  timestamps: true, // Sequelize will automatically manage createdAt and updatedAt
});

// You may add associations if necessary (e.g., PurchaseOrder has many PurchaseOrderItems)
export default PurchaseOrder;


// import mongoose from "mongoose";

// const purchaseOrderSchema = new mongoose.Schema(
//   {
//     supplier: {
//       type: String,
//       required: true, // Adding 'required' constraint based on context
//     },
//     address: {
//       type: String,
//       required: true, // Assuming this should be required
//     },
//     ponumber: {
//       type: Number,
//       required: true, // Making sure PO number is required
//     },
//     modeofprocurement: {
//       type: String,
//       required: true, // Assuming this is necessary
//     },
//     email: {
//       type: String,
//       required: true,
//     },
//     telephone: {
//       type: Number,
//       required: true,
//     },
//     placeofdelivery: {
//       type: String,
//       required: true, // Making place of delivery required
//     },
//     dateofdelivery: {
//       type: Date,
//       required: true, // Required delivery date
//     },
//     dateofpayment: {
//       type: Date,
//       required: true, // Required payment date
//     },
//     deliveryterms: {
//       type: String,
//       required: true, // Assuming delivery terms are necessary
//     },
//     paymentterms: {
//       type: String,
//       required: true, // Payment terms should be required
//     },
//     invoice: {
//       type: String,
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true, // Amount should be required
//     },
//     status: {
//       type: String,
//       enum: ["partial", "close", "cancel", "completed", "pending"],
//       default: "pending", // Default status as 'pending'
//     },
//     date: {
//       type: Date,
//       default: Date.now,
//       required: true, // The creation date should be required
//     },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true, // Mongoose will automatically add 'createdAt' and 'updatedAt' fields
//   }
// );

// // Define the model and associate it with the collection in MongoDB
// const Purchaseorder = mongoose.model(
//   "Purchaseorders", // Name of the model (same as collection name)
//   purchaseOrderSchema,
//   "Purchaseorders" // Name of the MongoDB collection
// );

// export default Purchaseorder;


// // import mongoose from "mongoose";

// // const purchaseOrderSchema = new mongoose.Schema(
// //   {
// //     // userId: {
// //     //   type: mongoose.Schema.Types.ObjectId,
// //     //   ref: "User",
// //     //   required: true,
// //     // },
// //     supplier: {
// //       type: String,
// //       // required: true,
// //     },
// //     address: {
// //       type: String,
// //       // required: true,
// //     },
// //     ponumber: {
// //       type: Number,
// //       // required: true,
// //     },

// //     modeofprocurement: {
// //       type: String,
// //       // required: true,
// //     },
// //     email: {
// //       type: String,
// //       // required: true,
// //     },
// //     telephone: {
// //       type: Number,
// //       // required: true,
// //     },
// //     placeofdelivery: {
// //       type: String,
// //       // required: true,
// //     },
// //     dateofdelivery: {
// //       type: Date,
// //       // required: true,
// //     },
// //     dateofpayment: {
// //       type: Date,
// //       // required: true,
// //     },
// //     deliveryterms: {
// //       type: String,
// //       // required: true,
// //     },
// //     paymentterms: {
// //       type: String,
// //       // required: true,
// //     },
// //     invoice: {
// //       type: String,
// //       // required: true,
// //     },
// //     amount: {
// //       type: Number,
// //       required: true,
// //     },
// //     status: {
// //       type: String,
// //       enum: ["partial", "close", "cancel", "completed", "pending"],
// //       default: "pending",
// //     },
// //     date: {
// //       type: Date,
// //       default: Date.now,
// //       required: true,
// //     },
// //     isDeleted: {
// //       type: Boolean,
// //       default: false,
// //     },
// //   },

// //   { timestamps: true }
// // );

// // const Purchaseorder = mongoose.model(
// //   "Purchaseorders",
// //   purchaseOrderSchema,
// //   "Purchaseorders"
// // );

// // export default Purchaseorder;
