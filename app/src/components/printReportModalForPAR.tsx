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
import PropertyAcknowledgementReceipt from './previewDocumentFiles/propertyAcknowledgementReceipt';
import { getPropertyAcknowledgementReciept } from './printDocumentFiles/propertyAcknowledgementReceipt';
import { InspectionReportDialogPropsForIAR } from '../types/printReportModal/types';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { UPDATE_PARID } from '../graphql/mutations/propertyAR.mutation';
import { UPDATE_ITEM_REMARKS } from '../graphql/mutations/inventoryIAR.mutation';
import { GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY } from '../graphql/queries/propertyacknowledgementreport';
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT } from '../graphql/queries/inspectionacceptancereport.query';

export default function PrintReportDialogForPAR({
  open,
  handleClose,
  reportData,
  reportType,
  title,
  signatories,
}: InspectionReportDialogPropsForIAR) {
  // const [updateICSid] = useMutation(UPDATE_PARID, {
  //   refetchQueries: [{ query: GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY }],
  // });

  const [updateRemarks] = useMutation(UPDATE_ITEM_REMARKS, {
    refetchQueries: [{ query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT }],
    awaitRefetchQueries: true,
  });
  const [remarks, setRemarks] = useState('');
  const [parDetails, setParDetails] = useState('');

  // Compute a stable localStorage key from the set of item IDs
  const parItems = Array.isArray(reportData) ? reportData : reportData ? [reportData] : [];
  const parStorageKey =
    parItems.length > 0
      ? `supply_podetails_par_${parItems
          .map((i: any) => i.id)
          .filter(Boolean)
          .sort()
          .join('_')}`
      : null;

  // Pre-fill remarks from DB; load parDetails from localStorage
  useEffect(() => {
    if (open) {
      const items = Array.isArray(reportData) ? reportData : reportData ? [reportData] : [];
      setRemarks(items[0]?.remarks || '');
      setParDetails(parStorageKey ? localStorage.getItem(parStorageKey) || '' : '');
    } else {
      setParDetails('');
    }
  }, [open, reportData]);

  // Determine signatories to use - use global signatories from page-level selection
  const effectiveSignatories = signatories;

  const getReportTemplate = (data: any) => {
    return getPropertyAcknowledgementReciept(effectiveSignatories, data, remarks, parDetails);
  };

  console.log('reportData', reportData);
  console.log('effectiveSignatories', effectiveSignatories);

  const handlePrintReport = async () => {
    try {
      const itemIds = Array.isArray(reportData)
        ? reportData.map((item) => item.id)
        : [reportData.id];

      if (remarks.trim()) {
        await updateRemarks({
          variables: { ids: itemIds, remarks: remarks.trim() },
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
      console.error('Error updating PAR:', error);
    }
  };
  // Otherwise, show the dialog with preview
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <PropertyAcknowledgementReceipt
          signatories={effectiveSignatories}
          reportData={reportData}
        />
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Remarks (will be saved and printed)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            multiline
            rows={2}
            size="small"
            placeholder="Enter remarks for this PAR..."
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="PO Details"
            value={parDetails}
            onChange={(e) => {
              const val = e.target.value;
              setParDetails(val);
              if (parStorageKey) {
                if (val) localStorage.setItem(parStorageKey, val);
                else localStorage.removeItem(parStorageKey);
              }
            }}
            multiline
            rows={2}
            size="small"
            placeholder="Enter PO details for this PAR..."
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
