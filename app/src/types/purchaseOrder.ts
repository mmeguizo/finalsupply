export interface PurchaseOrderItem {
  category: string;
  item: string;
  description: string;
  unit: string;
  quantity: number;
  unitcost: number;
  amount: number;
  actualquantityrecieved: number;
}

export interface PurchaseOrderFormData {
  ponumber: string;
  supplier: string;
  address: string;
  placeofdelivery: string;
  dateofpayment: Date | null;
  items: PurchaseOrderItem[];
  amount: number;
  status: string;
  invoice: string;
}

export interface PurchaseOrderModalProps {
  open: boolean;
  handleClose: () => void;
  purchaseOrder: any | null;
  handleSave: (formData: any) => void;
  isSubmitting: boolean;
}
