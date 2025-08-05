import { Signatory } from "../signatory/signatoryTypes";

interface InspectionAcceptanceReportProps {
  reportData: {
    supplier?: string;
    poNumber?: string;
    poDate?: string;
    invoice?: string;
    invoiceDate?: string;
    department?: string;
    formatAmount?: string | number;
    items: Array<{
      itemNumber: string | number;
      unit: string;
      description: string;
      quantity: string | number;
      unitCost: string | number;
      amount: string | number;
      category?: string;
    }>;
    totalAmount?: string | number;
    dateInspected?: string;
    inspectionOfficer?: string;
    dateReceived?: string;
    isComplete?: boolean;
    supplyOfficer?: string;
  };
  signatories?: any;
  onPrint?: () => void;
  onClose?: () => void;
}

// ... existing code ...

interface InspectionAcceptanceReportPropsForRIS {
  reportData: [
    {
      id: string;
      itemName: string;
      purchaseOrderId: string;
      description: string;
      unit: string;
      quantity: number;
      unitCost: number;
      amount: number;
      actualQuantityReceived: number;
      category: string;
      isDeleted: boolean;
      tag: string;
      iarId: string;
      risId: string;
      formatAmount: string;
      formatUnitCost: string;
      PurchaseOrder: {
        poNumber: string | number;
        supplier: string;
        address: string;
        telephone: string;
        placeOfDelivery: string;
        dateOfDelivery: string;
        dateOfPayment: string;
        deliveryTerms: string;
        paymentTerms: string;
        category: string;
        status: string;
        amount: number;
        invoice: string;
      };
    },
  ];
  signatories?: any;
  onPrint?: () => void;
  onClose?: () => void;
}
interface InspectionAcceptanceReportPropsForIAR {
  reportData: {
    id: string;
    itemName: string;
    purchaseOrderId: string;
    description: string;
    unit: string;
    quantity: number;
    unitCost: number;
    amount: number;
    actualQuantityReceived: number;
    category: string;
    isDeleted: boolean;
    tag: string;
    iarId: string;
    formatAmount: string;
    formatUnitCost: string;
    iarStatus: string,
    PurchaseOrder: {
      poNumber: string | number;
      supplier: string;
      address: string;
      telephone: string;
      placeOfDelivery: string;
      dateOfDelivery: string;
      dateOfPayment: string;
      deliveryTerms: string;
      paymentTerms: string;
      category: string;
      status: string;
      amount: number;
      invoice: string;
    };
  };
  signatories?: any;
  onPrint?: () => void;
  onClose?: () => void;
}

// ... existing code ...

interface genericPreviewProps {
  reportData: any;
  signatories?: any;
  onPrint?: () => void;
  onClose?: () => void;
}

export type {
  InspectionAcceptanceReportProps,
  genericPreviewProps,
  InspectionAcceptanceReportPropsForIAR,
  InspectionAcceptanceReportPropsForRIS,
};
