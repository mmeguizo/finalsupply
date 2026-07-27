import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { InspectionReportDialogProps } from '../types/printReportModal/types';
import { capitalizeFirstLetter } from '../utils/generalUtils';
import useSignatoryStore from '../stores/signatoryStore';
import InspectionAcceptanceForReporting from './previewDocumentFiles/InspectionAcceptanceForReporting';
import { getInspectionReportTemplateForPrinting } from './printDocumentFiles/inspectionAcceptanceForReporting';

export default function ForPrintReporting({
  open,
  handleClose,
  reportData,
  title,
}: InspectionReportDialogProps) {
  const InspectorOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole('Inspector Officer')
  );
  const supplyOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole('Property And Supply Officer')
  );
  const receivedFrom = useSignatoryStore((state) => state.getSignatoryByRole('Recieved From'));

  console.log('reportData', reportData);
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
    const htmlContent = getReportTemplate(reportData);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      alert('Failed to create print frame.');
      return;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
        handleClose();
      }, 1000);
    }, 500);
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
