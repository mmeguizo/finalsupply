import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import InspectionAcceptanceReport from './previewDocumentFiles/InspectionAcceptanceReport';
import PropertyAcknowledgementReceipt from './previewDocumentFiles/propertyAcknowledgementReceipt';
import RequisitionAndIssueSlip from './previewDocumentFiles/requisitionAndIssueSlip';
import InventoryCustodianSlip from './previewDocumentFiles/inventoryCustodianSlip';
import { getInspectionReportTemplate } from './printDocumentFiles/inspectionAcceptanceRerport';
import { getPropertyAcknowledgementReciept } from './printDocumentFiles/propertyAcknowledgementReceipt';
import { getRequisitionAndIssueSlip } from './printDocumentFiles/requisitionAndIssueSlip';
import { getInventoryTemplateForICS } from './printDocumentFiles/inventoryCustodianslipPrinting';
import { InspectionReportDialogPropsForIAR } from '../types/printReportModal/types';
import { useMutation } from '@apollo/client';
import { UPDATE_ICSID, UPDATE_ITEM_PURPOSE, UPDATE_ICS_DETAILS } from '../graphql/mutations/inventoryIAR.mutation';
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS } from '../graphql/queries/inspectionacceptancereport.query';
export default function PrintReportDialogForICS({
  open,
  handleClose,
  reportData,
  reportType,
  title,
  signatories,
}: InspectionReportDialogPropsForIAR) {
  const [updateICSid] = useMutation(UPDATE_ICSID, {
    refetchQueries: [{ query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS }],
  });

  const [updatePurpose] = useMutation(UPDATE_ITEM_PURPOSE);
  const [updateIcsDetails] = useMutation(UPDATE_ICS_DETAILS, {
    refetchQueries: [{ query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS }],
  });
  const [purpose, setPurpose] = useState('');
  const [icsDetails, setIcsDetails] = useState('');

  // Determine if this is a single item print (saves to DB) or multi-select (temporary)
  const items = Array.isArray(reportData) ? reportData : reportData ? [reportData] : [];
  const isSingleItem = items.length === 1;
  const hasNoDetails = isSingleItem && !items[0]?.icsDetails;

  // Pre-fill purpose and icsDetails from saved data
  useEffect(() => {
    if (open) {
      setPurpose(items[0]?.purpose || '');
      // For single item, use saved icsDetails; for multi-select, start empty
      setIcsDetails(isSingleItem ? (items[0]?.icsDetails || '') : '');
    }
  }, [open, reportData]);

  const getReportTemplate = (data: any) => {
    return getInventoryTemplateForICS(signatories, data, purpose, icsDetails);
  };

  const handlePrintReport = async () => {
    try {
      // Extract just the IDs from the reportData
      const itemIds = items.map((item) => item.id);

      // Save purpose to DB if entered
      if (purpose.trim()) {
        await updatePurpose({
          variables: { ids: itemIds, purpose: purpose.trim() },
        });
      }

      // For single item print, save icsDetails to database
      if (isSingleItem && icsDetails.trim()) {
        await updateIcsDetails({
          variables: { id: items[0].id, icsDetails: icsDetails.trim() },
        });
      }

      // Continue with printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(getReportTemplate(reportData));
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
      handleClose();
    } catch (error) {
      console.error('Error updating ICS IDs:', error);
    }
  };
  // Otherwise, show the dialog with preview
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title}
        {isSingleItem ? (
          <Chip label="Single Item - Details saved to database" color="success" size="small" sx={{ ml: 2 }} />
        ) : (
          <Chip label="Multi-Select - Details for this print only" color="info" size="small" sx={{ ml: 2 }} />
        )}
      </DialogTitle>
      <DialogContent>
        {/* Warning for single item without details */}
        {hasNoDetails && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This item has no ICS details saved. Please add details below before printing. 
            For individual prints, details will be saved to the database.
          </Alert>
        )}

        {/* Info for multi-select */}
        {!isSingleItem && items.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You are printing {items.length} items. Enter details below for this print session only.
            Details will NOT be saved to the database. For permanent details, print items individually.
          </Alert>
        )}

        {/* INPUT FIELDS FIRST - so user sees them before the preview */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Enter ICS Information
          </Typography>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Purpose (will be saved and printed)"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              multiline
              rows={2}
              size="small"
              placeholder="Enter purpose for this ICS..."
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={isSingleItem ? "ICS Details (will be saved to database)" : "ICS Details (for this print only - NOT saved)"}
              value={icsDetails}
              onChange={(e) => setIcsDetails(e.target.value)}
              multiline
              rows={3}
              size="small"
              placeholder="Enter ICS-specific details..."
              color={isSingleItem ? "primary" : "info"}
              helperText={isSingleItem 
                ? "These details will be saved and used for future prints of this item." 
                : "These details are temporary and won't be saved. Print individually to save details."}
            />
          </Box>
        </Paper>

        {/* Preview section */}
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Print Preview
        </Typography>
        <InventoryCustodianSlip signatories={signatories} reportData={reportData} />
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
