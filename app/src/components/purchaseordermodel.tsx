import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
interface PurchaseOrderModalProps {
  open: boolean;
  handleClose: () => void;
  purchaseOrder: any | null;
  handleSave: (formData: any) => void;
}

export default function PurchaseOrderModal({
  open,
  handleClose,
  purchaseOrder,
  handleSave,
}: PurchaseOrderModalProps) {
  // Initialize form state with purchase order data or empty values
  const [formData, setFormData] = React.useState({
    ponumber: purchaseOrder?.ponumber || "",
    supplier: purchaseOrder?.supplier || "",
    address: purchaseOrder?.address || "",
    dateofdelivery: purchaseOrder?.dateofdelivery
      ? new Date(Number(purchaseOrder.dateofdelivery))
      : null,
    dateofpayment: purchaseOrder?.dateofpayment
      ? new Date(Number(purchaseOrder.dateofpayment))
      : null,
    items: purchaseOrder?.items || [],
    amount: purchaseOrder?.amount || 0,
  });

  // Update form data when purchaseOrder prop changes
  React.useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        ponumber: purchaseOrder.ponumber || "",
        supplier: purchaseOrder.supplier || "",
        address: purchaseOrder.address || "",
        dateofdelivery: purchaseOrder.dateofdelivery
          ? new Date(Number(purchaseOrder.dateofdelivery))
          : null,
        dateofpayment: purchaseOrder.dateofpayment
          ? new Date(Number(purchaseOrder.dateofpayment))
          : null,
        items: purchaseOrder.items || [],
        amount: purchaseOrder.amount || 0,
      });
    } else {
      // Reset form when adding new PO
      setFormData({
        ponumber: "",
        supplier: "",
        address: "",
        dateofdelivery: null,
        dateofpayment: null,
        amount: 0,
        items: [],
      });
    }
  }, [purchaseOrder, open]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle date changes
  const handleDateChange = (date: Date | null, fieldName: string) => {
    setFormData({
      ...formData,
      [fieldName]: date,
    });
  };

  // Add empty item
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          item: "",
          description: "",
          unit: "",
          quantity: 0,
          unitcost: 0,
          amount: 0,
        },
      ],
    });
  };

  // Update item
  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Auto-calculate amount if quantity or unitcost changes
    if (field === "quantity" || field === "unitcost") {
      formData.amount,
        (updatedItems[index].amount =
          Number(updatedItems[index].quantity) *
          Number(updatedItems[index].unitcost));
    }

    console.log("updatedItems", updatedItems);

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  // Handle form submission
  const onSubmit = () => {
    // Clean items - remove __typename and handle _id appropriately
    const cleanedItems = formData.items.map((item) => {
      const { __typename, ...cleanItem } = item;
      return cleanItem;
    });

    // Format dates for GraphQL
    const formattedData = {
      ...formData,
      items: cleanedItems,
      dateofdelivery: formData.dateofdelivery
        ? formData.dateofdelivery.getTime().toString()
        : null,
      dateofpayment: formData.dateofpayment
        ? formData.dateofpayment.getTime().toString()
        : null,
      ponumber: parseInt(formData.ponumber),
    };

    // Remove __typename from the main object if it exists
    const { __typename, ...cleanData } = formattedData;

    console.log("formattedData", cleanData);

    handleSave(cleanData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {purchaseOrder ? "Edit Purchase Order" : "Add Purchase Order"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic PO Info */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="PO Number"
              name="ponumber"
              value={formData.ponumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Delivery Date"
                value={formData.dateofdelivery}
                onChange={(date) => handleDateChange(date, "dateofdelivery")}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Payment Date"
                value={formData.dateofpayment}
                onChange={(date) => handleDateChange(date, "dateofpayment")}
              />
            </LocalizationProvider>
          </Grid>

          {/* Items Section */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Items
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
                sx={{ ml: 2 }}
                size="small"
              >
                Add Item
              </Button>
            </Typography>

            {/* Items header */}
            {formData.items.length > 0 && (
              <Grid container spacing={1} sx={{ mb: 1, fontWeight: "bold" }}>
                <Grid item xs={1}>
                  <Typography>Item</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography>Description</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography>Unit</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography>Qty</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography>Unit Cost</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography>Amount</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography>Actions</Typography>
                </Grid>
              </Grid>
            )}

            {/* Items table/form */}
            {formData.items.map((item, index) => (
              <Grid container spacing={1} key={index} sx={{ mb: 2 }}>
                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Item"
                    value={item.item}
                    onChange={(e) => updateItem(index, "item", e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Unit"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                  />
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Number(e.target.value))
                    }
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Unit Cost"
                    type="number"
                    value={item.unitcost}
                    onChange={(e) =>
                      updateItem(index, "unitcost", Number(e.target.value))
                    }
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Amount"
                    value={item.amount}
                    slotProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton
                    color="error"
                    onClick={() => removeItem(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
