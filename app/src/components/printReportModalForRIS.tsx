import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import InspectionAcceptanceReport from "./previewDocumentFiles/InspectionAcceptanceReport";
import RequisitionReport from "./previewDocumentFiles/requisitionAndIssueSlip";
import { getRequisitionAndIssueSlip } from "./printDocumentFiles/requisitionAndIssueSlip";
import { InspectionReportDialogPropsForIAR } from "../types/printReportModal/types";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { UPDATE_RISID } from "../graphql/mutations/requisitionIS.mutation";
import { GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY } from "../graphql/queries/requisitionIssueslip";
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
  
  const getReportTemplate = (data: any) => {
    return getRequisitionAndIssueSlip(signatories, data);
  };

  const handlePrintReport = async () => {
    try {
      // Extract just the IDs from the reportData
      const itemIds = Array.isArray(reportData) 
        ? reportData.map(item => item.id) 
        : [reportData.id];
      // Call the mutation with the correct input format
      const result = await updateICSid({
        variables: {
          input: {
            ids: itemIds
          }
        }
      });
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
        <RequisitionReport
          signatories={signatories}
          reportData={reportData}
        />
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
