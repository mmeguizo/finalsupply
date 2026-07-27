import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import InspectionAcceptanceReport from './previewDocumentFiles/InspectionAcceptanceReport';
import PropertyAcknowledgementReceipt from './previewDocumentFiles/propertyAcknowledgementReceipt';
import RequisitionAndIssueSlip from './previewDocumentFiles/requisitionAndIssueSlip';
import InventoryCustodianSlip from './previewDocumentFiles/inventoryCustodianSlip';
import { getInspectionReportTemplate } from './printDocumentFiles/inspectionAcceptanceRerport';
import { getPropertyAcknowledgementReciept } from './printDocumentFiles/propertyAcknowledgementReceipt';
import { getRequisitionAndIssueSlip } from './printDocumentFiles/requisitionAndIssueSlip';
import { getInventoryTemplate } from './printDocumentFiles/inventoryCustodianslip';
import { InspectionReportDialogProps } from '../types/printReportModal/types';
import { capitalizeFirstLetter } from '../utils/generalUtils';
import useSignatoryStore from '../stores/signatoryStore';

export default function PrintReportDialog({
  open,
  handleClose,
  reportData,
  reportType,
  title,
}: InspectionReportDialogProps) {
  const InspectorOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole('Inspector Officer')
  );
  const supplyOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole('Property And Supply Officer')
  );
  const receivedFrom = useSignatoryStore((state) => state.getSignatoryByRole('Recieved From'));

  console.log(reportData);

  //add the signatories to the data to be send
  let signatories = {
    inspectionOfficer: capitalizeFirstLetter(InspectorOffice?.name),
    supplyOfficer: capitalizeFirstLetter(supplyOffice?.name),
    receivedFrom: capitalizeFirstLetter(receivedFrom?.name),
  };

  const [showPrintView, setShowPrintView] = useState(false);

  const getReportTemplate = (data: any) => {
    // Determine the report template based on reportType
    switch (reportType) {
      case 'property':
        return getPropertyAcknowledgementReciept(signatories, data);
      case 'requisition':
        return getRequisitionAndIssueSlip(signatories, data);
      case 'inventory':
        return getInventoryTemplate(data);
      case 'inspection':
        return getInspectionReportTemplate(signatories, data);
      default:
        return getInspectionReportTemplate(signatories, data);
    }
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
    switch (reportType) {
      case 'property':
        return (
          <PropertyAcknowledgementReceipt reportData={reportData} onClose={handleClosePrintView} />
        );
      case 'requisition':
        return <RequisitionAndIssueSlip reportData={reportData} onClose={handleClosePrintView} />;
      case 'inventory':
        return <InventoryCustodianSlip reportData={reportData} onClose={handleClosePrintView} />;
      case 'inspection':
      default:
        return (
          <InspectionAcceptanceReport
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
        {reportType === 'requisition' ? (
          <RequisitionAndIssueSlip reportData={reportData} />
        ) : reportType === 'inspection' ? (
          <InspectionAcceptanceReport reportData={reportData} />
        ) : reportType === 'inventory' ? (
          <InventoryCustodianSlip reportData={reportData} />
        ) : (
          <PropertyAcknowledgementReceipt reportData={reportData} />
        )}
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
