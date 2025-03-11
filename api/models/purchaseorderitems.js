import mongoose from "mongoose";

const purchaseOrderItemsSchema = new mongoose.Schema(
  {
    ponumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchaseorders",
      required: true,
      index: true,
    },
    item: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    unit: {
      type: String,
      // required: true,
    },
    quantity: {
      type: Number,
      // required: true,
    },
    unitcost: {
      type: Number,
      // required: true,
    },
    amount: {
      type: Number,
      // required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const PurchaseOrderItems = mongoose.model(
  "purchaseOrderItems",
  purchaseOrderItemsSchema,
  "purchaseOrderItems"
);

// purchaseOrderItemsSchema.index({ ponumber: 1 });
purchaseOrderItemsSchema.index({ isDeleted: 1 });

export default PurchaseOrderItems;
