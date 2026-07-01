import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import InspectionAcceptanceReportForIAR from './previewDocumentFiles/InspectionAcceptanceReportForIAR';
import PropertyAcknowledgementReceipt from './previewDocumentFiles/propertyAcknowledgementReceipt';
import RequisitionAndIssueSlip from './previewDocumentFiles/requisitionAndIssueSlip';
import InventoryCustodianSlip from './previewDocumentFiles/inventoryCustodianSlip';
import { getInspectionReportTemplateForIAR } from './printDocumentFiles/inspectionAcceptanceRerportForIAR';
import { getPropertyAcknowledgementReciept } from './printDocumentFiles/propertyAcknowledgementReceipt';
import { getRequisitionAndIssueSlip } from './printDocumentFiles/requisitionAndIssueSlip';
import { getInventoryTemplate } from './printDocumentFiles/inventoryCustodianslip';
import { InspectionReportDialogPropsForIAR } from '../types/printReportModal/types';

type Props = InspectionReportDialogPropsForIAR & {
  poOverrides?: {
    invoice?: string;
    dateOfPayment?: string;
    income?: string;
    mds?: string;
    details?: string;
  };
};

export default function PrintReportDialogForIAR({
  open,
  handleClose,
  reportData,
  reportType = 'inspection',
  title,
  signatories = {},
  poOverrides,
}: Props) {
  const [showPrintView, setShowPrintView] = useState(false);
  const [iarDetails, setIarDetails] = useState('');

  // Compute a stable localStorage key from the set of item IDs
  const iarItems = Array.isArray(reportData) ? reportData : reportData ? [reportData] : [];
  const iarStorageKey =
    iarItems.length > 0
      ? `supply_podetails_iar_${iarItems
          .map((i: any) => i.id)
          .filter(Boolean)
          .sort()
          .join('_')}`
      : null;

  // Load persisted PO Details when the modal opens
  useEffect(() => {
    if (open && iarStorageKey) {
      setIarDetails(localStorage.getItem(iarStorageKey) || '');
    } else if (!open) {
      // reset when closed so stale value never flashes on next open before effect runs
      setIarDetails('');
    }
  }, [open, iarStorageKey]);

  console.log('reportData:', reportData);

  React.useEffect(() => {
    console.log('reportData:', reportData);
  }, [signatories]);

  const getReportTemplate = (data: any) => {
    return getInspectionReportTemplateForIAR(signatories, data, poOverrides, iarDetails);
  };

  const handleClosePrintView = () => {
    setShowPrintView(false);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getReportTemplate(reportData));
      printWindow.document.close();
      printWindow.focus();
      // Close the print window AFTER the user finishes printing (or cancels)
      printWindow.onafterprint = () => {
        printWindow.close();
        handleClose();
      };
      // Trigger the print dialog
      printWindow.print();
    } else {
      // Popup was blocked
      alert('Please allow popups to print the report.');
    }
  };

  // If print view is active, render the print-friendly report
  if (showPrintView) {
    return (
      <InspectionAcceptanceReportForIAR
        signatories={signatories}
        reportData={reportData}
        onClose={handleClosePrintView}
        poOverrides={poOverrides}
      />
    );
  }

  // Otherwise, show the dialog with preview
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <InspectionAcceptanceReportForIAR
          signatories={signatories}
          reportData={reportData}
          poOverrides={poOverrides}
        />
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="PO Details"
            value={iarDetails}
            onChange={(e) => {
              const val = e.target.value;
              setIarDetails(val);
              if (iarStorageKey) {
                if (val) localStorage.setItem(iarStorageKey, val);
                else localStorage.removeItem(iarStorageKey);
              }
            }}
            multiline
            rows={2}
            size="small"
            placeholder="Enter PO details for this IAR..."
          />
        </Box>
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
