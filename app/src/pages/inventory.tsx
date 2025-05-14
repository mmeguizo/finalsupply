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
import { GET_ALL_PURCHASEORDER_ITEMS } from "../graphql/queries/purchaseorder.query";
import PrintReportDialog from "../components/printReportModal";
import { createItemColumns } from "./inventoryFunctions/inventory_gridColDef";

export default function InventoryPage() {
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(GET_ALL_PURCHASEORDER_ITEMS);
  const { allPurchaseOrderItems } = data || {};
  const [printPOI, setPrintPOI] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");
  // Refresh data when component mounts
  //aggressive refetch
  // React.useEffect(() => {
  //   // Clear cache and refetch when component mounts
  //   client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'allPurchaseOrderItems' });
  //   client.cache.gc();
  //   refetch();
  // }, []);

  const handleOpenPrintModal = (po: any) => {
    console.log("printPOI", po);
    const reportTitle = po.category.split(" ")
    const reportTitleString = reportTitle.map((word : string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    setReportType(reportTitle[0]);
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
    if (!data?.allPurchaseOrderItems) return [];

    return data.allPurchaseOrderItems.map((po: any) => {
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
    console.log("Row clicked", params);
  };

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
    <Stack spacing={3}  sx={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 100px)'}}>
      <Paper sx={{ width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data && data.allPurchaseOrderItems && (
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
    <PrintReportDialog
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printPOI}
        reportType={reportType}
      />
    </PageContainer>
  );
}
