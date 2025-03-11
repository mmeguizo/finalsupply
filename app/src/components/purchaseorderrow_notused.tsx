import * as React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Collapse,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface PurchaseOrderRowProps {
  purchaseOrder: any; // Consider creating a proper type for this
}

export function PurchaseOrderRow({ purchaseOrder }: PurchaseOrderRowProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {purchaseOrder.ponumber}
        </TableCell>
        <TableCell>{purchaseOrder.supplier}</TableCell>
        <TableCell>
          {purchaseOrder.dateofdelivery
            ? new Date(
                Number(purchaseOrder.dateofdelivery)
              ).toLocaleDateString()
            : "Not specified"}
        </TableCell>
        <TableCell>
          {purchaseOrder.dateofpayment
            ? new Date(Number(purchaseOrder.dateofpayment)).toLocaleDateString()
            : "Not specified"}
        </TableCell>
        <TableCell align="right">
          ${purchaseOrder.amount ? purchaseOrder.amount.toFixed(2) : "0.00"}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Items
              </Typography>
              <Table size="small" aria-label="purchase order items">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
                    purchaseOrder.items.map((item: any) => (
                      <TableRow key={item._id}>
                        <TableCell component="th" scope="row">
                          {item.item}
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          ${item.unitcost ? item.unitcost.toFixed(2) : "0.00"}
                        </TableCell>
                        <TableCell align="right">
                          ${item.amount ? item.amount.toFixed(2) : "0.00"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
