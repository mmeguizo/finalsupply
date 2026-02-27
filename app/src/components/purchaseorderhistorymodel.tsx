import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Alert,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
// @ts-ignore
import { GET_ITEM_HISTORY } from "../graphql/queries/purchaseorder.query";
import { useQuery } from "@apollo/client";
import { currencyFormat } from "../utils/generalUtils";

interface PurchaseOrderHistoryModalProps {
  open: boolean;
  handleClose: () => void;
  purchaseOrder: any | null;
}

export default function PurchaseOrderHistoryModal({
  open,
  handleClose,
  purchaseOrder,
}: PurchaseOrderHistoryModalProps) {
  // Safely get the purchaseOrderId — from the PO itself, not from items[0]
  const poId = purchaseOrder?.id || null;

  const { data, loading, error, refetch } = useQuery(GET_ITEM_HISTORY, {
    variables: {
      purchaseOrderId: poId,
    },
    skip: !poId, // Skip query if no ID available
    fetchPolicy: "network-only",
  });

  React.useEffect(() => {
    if (open && poId) {
      refetch();
    }
  }, [open, poId, refetch]);

  // Build a lookup of item descriptions from the PO items
  const itemLookup = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (purchaseOrder?.items) {
      purchaseOrder.items.forEach((item: any) => {
        map[String(item.id)] =
          item.itemName || item.description || `Item #${item.id}`;
      });
    }
    return map;
  }, [purchaseOrder]);

  // Enrich history rows with item name
  const enrichedRows = React.useMemo(() => {
    const history = data?.purchaseOrderHistory || [];
    return history.map((row: any) => ({
      ...row,
      itemDescription:
        itemLookup[String(row.purchaseOrderItemId)] ||
        `Item #${row.purchaseOrderItemId}`,
    }));
  }, [data, itemLookup]);

  const columns: GridColDef[] = [
    {
      field: "itemDescription",
      headerName: "Item",
      width: 180,
    },
    {
      field: "changeType",
      headerName: "Change Type",
      width: 140,
      renderCell: (params) => {
        const type = params.value || "";
        const colorMap: Record<
          string,
          "default" | "primary" | "success" | "warning" | "error" | "info"
        > = {
          QUANTITY_UPDATE: "primary",
          RECEIVED_UPDATE: "success",
          AMOUNT_UPDATE: "info",
          IAR_GENERATED: "success",
          ITEM_ADDED: "primary",
          ITEM_DELETED: "error",
        };
        return (
          <Chip
            label={type.replace(/_/g, " ")}
            color={colorMap[type] || "default"}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "previousQuantity",
      headerName: "Qty",
      width: 80,
      type: "number",
    },
    {
      field: "previousActualQuantityReceived",
      headerName: "Prev Received",
      width: 110,
      type: "number",
    },
    {
      field: "newActualQuantityReceived",
      headerName: "New Received",
      width: 110,
      type: "number",
    },
    {
      field: "previousAmount",
      headerName: "Prev Amount",
      width: 120,
      valueFormatter: (params: any) => {
        if (params == null || params === undefined) return "—";
        return currencyFormat(params);
      },
    },
    {
      field: "newAmount",
      headerName: "New Amount",
      width: 120,
      valueFormatter: (params: any) => {
        if (params == null || params === undefined) return "—";
        return currencyFormat(params);
      },
    },
    { field: "changedBy", headerName: "Changed By", width: 120 },
    { field: "changeReason", headerName: "Reason", width: 200, flex: 1 },
    {
      field: "createdAt",
      headerName: "Date",
      width: 160,
      valueFormatter: (params: any) => {
        if (!params) return "—";
        const ts = parseInt(params);
        if (isNaN(ts)) return "—";
        return new Date(ts).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      },
    },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">Item History</Typography>
          {purchaseOrder && (
            <Chip
              label={`PO #${purchaseOrder.poNumber} — ${purchaseOrder.supplier}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading history: {error.message}
          </Alert>
        )}
        {!poId && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No purchase order selected.
          </Alert>
        )}
        <Box sx={{ width: "100%", minHeight: 400 }}>
          <DataGrid
            rows={enrichedRows}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: "createdAt", sort: "desc" }],
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            density="compact"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
