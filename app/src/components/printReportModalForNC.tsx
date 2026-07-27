import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import NoCategoryPreview from './previewDocumentFiles/noCategoryPreview';
import { getNoCategoryPrintTemplate } from './printDocumentFiles/noCategoryPrint';
import { InspectionReportDialogPropsForIAR } from '../types/printReportModal/types';

/**
 * PrintReportDialogForNC
 * ----------------------
 * Print dialog for No Category (NC) issuance items.
 * Follows the same pattern as PrintReportDialogForICS:
 *
 * Flow:
 * 1. User clicks "Print" on an NC item in the table row → parent opens this dialog.
 * 2. Dialog shows optional Purpose field + a live Appendix 62 preview.
 * 3. "Print Report" opens a new browser window with the HTML template and triggers print.
 *
 * This is simpler than the ICS modal because NC items don't need ICS-specific
 * fields like inventory number or department. Just purpose + standard IAR form.
 *
 * Props (same interface as other print modals — InspectionReportDialogPropsForIAR):
 * - open: boolean controlling dialog visibility
 * - handleClose: callback to close the dialog
 * - reportData: single item or array of items to print
 * - signatories: object with recieved_by / recieved_from names
 * - title: dialog title string
 */
export default function PrintReportDialogForNC({
  open,
  handleClose,
  reportData,
  title,
  signatories,
}: InspectionReportDialogPropsForIAR) {
  const [purpose, setPurpose] = useState('');

  // Normalize items so we can read saved purpose
  const items = Array.isArray(reportData) ? reportData : reportData ? [reportData] : [];

  // Pre-fill purpose from saved data when dialog opens
  useEffect(() => {
    if (open) {
      setPurpose(items[0]?.purpose || '');
    }
  }, [open, reportData]);

  /**
   * handlePrintReport
   * -----------------
   * 1. Builds the HTML string via getNoCategoryPrintTemplate.
   * 2. Opens a new browser window, writes the HTML, triggers print.
   * 3. Closes the dialog.
   *
   * The print template is a full HTML document — the browser's print dialog
   * handles the rest (paper size, margins, etc.).
   */
  const handlePrintReport = () => {
    const htmlContent = getNoCategoryPrintTemplate(signatories, reportData, purpose);
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title || 'No Category Issuance'}</DialogTitle>
      <DialogContent>
        {/* Purpose input field */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Enter NC Information
          </Typography>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Purpose (printed on form)"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              multiline
              rows={2}
              size="small"
              placeholder="Enter purpose for this NC issuance..."
            />
          </Box>
        </Paper>

        {/* Preview section */}
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Print Preview
        </Typography>
        <NoCategoryPreview signatories={signatories} reportData={reportData} />
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
