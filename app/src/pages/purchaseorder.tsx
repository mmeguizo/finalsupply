import * as React from "react";
import { GET_PURCHASEORDERS } from "../graphql/queries/purchaseorder.query";
import { useQuery } from "@apollo/client";
import {
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
  Stack,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRowParams,
} from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core/PageContainer";

export default function PurchaseOrder() {
  const { data, loading, error } = useQuery(GET_PURCHASEORDERS);

  console.log(data);

  const [selectedPO, setSelectedPO] = React.useState<any>(null);

  // Define columns for purchase orders
  const poColumns: GridColDef[] = [
    {
      field: "ponumber",
      headerName: "Purchase Order #",
      width: 150,
    },
    {
      field: "supplier",
      headerName: "Supplier",
      width: 200,
      flex: 1,
    },
    {
      field: "formattedDeliveryDate", // Use the pre-formatted field
      headerName: "Delivery Date",
      width: 150,
      // No formatter needed!
    },
    {
      field: "formattedPaymentDate", // Use the pre-formatted field
      headerName: "Payment Date",
      width: 150,
      // No formatter needed!
    },
    {
      field: "formatAmount",
      headerName: "Amount",
      type: "number",
      width: 150,
      align: "right",
      headerAlign: "right",
    },
  ];

  // Define columns for items
  const itemColumns: GridColDef[] = [
    { field: "item", headerName: "Item", width: 150 },
    { field: "description", headerName: "Description", width: 300, flex: 1 },
    { field: "unit", headerName: "Unit", width: 100 },
    { field: "quantity", headerName: "Quantity", type: "number", width: 100 },
    {
      field: "formatUnitCost",
      headerName: "Unit Cost",
      type: "number",
      width: 120,
      // valueFormatter: (params: any) => {
      //   if (params.value == null) return "₱0.00";
      //   return `₱${Number(params.value).toFixed(2)}`;
      // },
    },
    {
      field: "formatAmount",
      headerName: "Amount",
      type: "number",
      width: 120,
      // valueFormatter: (params: any) => {
      //   if (params.value == null) return "₱0.00";
      //   return `₱${Number(params.value).toFixed(2)}`;
      // },
    },
  ];

  // Format purchase orders for DataGrid
  const poRows = React.useMemo(() => {
    if (!data?.purchaseorders) return [];

    return data.purchaseorders.map((po: any) => {
      // Pre-format dates during row preparation instead of in the formatter

      console.log(po);

      const formatAmount = po.amount ? `₱${po.amount.toFixed(2)}` : "0.00";

      const formattedDeliveryDate = po.dateofdelivery
        ? new Date(Number(po.dateofdelivery)).toLocaleDateString()
        : "Not specified";

      const formattedPaymentDate = po.dateofpayment
        ? new Date(Number(po.dateofpayment)).toLocaleDateString()
        : "Not specified";

      // Use the amount directly from the data - no calculations needed
      // The data shows the amount is already populated correctly

      return {
        id: po._id,
        ...po,
        formattedDeliveryDate,
        formattedPaymentDate,
        formatAmount, // No amount recalculation needed since it's already in the data
        // No amount recalculation needed since it's already in the data
      };
    });
  }, [data]);

  // Format items for the selected purchase order
  const itemRows = React.useMemo(() => {
    if (!selectedPO?.items) return [];

    return selectedPO.items.map((item: any) => ({
      formatUnitCost: item.unitcost ? `₱${item.unitcost.toFixed(2)}` : "0.00",
      formatAmount: item.amount ? `₱${item.amount.toFixed(2)}` : "0.00",
      id: item._id || `item-${Math.random().toString(36).substr(2, 9)}`,
      ...item,
    }));
  }, [selectedPO]);

  // Handle row click to show items
  const handleRowClick = (params: GridRowParams) => {
    const clickedPO = data?.purchaseorders.find(
      (po: any) => po._id === params.id
    );
    setSelectedPO(clickedPO || null);
  };

  return (
    <PageContainer title="" breadcrumbs={[]}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error loading purchase orders: {error.message}
        </Alert>
      )}

      {data && data.purchaseorders && (
        <Stack spacing={3}>
          {/* Purchase Orders Grid */}
          <Paper sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={poRows}
              columns={poColumns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              onRowClick={handleRowClick}
            />
          </Paper>

          {/* Items Grid - shown when a purchase order is selected */}
          {selectedPO && (
            <Paper sx={{ width: "100%" }}>
              <Box p={2} pb={0}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Items for Purchase Order #{selectedPO.ponumber} -{" "}
                  {selectedPO.supplier}
                </Typography>
              </Box>
              <Box sx={{ height: 300, width: "100%" }}>
                <DataGrid
                  rows={itemRows}
                  columns={itemColumns}
                  hideFooter={itemRows.length <= 10}
                  disableRowSelectionOnClick
                  density="compact"
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                />
              </Box>
            </Paper>
          )}
        </Stack>
      )}
    </PageContainer>
  );
}
