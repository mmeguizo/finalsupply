import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
} from "@mui/x-data-grid";
// @ts-ignore
import { GET_ITEM_HISTORY } from "../graphql/queries/purchaseorder.query";
import { useQuery } from "@apollo/client";
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

  console.log(purchaseOrder); 

  const { data, refetch } = useQuery(GET_ITEM_HISTORY, {
    variables: {
      purchaseOrderId: purchaseOrder?.items[0].purchaseOrderId
    },
     fetchPolicy: 'network-only'
  });

  console.log(data); // Add this log t

  React.useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'purchaseOrderItemId', headerName: 'Item ID', width: 100 },
    { 
      field: 'previousQuantity', 
      headerName: 'Qty', 
      width: 120,
      type: 'number'
    },
    // { 
    //   field: 'newQuantity', 
    //   headerName: 'New Qty', 
    //   width: 100,
    //   type: 'number'
    // },
    { 
      field: 'previousActualQuantityReceived', 
      headerName: 'Previous Received', 
      width: 140,
      type: 'number'
    },
    { 
      field: 'newActualQuantityReceived', 
      headerName: 'New Received', 
      width: 120,
      type: 'number'
    },
    { 
      field: 'previousAmount', 
      headerName: ' Amount', 
      width: 130,
      type: 'number',
      valueFormatter: (params : any) => {
        return `₱${params.toFixed(2)}`;
      }
    },
    // { 
    //   field: 'newAmount', 
    //   headerName: 'New Amount', 
    //   width: 120,
    //   type: 'number',
    //   valueFormatter: (params  : any) => {
    //     return `₱${params.toFixed(2)}`;
    //   }
    // },
    { field: 'changeType', headerName: 'Change Type', width: 130 },
    { field: 'changedBy', headerName: 'Changed By', width: 120 },
    { field: 'changeReason', headerName: 'Reason', width: 200 },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      width: 180,
      valueFormatter: (params : any) => {
        return new Date(parseInt(params)).toLocaleString();
      }
    }
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>Purchase Order History</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={data?.purchaseOrderHistory || []}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            density="compact"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}