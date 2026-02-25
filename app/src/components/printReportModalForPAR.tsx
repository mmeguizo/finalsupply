import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import PropertyAcknowledgementReceipt from "./previewDocumentFiles/propertyAcknowledgementReceipt";
import { getPropertyAcknowledgementReciept } from "./printDocumentFiles/propertyAcknowledgementReceipt";
import { InspectionReportDialogPropsForIAR } from "../types/printReportModal/types";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { UPDATE_PARID } from "../graphql/mutations/propertyAR.mutation";
import { UPDATE_ITEM_REMARKS } from "../graphql/mutations/inventoryIAR.mutation";
import { GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY } from "../graphql/queries/propertyacknowledgementreport";

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

  const [updateRemarks] = useMutation(UPDATE_ITEM_REMARKS);
  const [remarks, setRemarks] = useState("");

  // Pre-fill remarks from saved data
  useEffect(() => {
    if (open) {
      const items = Array.isArray(reportData)
        ? reportData
        : reportData
          ? [reportData]
          : [];
      setRemarks(items[0]?.remarks || "");
    }
  }, [open, reportData]);

  // Determine signatories to use - prefer per-item signatories if available
  const effectiveSignatories = useMemo(() => {
    const items = Array.isArray(reportData)
      ? reportData
      : reportData
        ? [reportData]
        : [];
    const firstItem = items[0];

    // Check if the item has per-item PAR signatories (new workflow)
    if (firstItem?.parReceivedFrom || firstItem?.parReceivedBy) {
      return {
        recieved_from: firstItem.parReceivedFrom || "",
        recieved_by: firstItem.parReceivedBy || "",
        metadata: {
          recieved_from: {
            position: firstItem.parReceivedFromPosition || "",
            role: firstItem.parReceivedFromPosition || "",
          },
          recieved_by: {
            position: firstItem.parReceivedByPosition || "",
            role: "",
          },
        },
      };
    }

    // Fall back to global signatories
    return signatories;
  }, [reportData, signatories]);

  const getReportTemplate = (data: any) => {
    return getPropertyAcknowledgementReciept(
      effectiveSignatories,
      data,
      remarks,
    );
  };

  console.log("reportData", reportData);
  console.log("effectiveSignatories", effectiveSignatories);

  const handlePrintReport = async () => {
    try {
      // Extract just the IDs from the reportData
      const itemIds = Array.isArray(reportData)
        ? reportData.map((item) => item.id)
        : [reportData.id];

      // Save remarks to DB if entered
      if (remarks.trim()) {
        await updateRemarks({
          variables: { ids: itemIds, remarks: remarks.trim() },
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
      console.error("Error updating PAR:", error);
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
