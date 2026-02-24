export const PURCHASE_ORDER_CATEGORIES = {
  PAR: "property acknowledgement receipt",
  ICS: "inventory custodian slip",
  RIS: "requisition issue slip",
} as const;

export const INITIAL_ITEM = {
  category: "",
  item: "",
  description: "",
  unit: "",
  quantity: 0,
  unitCost: 0,
  amount: 0,
  actualQuantityReceived: 0,
};
