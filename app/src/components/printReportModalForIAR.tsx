import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import InspectionAcceptanceReportForIAR from "./previewDocumentFiles/InspectionAcceptanceReportForIAR";
import PropertyAcknowledgementReceipt from "./previewDocumentFiles/propertyAcknowledgementReceipt";
import RequisitionAndIssueSlip from "./previewDocumentFiles/requisitionAndIssueSlip";
import InventoryCustodianSlip from "./previewDocumentFiles/inventoryCustodianSlip";
import { getInspectionReportTemplateForIAR } from "./printDocumentFiles/inspectionAcceptanceRerportForIAR";
import { getPropertyAcknowledgementReciept } from "./printDocumentFiles/propertyAcknowledgementReceipt";
import { getRequisitionAndIssueSlip } from "./printDocumentFiles/requisitionAndIssueSlip";
import { getInventoryTemplate } from "./printDocumentFiles/inventoryCustodianslip";
import { InspectionReportDialogPropsForIAR } from "../types/printReportModal/types";

export default function PrintReportDialogForIAR({
  open,
  handleClose,
  reportData,
  reportType = "inspection",
  title,
  signatories = {},
}: InspectionReportDialogPropsForIAR) {

  const [showPrintView, setShowPrintView] = useState(false);

  const getReportTemplate = (data: any) => {
    return getInspectionReportTemplateForIAR(signatories, data);
  };

  const handleClosePrintView = () => {
    setShowPrintView(false);
  };

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(getReportTemplate(reportData));
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
    handleClose();
  };

  // If print view is active, render the print-friendly report
  if (showPrintView) {
    switch (reportType) {
      case "property":
        return (
          <PropertyAcknowledgementReceipt
            reportData={reportData}
            onClose={handleClosePrintView}
          />
        );
      case "requisition":
        return (
          <RequisitionAndIssueSlip
            reportData={reportData}
            onClose={handleClosePrintView}
          />
        );
      case "inventory":
        return (
          <InventoryCustodianSlip
            reportData={reportData}
            onClose={handleClosePrintView}
          />
        );
      case "inspection":
      default:
        return (
          <InspectionAcceptanceReportForIAR
            signatories={signatories}
            reportData={reportData}
            onClose={handleClosePrintView}
          />
        );
    }
  }

  // Otherwise, show the dialog with preview
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
  <InspectionAcceptanceReportForIAR signatories={signatories} reportData={reportData} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={handlePrintReport} variant="contained" color="primary">
          Print Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/*
 {reportType === "requisition" ? (
          <RequisitionAndIssueSlip reportData={reportData} />
        ) : reportType === "inspection" ? (
          <InspectionAcceptanceReportForIAR reportData={reportData} />
        ) : reportType === "inventory" ? (
          <InventoryCustodianSlip reportData={reportData} />
        ) : (
          <PropertyAcknowledgementReceipt reportData={reportData} />
        )}

*/