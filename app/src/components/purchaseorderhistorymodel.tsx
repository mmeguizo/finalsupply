import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Purchase Order History</DialogTitle>
      <DialogContent>
        <Typography>Hello World! Purchase Order History will be displayed here.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}