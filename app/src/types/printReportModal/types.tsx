interface InspectionReportDialogProps {
    open: boolean;
    handleClose: () => void;
    reportData?: any;
    reportType?: "inspection" | "property" | "requisition" | "inventory" | string;
    title?: string;
  }
interface InspectionReportDialogPropsForIAR {
    open: boolean;
    handleClose: () => void;
    reportData?: any;
    reportType?: "inspection" | "property" | "requisition" | "inventory" | string;
    title?: string;
    signatories : any
  }

  export type { InspectionReportDialogPropsForIAR , InspectionReportDialogProps}