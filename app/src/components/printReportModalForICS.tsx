import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
import { capitalizeFirstLetter } from "../utils/generalUtils";
import useSignatoryStore from "../stores/signatoryStore";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { UPDATE_ICSID } from "../graphql/mutations/inventoryIAR.mutation";
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

  // Avoid noisy logs on each render

  const getReportTemplate = (data: any) => {
    return getInventoryTemplateForICS(signatories, data);
  };

  const handlePrintReport = async () => {
    try {
      // Extract just the IDs from the reportData
      const itemIds = Array.isArray(reportData) 
        ? reportData.map(item => item.id) 
        : [reportData.id];
      
        // no need to increment the ics its need to be fixed value
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
        <InventoryCustodianSlip
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
