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
import PrintReportDialog from "../components/printReportModal";
import { createItemColumns } from "./icsHighLowFunctions/icsHighLow_gridColDef";

//@ts-ignore
import { GET_ALL_ICS_PURCHASEORDER_ITEMS } from "../graphql/queries/purchaseorder.query";
export default function icsLowHighVolume() {
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(GET_ALL_ICS_PURCHASEORDER_ITEMS);
  const [printItem, setPrintItem] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");

  const handleOpenPrintModal = (item: any) => {
    const reportTitle = item.category.split(" ")
    const reportTitleString = reportTitle.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    setReportType(reportTitle[0]);
    setTitle(`${reportTitleString} Report`);
    setPrintItem(item);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintItem(null);
  };


  const poRows = React.useMemo(() => {
    if (!data?.allICSPurchaseOrderItems) return [];

    return data.allICSPurchaseOrderItems.map((po: any) => {
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

  const itemColumns = React.useMemo(
    () => createItemColumns(handleOpenPrintModal),
    [handleOpenPrintModal]
  );


  const handleRowClick = (params: GridRowParams) => {
    console.log("Row clicked", params);
  };

  return (
    <PageContainer title="High/Low Volume" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
      <Stack spacing={3} sx={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 100px)'}}>
        <Paper sx={{ width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
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
          </div>
        </Paper>
      </Stack>
      <PrintReportDialog
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printItem}
        reportType={reportType}
        title={title}
      />
    </PageContainer>
  );
}
