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
import InspectionAcceptanceReport from './previewDocumentFiles/InspectionAcceptanceReport';
import RequisitionReport from './previewDocumentFiles/requisitionAndIssueSlip';
import { getRequisitionAndIssueSlip } from './printDocumentFiles/requisitionAndIssueSlip';
import { InspectionReportDialogPropsForIAR } from '../types/printReportModal/types';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { UPDATE_RISID } from '../graphql/mutations/requisitionIS.mutation';
import { UPDATE_ITEM_PURPOSE } from '../graphql/mutations/inventoryIAR.mutation';
import { GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY } from '../graphql/queries/requisitionIssueslip';
export default function PrintReportDialogForRIS({
  open,
  handleClose,
  reportData,
  reportType,
  title,
  signatories,
}: InspectionReportDialogPropsForIAR) {
  const [updateICSid] = useMutation(UPDATE_RISID, {
    refetchQueries: [{ query: GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY }],
  });

  const [updatePurpose] = useMutation(UPDATE_ITEM_PURPOSE);
  const [purpose, setPurpose] = useState('');
  const [risDetails, setRisDetails] = useState('');

  // Compute a stable localStorage key from the set of item IDs
  const risItems = Array.isArray(reportData) ? reportData : reportData ? [reportData] : [];
  const risStorageKey =
    risItems.length > 0
      ? `supply_podetails_ris_${risItems
          .map((i: any) => i.id)
          .filter(Boolean)
          .sort()
          .join('_')}`
      : null;

  // Pre-fill purpose from DB; load risDetails from localStorage
  useEffect(() => {
    if (open) {
      const items = Array.isArray(reportData) ? reportData : reportData ? [reportData] : [];
      setPurpose(items[0]?.purpose || '');
      setRisDetails(risStorageKey ? localStorage.getItem(risStorageKey) || '' : '');
    } else {
      setRisDetails('');
    }
  }, [open, reportData]);

  const getReportTemplate = (data: any) => {
    return getRequisitionAndIssueSlip(signatories, data, purpose, risDetails);
  };

  const handlePrintReport = async () => {
    try {
      const itemIds = Array.isArray(reportData)
        ? reportData.map((item) => item.id)
        : [reportData.id];

      if (purpose.trim()) {
        await updatePurpose({
          variables: { ids: itemIds, purpose: purpose.trim() },
        });
      }

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
    } catch (error) {
      console.error('Error generating RIS:', error);
    }
  };
  // Otherwise, show the dialog with preview
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <RequisitionReport signatories={signatories} reportData={reportData} />
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Purpose (will be saved and printed)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            multiline
            rows={2}
            size="small"
            placeholder="Enter purpose for this RIS..."
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="PO Details"
            value={risDetails}
            onChange={(e) => {
              const val = e.target.value;
              setRisDetails(val);
              if (risStorageKey) {
                if (val) localStorage.setItem(risStorageKey, val);
                else localStorage.removeItem(risStorageKey);
              }
            }}
            multiline
            rows={2}
            size="small"
            placeholder="Enter PO details for this RIS..."
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
