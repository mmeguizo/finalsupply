import PurchaseOrder from "../models/purchaseorder.js";
import PurchaseOrderItems from "../models/purchaseorderitems.js";
import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";

export function initAssociations() {
  // IAR -> PO
  inspectionAcceptanceReport.belongsTo(PurchaseOrder, {
    foreignKey: "purchaseOrderId", // maps to purchase_order_id
  });
  PurchaseOrder.hasMany(inspectionAcceptanceReport, {
    foreignKey: "purchaseOrderId",
  });

  // IAR -> PO Item
  inspectionAcceptanceReport.belongsTo(PurchaseOrderItems, {
    foreignKey: "purchaseOrderItemId", // maps to purchase_order_item_id
    as: "PurchaseOrderItem",
  });
  // Reverse is optional for your use-case
  // PurchaseOrderItems.hasMany(inspectionAcceptanceReport, {
  //   foreignKey: "purchaseOrderItemId",
  //   as: "IARs",
  // });

  // Debug after wiring associations
  console.log(
    "IAR associations:",
    Object.keys(inspectionAcceptanceReport.associations)
  );
}

// Debugging associations
console.log("IAR associations:", Object.keys(inspectionAcceptanceReport.associations));
// Expect: ['PurchaseOrder', 'PurchaseOrderItem']