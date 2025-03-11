import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    supplier: {
      type: String,
      // required: true,
    },
    address: {
      type: String,
      // required: true,
    },
    ponumber: {
      type: Number,
      // required: true,
    },

    modeofprocurement: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      // required: true,
    },
    telephone: {
      type: Number,
      // required: true,
    },
    placeofdelivery: {
      type: String,
      // required: true,
    },
    dateofdelivery: {
      type: Date,
      // required: true,
    },
    dateofpayment: {
      type: Date,
      // required: true,
    },
    deliveryterms: {
      type: String,
      // required: true,
    },
    paymentterms: {
      type: String,
      // required: true,
    },
    // items: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "purchaseOrderItems",
    //   },
    // ],
    amount: {
      type: Number,
      required: true,
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

const Purchaseorder = mongoose.model(
  "Purchaseorders",
  purchaseOrderSchema,
  "Purchaseorders"
);

export default Purchaseorder;
