import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import PropertyAcknowledgementReceipt from "./previewDocumentFiles/propertyAcknowledgementReceipt";
import { getPropertyAcknowledgementReciept } from "./printDocumentFiles/propertyAcknowledgementReceipt";
import { InspectionReportDialogPropsForIAR } from "../types/printReportModal/types";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { UPDATE_PARID } from "../graphql/mutations/propertyAR.mutation";
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
  const getReportTemplate = (data: any) => {
    return getPropertyAcknowledgementReciept(signatories, data);
  };
  console.log("PrintReportDialogForPAR", signatories);
  const handlePrintReport = async () => {
    try {
      // Extract just the IDs from the reportData
      const itemIds = Array.isArray(reportData) 
        ? reportData.map(item => item.id) 
        : [reportData.id];
      // Call the mutation with the correct input format
      // const result = await updateICSid({
      //   variables: {
      //     input: {
      //       ids: itemIds
      //     }
      //   }
      // });
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
        <PropertyAcknowledgementReceipt
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
