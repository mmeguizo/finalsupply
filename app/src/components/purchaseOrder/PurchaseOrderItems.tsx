import React from "react";
import {
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { PurchaseOrderItem } from "../../types/purchaseOrder";
import { PURCHASE_ORDER_CATEGORIES } from "../../utils/constants";

interface PurchaseOrderItemsProps {
  items: PurchaseOrderItem[];
  onUpdateItem: (index: number, field: string, value: any) => void;
  isFieldDisabled: (value: any) => boolean;
  actualQuantityfromDb: number;
  hasSubmitted: boolean;
  purchaseOrderStatus?: string;
}

export const PurchaseOrderItems: React.FC<PurchaseOrderItemsProps> = ({
  items,
  onUpdateItem,
  isFieldDisabled,
  actualQuantityfromDb,
  hasSubmitted,
  purchaseOrderStatus,
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Items</Typography>
      </Grid>
      {items.map((item, index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
          <Grid item xs={2}>
            <Select
              fullWidth
              value={item.category}
              onChange={(e) => onUpdateItem(index, "category", e.target.value)}
              disabled={isFieldDisabled(item.category)}
            >
              {Object.entries(PURCHASE_ORDER_CATEGORIES).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Item"
              value={item.item}
              onChange={(e) => onUpdateItem(index, "item", e.target.value)}
              disabled={isFieldDisabled(item.item)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Description"
              value={item.description}
              onChange={(e) =>
                onUpdateItem(index, "description", e.target.value)
              }
              disabled={isFieldDisabled(item.description)}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              label="Unit"
              value={item.unit}
              onChange={(e) => onUpdateItem(index, "unit", e.target.value)}
              disabled={isFieldDisabled(item.unit)}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={item.quantity}
              onChange={(e) =>
                onUpdateItem(index, "quantity", Number(e.target.value))
              }
              disabled={isFieldDisabled(item.quantity)}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="number"
              label="Received"
              value={item.actualQuantityReceived}
              onChange={(e) =>
                onUpdateItem(
                  index,
                  "actualQuantityReceived",
                  Number(e.target.value)
                )
              }
              disabled={isFieldDisabled(item.actualQuantityReceived)}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="number"
              label="Unit Cost"
              value={item.unitCost}
              onChange={(e) =>
                onUpdateItem(index, "unitCost", Number(e.target.value))
              }
              disabled={isFieldDisabled(item.unitCost)}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              fullWidth
              type="number"
              label="Amount"
              value={item.amount}
              disabled
            />
          </Grid>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Button
          variant="contained"
          onClick={() => {
            /* Add item logic */
          }}
        >
          Add Item
        </Button>
      </Grid>
    </Grid>
  );
};
