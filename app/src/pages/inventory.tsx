import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
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

import { GridColDef, DataGrid, GridRowParams, GridToolbar } from "@mui/x-data-grid";
import { useDemoData } from "@mui/x-data-grid-generator";
import { useQuery } from "@apollo/client";
import { GET_ALL_PURCHASEORDER_ITEMS  } from "../graphql/queries/purchaseorder.query.js";
import { currencyFormat, formatCategory } from "../utils/generalUtils";
export default function InventoryPage() {
  const { data, loading, error } = useQuery(GET_ALL_PURCHASEORDER_ITEMS);
  const { allPurchaseOrderItems } = data || {};

  const itemColumns: GridColDef[] = [
    {
      field: "category",
      headerName: "Category",
      width: 200,
      // valueFormatter: (params) => formatCategory(params),
      valueFormatter : (params : any) => {
        let category;
        category = params.split(" ")
        return category.map((word : any) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
      }
    },
    { 
      field: "PurchaseOrder",
      headerName: "P.O. #", 
      width: 150,
      valueGetter: (params : any) => params.poNumber,
    },
    { field: "itemName", headerName: "Item", width: 150 },
    { field: "description", headerName: "Description", width: 300, flex: 1 },
    { field: "unit", headerName: "Unit", width: 100 },
    {
      field: "actualQuantityReceived",
      headerName: "Actual Recieved",
      type: "number",
      width: 50,
    },
    { field: "quantity", headerName: "Quantity", type: "number", width: 100 },
    {
      field: "formatUnitCost",
      headerName: "Unit Cost",
      type: "number",
      width: 100,
      // valueFormatter: (params) => params,
    },
    {
      field: "formatAmount",
      headerName: "Amount",
      type: "number",
      width: 120,
    },
  ];

  const poRows = React.useMemo(() => {
    if (!data?.allPurchaseOrderItems) return [];

    return data.allPurchaseOrderItems.map((po: any) => {
      const formatAmount = po.amount ? `₱${po.amount.toFixed(2)}` : "0.00";
      const formatUnitCost = po.unitCost ? `₱${po.unitCost.toFixed(2)}` : "0.00";

      // const formattedDeliveryDate = po.dateofdelivery
      //   ? new Date(Number(po.dateofdelivery)).toLocaleDateString()
      //   : "Not specified";

      // const formattedPaymentDate = po.dateOfPayment
      //   ? new Date(Number(po.dateOfPayment)).toLocaleDateString()
      //   : "Not specified";

      return {
        id: po.id,
        ...po,
        // formattedDeliveryDate,
        // formattedPaymentDate,
        formatAmount,
        formatUnitCost
      };
    });
  }, [data]);

  const handleRowClick = (params: GridRowParams) => {
    console.log("Row clicked", params);
  };

  return (
    <Stack spacing={3}>
      <Box p={2} pb={0}></Box>
      <Paper sx={{ width: "100%" }}>
        <Box sx={{ width: "100%" }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}></Stack>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data?.purchaseOrders?.length !== 0 && (
              <DataGrid
                {...allPurchaseOrderItems}
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
        </Box>
      </Paper>
    </Stack>
  );
}
