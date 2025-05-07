interface InspectionReportDialogProps {
    open: boolean;
    handleClose: () => void;
    reportData?: any;
    reportType?: "inspection" | "property" | "requisition" | "inventory" | string;
    title?: string;
  }

  export type { InspectionReportDialogProps}