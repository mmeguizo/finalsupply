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
        category? : string;
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

  interface genericPreviewProps {
    reportData: any;
    signatories?: any
    onPrint?: () => void;
    onClose?: () => void;
  }
  

  export type {InspectionAcceptanceReportProps , genericPreviewProps}