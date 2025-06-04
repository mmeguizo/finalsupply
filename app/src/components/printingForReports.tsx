import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { InspectionReportDialogProps } from "../types/printReportModal/types";
import { capitalizeFirstLetter } from "../utils/generalUtils";
import useSignatoryStore from "../stores/signatoryStore";
import InspectionAcceptanceForReporting  from "./previewDocumentFiles/InspectionAcceptanceForReporting";
import {getInspectionReportTemplateForPrinting} from "./printDocumentFiles/inspectionAcceptanceForReporting";

export default function ForPrintReporting({
  open,
  handleClose,
  reportData,
  title,
}: InspectionReportDialogProps) {
  const InspectorOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Inspector Officer")
  );
  const supplyOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Property And Supply Officer")
  );
  const receivedFrom = useSignatoryStore((state) =>
    state.getSignatoryByRole("Recieved From")
  );

  console.log("reportData", reportData);
  //add the signatories to the data to be send
  let signatories = {
    inspectionOfficer: capitalizeFirstLetter(InspectorOffice?.name),
    supplyOfficer: capitalizeFirstLetter(supplyOffice?.name),
    receivedFrom: capitalizeFirstLetter(receivedFrom?.name),
  };

  const [showPrintView, setShowPrintView] = useState(false);

  const getReportTemplate = (data: any) => {
    // Determine the report template based on reportType
    return getInspectionReportTemplateForPrinting(signatories, data);
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
    return (
      <InspectionAcceptanceForReporting
        signatories={signatories}
        reportData={reportData}
        onClose={handleClosePrintView}
      />
    );
  }

  // Otherwise, show the dialog with preview
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Inspection Acceptance Report</DialogTitle>
      <DialogContent>
        <InspectionAcceptanceForReporting reportData={reportData} />
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
