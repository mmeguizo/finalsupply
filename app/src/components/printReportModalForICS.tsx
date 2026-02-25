import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import InspectionAcceptanceReport from "./previewDocumentFiles/InspectionAcceptanceReport";
import PropertyAcknowledgementReceipt from "./previewDocumentFiles/propertyAcknowledgementReceipt";
import RequisitionAndIssueSlip from "./previewDocumentFiles/requisitionAndIssueSlip";
import InventoryCustodianSlip from "./previewDocumentFiles/inventoryCustodianSlip";
import { getInspectionReportTemplate } from "./printDocumentFiles/inspectionAcceptanceRerport";
import { getPropertyAcknowledgementReciept } from "./printDocumentFiles/propertyAcknowledgementReceipt";
import { getRequisitionAndIssueSlip } from "./printDocumentFiles/requisitionAndIssueSlip";
import { getInventoryTemplateForICS } from "./printDocumentFiles/inventoryCustodianslipPrinting";
import { InspectionReportDialogPropsForIAR } from "../types/printReportModal/types";
import { useMutation } from "@apollo/client";
import {
  UPDATE_ICSID,
  UPDATE_ITEM_PURPOSE,
} from "../graphql/mutations/inventoryIAR.mutation";
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS } from "../graphql/queries/inspectionacceptancereport.query";
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
  const [purpose, setPurpose] = useState("");

  // Pre-fill purpose from saved data
  useEffect(() => {
    if (open) {
      const items = Array.isArray(reportData)
        ? reportData
        : reportData
          ? [reportData]
          : [];
      setPurpose(items[0]?.purpose || "");
    }
  }, [open, reportData]);

  const getReportTemplate = (data: any) => {
    return getInventoryTemplateForICS(signatories, data, purpose);
  };

  const handlePrintReport = async () => {
    try {
      // Extract just the IDs from the reportData
      const itemIds = Array.isArray(reportData)
        ? reportData.map((item) => item.id)
        : [reportData.id];

      // Save purpose to DB if entered
      if (purpose.trim()) {
        await updatePurpose({
          variables: { ids: itemIds, purpose: purpose.trim() },
        });
      }

      // Continue with printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(getReportTemplate(reportData));
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
      handleClose();
    } catch (error) {
      console.error("Error updating ICS IDs:", error);
    }
  };
  // Otherwise, show the dialog with preview
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <InventoryCustodianSlip
          signatories={signatories}
          reportData={reportData}
        />
        <Box sx={{ mt: 2 }}>
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
