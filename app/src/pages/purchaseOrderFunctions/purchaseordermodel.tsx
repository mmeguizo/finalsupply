/*eslint no-unused-vars: "off"*/
/* eslint-disable */
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
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
// @ts-ignore
import DeleteIcon from "@mui/icons-material/Delete";
// @ts-ignore
import AddIcon from "@mui/icons-material/Add";
// @ts-ignore
// import Grid from "@mui/material/Grid2";
import Grid from "@mui/material/Grid";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
// import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
// @ts-ignore
import dayjs from "dayjs";
import { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
  const [recievedLimit, setrecievedLimit] = React.useState(0);
  const [addItemButton, setAddItemButtonDisable] = React.useState(false);

  // Initialize form state with purchase order data or empty values
  const [formData, setFormData] = React.useState({
    poNumber: purchaseOrder?.poNumber || "",
    supplier: purchaseOrder?.supplier || "",
    address: purchaseOrder?.address || "",
    placeOfDelivery: purchaseOrder?.placeOfDelivery || "",
    deliveryTerms: purchaseOrder?.deliveryTerms || "",
    paymentTerms: purchaseOrder?.paymentTerms || "",
    dateOfDelivery: purchaseOrder?.dateOfDelivery
      ? dayjs(purchaseOrder.dateOfDelivery)
      : dayjs(),
    // dateofdelivery: purchaseOrder?.dateofdelivery
    //   ? new Date(Number(purchaseOrder.dateofdelivery))
    //   : null,
    dateOfPayment: purchaseOrder?.dateOfPayment
      ? dayjs(purchaseOrder.dateOfPayment)
      : dayjs(),
    modeOfProcurement: purchaseOrder?.modeOfProcurement || "",
    items: purchaseOrder?.items || [],
    amount: purchaseOrder?.amount || 0,
    status: purchaseOrder?.status || "",
    invoice: purchaseOrder?.invoice || "",
  });

  console.log("Purchase Order Modal Form Data:", purchaseOrder);

  // if adding item remove disabled in input
  const [addingItem, setAddingItem] = React.useState(false);

  // Modify the disabled logic in your TextField components
  // For example:
  // const isIndexFieldDisabled = (existingValue: any) => {
  //   // If editing (purchaseOrder exists) and value exists and not adding new item
  //   // if (purchaseOrder && purchaseOrder.items.length !== 0 && existingValue && !addingItem) {
  //   if (purchaseOrder && purchaseOrder.items.length !== 0 && existingValue && !addingItem) {
  //     return true;
  //   }
  //   // If not editing (new PO) or adding new item
  //   return false;
  // };
  const isIndexFieldDisabled = (
    existingValue: any,
    field: string,
    itemIndex: number
  ) => {
    // If editing (purchaseOrder exists) and value exists and not adding new item
    if (field) {
      // If adding new item, only enable the last item's category
      if (addingItem && itemIndex === formData.items.length - 1) {
        return false;
      }
      // Otherwise, disable if purchase order exists and has items
      return purchaseOrder && purchaseOrder.items.length !== 0 && existingValue;
    }

    // For other fields, use the original logic
    // if (purchaseOrder && purchaseOrder.items.length !== 0 && existingValue && !addingItem) {
    //   return true;
    // }
    return false;
  };

  React.useEffect(() => {
    if (purchaseOrder) {
      if (purchaseOrder.status === "completed") {
        setAddItemButtonDisable(true);
      } else {
        setAddItemButtonDisable(false);
      }
      // Map items properly before setting state
      const mappedItems = purchaseOrder.items.map((item: any) => {
        return {
          ...item,
          recievelimit: item.quantity - item.actualQuantityReceived,
          currentInput: 0,
        };
      });

      // Set the formData with the latest purchaseOrder values
      setFormData({
        poNumber: purchaseOrder.poNumber || "",
        supplier: purchaseOrder.supplier || "",
        address: purchaseOrder.address || "",
        placeOfDelivery: purchaseOrder.placeOfDelivery || "",
        dateOfPayment: dayjs(purchaseOrder?.dateOfPayment) || dayjs(),
        dateOfDelivery: dayjs(purchaseOrder.dateOfDelivery) || dayjs(),
        deliveryTerms: purchaseOrder.deliveryTerms || "",
        paymentTerms: purchaseOrder.paymentTerms || "",
        modeOfProcurement: purchaseOrder.modeOfProcurement || "",
        items: mappedItems || [],
        amount: purchaseOrder.amount || 0,
        status: purchaseOrder.status || "",
        invoice: purchaseOrder.invoice || "",
      });

      // Reset additional states
      setAddingItem(false);
      setHasSubmitted(false);
    } else {
      // Reset formData when adding new PO
      setFormData({
        poNumber: "",
        supplier: "",
        address: "",
        placeOfDelivery: "",
        modeOfProcurement: "",
        deliveryTerms: "",
        paymentTerms: "",
        dateOfPayment: dayjs(),
        dateOfDelivery: dayjs(),
        items: [],
        amount: 0,
        status: "",
        invoice: "",
      });
    }
  }, [purchaseOrder, open]); // Depend on both purchaseOrder and open

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle date changes
  const handleDateChange = (date: Dayjs | null, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? date.format("YYYY-MM-DD HH:mm:ss") : "",
    }));
  };

  // Add empty item
  // Add empty item
  const addItem = () => {
    setAddingItem(true);
    setFormData({
      ...formData,
      items: [
        {
          category: "",
          itemName: "",
          description: "",
          unit: "",
          quantity: 0,
          unitCost: 0,
          amount: 0,
          actualQuantityReceived: 0,
          tag: "", // Add this field
          inventoryNumber: "", // Add this field
        },
        ...formData.items, // Prepend the new item to the top
      ],
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_: any, i: any) => i !== index);
    setFormData({
      ...formData,
      items: updatedItems,
    });
    if (updatedItems.length === 0) setAddingItem(false); // Reset if all items removed
  };
  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    const item = updatedItems[index];

    if (field === "currentInput") {
      // Only update if value is not empty string
      if (value === "" || value === null || value === undefined) {
        // Just update currentInput without changing actualQuantityReceived
        updatedItems[index] = {
          ...item,
          currentInput: value,
        };
      } else {

        updatedItems[index] = {
            ...item,
            currentInput: value,
          };
        // Calculate new actualQuantityReceived by adding value to existing
        // const inputValue = Number(value);
        // if (!isNaN(inputValue)) {
        //   const newActualReceived =
        //     Number(item.actualQuantityReceived) + inputValue;
        //   updatedItems[index] = {
        //     ...item,
        //     currentInput: value,
        //     actualQuantityReceived: newActualReceived,
        //   };
        // } else {
        //   // Invalid number, just update currentInput
        //   updatedItems[index] = {
        //     ...item,
        //     currentInput: value,
        //   };
        // }
      }
    } else {
      updatedItems[index] = {
        ...item,
        [field]: value,
      };
    }
    if (field === "quantity" || field === "unitCost") {
      updatedItems[index].amount =
        Number(updatedItems[index].quantity) *
        Number(updatedItems[index].unitCost);
    }

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // const updateItem = (index: number, field: string, value: any) => {
  //   const updatedItems = [...formData.items];
  //   const item = updatedItems[index];
  //   // Ensure currentInput does not exceed the remaining quantity
  //   if (field === "currentInput") {
  //     const remaining =
  //       Number(item.quantity) - Number(item.actualQuantityReceived);
  //     value = Math.min(Math.max(value, 0), remaining); // Clamp value between 0 and remaining
  //   }
  //   updatedItems[index] = {
  //     ...item,
  //     [field]: value,
  //   };
  //   // Auto-calculate amount if quantity or unitCost changes
  //   if (field === "quantity" || field === "unitCost") {
  //     updatedItems[index].amount =
  //       Number(updatedItems[index].quantity) *
  //       Number(updatedItems[index].unitCost);
  //   }
  //   console.log({ field, index, value, updatedItems });

  //   setFormData({
  //     ...formData,
  //     items: updatedItems,
  //   });
  // };

  // Handle form submission
  const onSubmit = () => {
    // Clean items - remove __typename and handle _id appropriately
    const cleanedItems = formData.items.map((item: any) => {
      delete item.recievelimit;
      // delete this since we will increment this on the backend no need an input here
      delete item.actualQuantityReceived;
      //remove later for test purposes
      // item.itemName = "";
      item.id = item.id ? item.id : "temp";
      const { __typename, ...cleanItem } = item;
      return cleanItem;
    });

    // Format dates for GraphQL
    const formattedData = {
      ...formData,
      items: cleanedItems,
      deliveryTerms: formData.deliveryTerms || "",
      modeOfProcurement: formData.modeOfProcurement || "",
      paymentTerms: formData.paymentTerms || "",
      address: formData.address || "",
      placeOfDelivery: formData.placeOfDelivery || "",
      poNumber: formData.poNumber,
      // poNumber: parseInt(formData.poNumber),
    };
    // Remove __typename, status from the main object if it exists

    const { status, ...cleanData } = formattedData;
    setAddingItem(false);
    console.log({ onSubmit: cleanData });
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
              // disabled={purchaseOrder ? true : false}
            />
          </Grid>
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice"
                name="invoice"
                value={formData.invoice}
                onChange={handleChange}
                // disabled={purchaseOrder?.invoice ? true : false}
                // disabled={isIndexFieldDisabled(formData.invoice)}
              />
            </Grid>
          )}

          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                // disabled={purchaseOrder ? true : false}
              />
            </Grid>
          )}
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mode of Procurement"
                name="modeOfProcurement"
                value={formData.modeOfProcurement}
                placeholder="e.g direct contracting"
                onChange={handleChange}
                // disabled={purchaseOrder ? true : false}
              />
            </Grid>
          )}
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Days"
                name="deliveryTerms"
                value={formData.deliveryTerms}
                onChange={handleChange}
                // disabled={purchaseOrder ? true : false}
              />
            </Grid>
          )}
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Terms"
                name="paymentTerms"
                value={formData.paymentTerms}
                placeholder="e.g not more than 30 days"
                onChange={handleChange}
                // disabled={purchaseOrder ? true : false}
              />
            </Grid>
          )}

          {purchaseOrder ? null : (
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                // disabled={purchaseOrder ? true : false}
              />
            </Grid>
          )}
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Office / Dept"
                name="placeOfDelivery"
                value={formData.placeOfDelivery}
                onChange={handleChange}
                // disabled={purchaseOrder ? true : false}
              />
            </Grid>
          )}
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  name="dateOfPayment"
                  label="Payment Date"
                  value={dayjs(formData.dateOfPayment)}
                  onChange={(newValue) =>
                    handleDateChange(newValue, "dateOfPayment")
                  }
                  // disabled={purchaseOrder ? true : false}
                />
              </LocalizationProvider>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                name="dateOfDelivery"
                label="Expected Delivery Date"
                value={dayjs(formData.dateOfDelivery)}
                onChange={(newValue) =>
                  handleDateChange(newValue, "dateOfDelivery")
                }
                // disabled={purchaseOrder ? true : false}
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
                disabled={addItemButton}
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
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Category</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Low/High Value</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Stock #</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Description</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Total</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Delivered</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Recieved</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Balance</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Unit</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Unit Cost</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Total Cost</Typography>
                </Grid>
                <Grid item xs={1} align="center">
                  <Typography variant="subtitle2">Delete</Typography>
                </Grid>
              </Grid>
            )}

            {/* Items table/form */}
            {formData.items.map((item: any, index: any) => (
              <Grid
                container
                spacing={1}
                key={index}
                sx={{
                  mb: 1,
                  p: 0.5,
                  alignItems: "center",
                  "&:hover": { backgroundColor: "action.hover" },
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Grid item xs={1}>
                  <Select
                    fullWidth
                    size="small"
                    value={item.category}
                    onChange={(e) =>
                      updateItem(index, "category", e.target.value)
                    }
                    label="Category"
                    // disabled={isIndexFieldDisabled(item.category, 'category', index)}
                  >
                    <MenuItem value={"property acknowledgement reciept"}>
                      PAR
                    </MenuItem>
                    <MenuItem value={"inventory custodian slip"}>ICS</MenuItem>
                    <MenuItem value={"requisition issue slip"}>RIS</MenuItem>
                  </Select>
                </Grid>

                {/* Add Tag dropdown for ICS items */}
                {item.category === "inventory custodian slip" ? (
                  <Grid item xs={1}>
                    <Select
                      fullWidth
                      size="small"
                      value={item.tag || ""}
                      onChange={(e) => updateItem(index, "tag", e.target.value)}
                      label="Tag"
                      // disabled={isIndexFieldDisabled(item.tag, 'tag', index)}
                    >
                      <MenuItem value={"low"}>Low Value</MenuItem>
                      <MenuItem value={"high"}>High Value</MenuItem>
                    </Select>
                  </Grid>
                ) : (
                  <Grid item xs={1}>
                    <Select
                      fullWidth
                      size="small"
                      value={item.tag || ""}
                      label="Tag"
                      disabled={true}
                    >
                      <MenuItem value={"low"}>Low Value</MenuItem>
                      <MenuItem value={"high"}>High Value</MenuItem>
                    </Select>
                  </Grid>
                )}
                {/* Add Inventory Number input for both ICS and PAR items */}
                {item.category === "inventory custodian slip" ||
                item.category === "property acknowledgement reciept" ? (
                  <Grid item xs={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Inventory #"
                      label="Inventory #"
                      value={item.inventoryNumber || ""}
                      onChange={(e) =>
                        updateItem(index, "inventoryNumber", e.target.value)
                      }
                      // disabled={isIndexFieldDisabled(item.inventoryNumber, 'inventoryNumber', index)}
                    />
                  </Grid>
                ) : (
                  <Grid item xs={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Inventory #"
                      label="Inventory #"
                      disabled={true}
                    />
                  </Grid>
                )}

                {/* Adjust the width of description based on whether tag is showing */}
                {/* <Grid item xs={item.category === "inventory custodian slip" ? 2 : 3}> */}
                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Description"
                    label="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    // disabled={isIndexFieldDisabled(item.description, 'description', index)}
                  />
                </Grid>
                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Total"
                    label="Total"
                    inputProps={{ min: 0, style: { textAlign: "right" } }}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Number(e.target.value))
                    }
                    // disabled={isIndexFieldDisabled(item.quantity, "quantity",index)}
                  />
                </Grid>
                {/* Delieverd */}
                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`Delivered: ${item.id && item.id !== "temp" ? Math.max(0, Number(item.actualQuantityReceived)) : ""}`}
                    type="number"
                    placeholder={`${item.id && item.id !== "temp" ? Math.max(0, Number(item.actualQuantityReceived)) : ""}`}
                    disabled={true}
                    sx={{
                      "& input": { textAlign: "right" },
                      backgroundColor:
                        Number(item.actualQuantityReceived) ===
                        Number(item.quantity)
                          ? "action.disabledBackground"
                          : "transparent",
                    }}
                  />
                </Grid>
                {/* Recieved */}
                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`0`}
                    type="number"
                    placeholder={``}
                    inputProps={{
                      min: 0,
                      max: Math.max(0, Number(item.quantity) - Number(item.actualQuantityReceived)),
                      style: { textAlign: "right" },
                    }}
                    value={item.currentInput || ""}
                    error={Number(item.currentInput) > (Number(item.quantity) - Number(item.actualQuantityReceived))}
                    helperText={
                      Number(item.currentInput) > (Number(item.quantity) - Number(item.actualQuantityReceived))
                        ? `exceeded (${Number(item.quantity) - Number(item.actualQuantityReceived)})`
                        : ""
                    }
                    onChange={(e) => {
                      let itemQty = Number(item.quantity);
                      let itemQtyRcvd = Number(item.actualQuantityReceived);
                      let numValue = Number(e.target.value);
                      updateItem(index, "currentInput", numValue);
                    }}
                    sx={{
                      "& input": { textAlign: "right" },
                      backgroundColor:
                        Number(item.actualQuantityReceived) === Number(item.quantity)
                          ? "action.disabledBackground"
                          : "transparent",
                    }}
                  />
                </Grid>
                {/* Balance */}
                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder={`${item.id && item.id !== "temp" ? Math.max(0, Number(item.quantity)) - Number(item.actualQuantityReceived) : Number(item.quantity)} ${item.unit}`}
                    onClick={(e) => {
                      console.log(
                        Number(item.quantity) -
                          Number(item.actualQuantityReceived)
                      );
                      console.log(Number(item.quantity));
                      console.log(Number(item.actualQuantityReceived));
                    }}
                    sx={{
                      "& input": { textAlign: "left" },
                      backgroundColor:
                        Number(item.actualQuantityReceived) ===
                        Number(item.quantity)
                          ? "action.disabledBackground"
                          : "transparent",
                    }}
                    disabled={true}
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
                    // disabled={isIndexFieldDisabled(item.unit,"unit",index)}
                  />
                </Grid>

                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Unit Cost"
                    label="Unit Cost"
                    value={item.unitCost}
                    onChange={(e) =>
                      updateItem(index, "unitCost", Number(e.target.value))
                    }
                    // disabled={isIndexFieldDisabled(item.unitCost,"unitCost", index)}
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

                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Total Cost"
                    label="Total Cost"
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
                <Grid item xs={1} sx={{ textAlign: "center" }}>
                  <IconButton
                    onClick={() => removeItem(index)}
                    color="error"
                    size="small"
                    disabled={purchaseOrder && item.id && item.id !== "temp"} // Optional: Disable for persisted items
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
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          loading={isSubmitting}
          variant="contained"
          loadingPosition="start"
          startIcon={<SaveIcon />}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
