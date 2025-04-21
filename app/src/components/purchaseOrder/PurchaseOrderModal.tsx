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
// @ts-ignore
import DeleteIcon from "@mui/icons-material/Delete";
// @ts-ignore
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
interface PurchaseOrderModalProps {
  open: boolean;
  handleClose: () => void;
  purchaseOrder: any | null;
  handleSave: (formData: any) => void;
  isSubmitting: boolean; // Add this prop
}

export default function PurchaseOrderModal({
  open,
  handleClose,
  purchaseOrder,
  handleSave,
  isSubmitting,
}: PurchaseOrderModalProps) {
  // Add this near the top of the component with other state declarations
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [actualQuantityfromDb, setActualQuantityfromDb] = React.useState(0);

  // Initialize form state with purchase order data or empty values
  const [formData, setFormData] = React.useState({
    poNumber: purchaseOrder?.poNumber || "",
    supplier: purchaseOrder?.supplier || "",
    address: purchaseOrder?.address || "",
    placeOfDelivery: purchaseOrder?.placeOfDelivery || "",
    // dateofdelivery: purchaseOrder?.dateofdelivery
    //   ? new Date(Number(purchaseOrder.dateofdelivery))
    //   : null,
    dateOfPayment: purchaseOrder?.dateOfPayment
      ? new Date(Number(purchaseOrder.dateOfPayment))
      : null,
    items: purchaseOrder?.items || [],
    amount: purchaseOrder?.amount || 0,
    status: purchaseOrder?.status || "",
    invoice: purchaseOrder?.invoice || "",
  });

  // if adding item remove disabled in input
  const [addingItem, setAddingItem] = React.useState(false);

  // Modify the disabled logic in your TextField components
  // For example:
  const isFieldDisabled = (existingValue: any) => {
    // If editing (purchaseOrder exists) and value exists and not adding new item
    if (purchaseOrder && existingValue && !addingItem) {
      return true;
    }
    // If not editing (new PO) or adding new item
    return false;
  };

  // Update form data when purchaseOrder prop changes
  React.useEffect(() => {
    // Reset addingItem when modal opens/closes
    setAddingItem(false);
    setHasSubmitted(false); // Add this line
    if (purchaseOrder) {
      setFormData({
        poNumber: purchaseOrder.poNumber || "",
        supplier: purchaseOrder.supplier || "",
        address: purchaseOrder.address || "",

        placeOfDelivery: purchaseOrder.placeOfDelivery || "", // dateofdelivery: purchaseOrder.dateofdelivery
        // dateofdelivery: purchaseOrder.dateofdelivery
        // ? new Date(Number(purchaseOrder.dateofdelivery))
        // : null,
        dateOfPayment: purchaseOrder.dateOfPayment
          ? new Date(Number(purchaseOrder.dateOfPayment))
          : null,
        // items: purchaseOrder.items || [],
        items:
          purchaseOrder.items.map((item: any) => {
            setActualQuantityfromDb(item.actualQuantityReceived);
            return {
              ...item,
              // Use the existing value instead of resetting to 0
              actualQuantityReceived:
                purchaseOrder.status === "completed"
                  ? item.actualQuantityReceived
                  : 0,
            };
          }) || [],
        amount: purchaseOrder.amount || 0,
        status: purchaseOrder.status || "",
        invoice: purchaseOrder.invoice || "",
      });
    } else {
      // Reset form when adding new PO
      setFormData({
        poNumber: "",
        supplier: "",
        address: "",
        placeOfDelivery: "",
        // dateofdelivery: null,
        dateOfPayment: null,
        amount: 0,
        items: [],
        status: "",
        invoice: "",
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
    setAddingItem(true);
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          category: "",
          item: "",
          description: "",
          unit: "",
          quantity: 0,
          unitCost: 0,
          amount: 0,
          actualQuantityReceived: 0,
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

    // Auto-calculate amount if quantity or unitCost changes
    if (field === "quantity" || field === "unitCost") {
      formData.amount,
        (updatedItems[index].amount =
          Number(updatedItems[index].quantity) *
          Number(updatedItems[index].unitCost));
    }

    // Check if quantities match to update status
    const allItemsComplete = updatedItems.every((item) => {
      return (
        Number(item.quantity) ===
          Number(item.actualQuantityReceived + actualQuantityfromDb) &&
        item.quantity > 0
      );
    });
    setFormData({
      ...formData,
      items: updatedItems,
      status: allItemsComplete ? "completed" : "pending",
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
      // dateofdelivery: formData.dateofdelivery
      //   ? formData.dateofdelivery.getTime().toString()
      //   : null,
      dateOfPayment: formData.dateOfPayment
        ? formData.dateOfPayment.getTime().toString()
        : null,
      poNumber: parseInt(formData.poNumber),
    };

    // Remove __typename from the main object if it exists
    const { __typename, ...cleanData } = formattedData;
    setAddingItem(false);
    handleSave(cleanData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {purchaseOrder
          ? "Update Recieved Item or Invoice"
          : "Add Purchase Order"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic PO Info */}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="PO Number"
              name="poNumber"
              value={formData.poNumber}
              onChange={handleChange}
              disabled={true}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Invoice"
              name="invoice"
              value={formData.invoice}
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
              disabled={true}
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={true}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Place of Delivery"
              name="placeOfDelivery"
              value={formData.placeOfDelivery}
              onChange={handleChange}
              disabled={true}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Payment Date"
                value={formData.dateOfPayment}
                onChange={(date) => handleDateChange(date, "dateOfPayment")}
                disabled={true}
              />
            </LocalizationProvider>
          </Grid>

          {/* Items Section */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 2, display: "flex", alignItems: "center" }}
            >
              Items
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
                variant="contained"
                size="small"
                sx={{ ml: 2 }}
              >
                Add Item
              </Button>
            </Typography>

            {/* Items header */}
            {formData.items.length > 0 && (
              <Grid
                container
                spacing={2}
                sx={{
                  mb: 2,
                  px: 2,
                  py: 1,
                  backgroundColor: "background.default",
                  borderRadius: 1,
                }}
              >
                <Grid item xs={2}>
                  <Typography variant="subtitle2">Category</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Item</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2">Description</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Unit</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Qty</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Received</Typography>
                </Grid>
                <Grid item xs={1.5}>
                  <Typography variant="subtitle2">Unit Cost</Typography>
                </Grid>
                <Grid item xs={1.5}>
                  <Typography variant="subtitle2">Amount</Typography>
                </Grid>
              </Grid>
            )}

            {/* Items table/form */}
            {formData.items.map((item, index) => (
              <Grid
                container
                spacing={2}
                key={index}
                sx={{
                  mb: 2,
                  p: 1,
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  borderBottom: 5,
                  borderColor: "divider",
                }}
              >
                <Grid item xs={2}>
                  <Select
                    fullWidth
                    size="small"
                    value={item.category}
                    onChange={(e) =>
                      updateItem(index, "category", e.target.value)
                    }
                    label="Category"
                    disabled={isFieldDisabled(item.category)}
                    sx={{ "& .MuiSelect-select": { py: 1 } }}
                  >
                    <MenuItem value={"property acknowledgement reciept"}>
                      PAR
                    </MenuItem>
                    <MenuItem value={"inventory custodian slip"}>ICS</MenuItem>
                    <MenuItem value={"requisition issue slip"}>RIS</MenuItem>
                  </Select>
                </Grid>

                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Item"
                    label="Item"
                    value={item.item}
                    onChange={(e) => updateItem(index, "item", e.target.value)}
                    disabled={isFieldDisabled(item.item)}
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    disabled={isFieldDisabled(item.description)}
                  />
                </Grid>

                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Unit"
                    label="Unit"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    disabled={isFieldDisabled(item.unit)}
                  />
                </Grid>

                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Quantity"
                    placeholder="Quantity"
                    inputProps={{
                      min: 0,
                      style: { textAlign: "right" },
                    }}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Number(e.target.value))
                    }
                    disabled={isFieldDisabled(item.quantity)}
                  />
                </Grid>

                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Received"
                    placeholder="Received"
                    value={item.actualQuantityReceived}
                    inputProps={{
                      min: 0,
                      max: item.quantity - actualQuantityfromDb,
                    }}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (
                        value >= 0 &&
                        value <= item.quantity - item.actualQuantityReceived
                      ) {
                        updateItem(index, "actualQuantityReceived", value);
                      }
                    }}
                    disabled={
                      (hasSubmitted || purchaseOrder?.status === "completed") &&
                      Number(item.actualQuantityReceived) ===
                        Number(item.quantity)
                    }
                    onFocus={() => {
                    }}
                    sx={{
                      width: "8vw",
                      "& .MuiInputBase-root": {
                        height: "40px",
                      },
                      "& input": {
                        textAlign: "right",
                        height: "100%",
                      },
                      // Optional: Add visual feedback
                      backgroundColor:
                        Number(item.actualQuantityReceived) ===
                        Number(item.quantity)
                          ? "action.disabledBackground"
                          : "transparent",
                    }}
                  />
                </Grid>

                <Grid item xs={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Unit Cost"
                    placeholder="Unit Cost"
                    value={item.unitCost}
                    onChange={(e) =>
                      updateItem(index, "unitCost", Number(e.target.value))
                    }
                    disabled={isFieldDisabled(item.unitCost)}
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ color: "text.secondary", mr: 0.5 }}>
                          ₱
                        </Typography>
                      ),
                    }}
                    sx={{ "& input": { textAlign: "right" } }}
                  />
                </Grid>

                <Grid item xs={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Amount"
                    placeholder="Amount"
                    value={item.amount}
                    disabled={true}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <Typography sx={{ color: "text.secondary", mr: 0.5 }}>
                          ₱
                        </Typography>
                      ),
                    }}
                    sx={{ "& input": { textAlign: "right" } }}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <LoadingButton
          onClick={onSubmit}
          loading={isSubmitting}
          variant="contained"
          loadingPosition="start"
          startIcon={<SaveIcon />}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
