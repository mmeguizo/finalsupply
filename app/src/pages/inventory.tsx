import * as React from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import {
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Tooltip,
  Backdrop,
} from "@mui/material";
import { DataGrid, GridRowParams, GridToolbar } from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core/PageContainer";
import PreviewIcon from "@mui/icons-material/Preview";
//@ts-ignore
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT } from "../graphql/queries/inspectionacceptancereport.query";
import PrintReportDialogForIAR from "../components/printReportModalForIAR";
import { createItemColumns } from "./inventoryFunctions/inventory_gridColDef";

export default function InventoryPage() {
  const { data, loading, error, refetch } = useQuery(GET_ALL_INSPECTION_ACCEPTANCE_REPORT);
  const { allPurchaseOrderItems } = data || {};
  const [printPOI, setPrintPOI] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");

  const handleOpenPrintModal = (po: any) => {
    const reportTitle = po.category.split(" ")
    const reportTitleString = reportTitle.map((word : string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    //TODO : add the inspectionslip report here
    // manually set the report type and title
    // setReportType("inspection");
    setReportType("inspection");
    setTitle(`${reportTitleString} Report`);
    setPrintPOI(po);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintPOI(null);
  };

  // Use the imported column definitions with the handleOpenPrintModal function
  const itemColumns = React.useMemo(
    () => createItemColumns(handleOpenPrintModal),
    [handleOpenPrintModal]
  );

  const poRows = React.useMemo(() => {
    if (!data?.inspectionAcceptanceReport.length) return [];

    return data.inspectionAcceptanceReport.map((po: any) => {
      const formatAmount = po.amount ? `₱${po.amount.toFixed(2)}` : "0.00";
      const formatUnitCost = po.unitCost ? `₱${po.unitCost.toFixed(2)}` : "0.00";

      return {
        id: po.id,
        ...po,
        formatAmount,
        formatUnitCost
      };
    });
  }, [data]);

  const handleRowClick = (params: GridRowParams) => {
    // console.log("Row clicked", params);
  };

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
    <Stack spacing={3}  sx={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 100px)'}}>
      <Paper sx={{ width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data && data.inspectionAcceptanceReport && (
              <DataGrid
                rows={poRows}
                columns={itemColumns}
                loading={loading}
                hideFooter={poRows.length <= 10}
                disableRowSelectionOnClick
                density="compact"
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                onRowClick={handleRowClick}
                slots={{ toolbar: GridToolbar }}
              />
            )}
          </div>
      </Paper>
    </Stack>
    <PrintReportDialogForIAR
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printPOI}
        reportType={reportType}
      />
    </PageContainer>
  );
}
