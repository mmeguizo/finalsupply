/*eslint no-unused-vars: "off"*/

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
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { Unstable_NumberInput as NumberInput } from "@mui/base/Unstable_NumberInput";
import NumberInputBasic from "./numberInput";

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

  // Initialize form state with purchase order data or empty values
  const [formData, setFormData] = React.useState({
    ponumber: purchaseOrder?.ponumber || "",
    supplier: purchaseOrder?.supplier || "",
    address: purchaseOrder?.address || "",
    placeofdelivery: purchaseOrder?.placeofdelivery || "",
    // dateofdelivery: purchaseOrder?.dateofdelivery
    //   ? new Date(Number(purchaseOrder.dateofdelivery))
    //   : null,
    dateofpayment: purchaseOrder?.dateofpayment
      ? new Date(Number(purchaseOrder.dateofpayment))
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

  React.useEffect(() => {
    if (purchaseOrder) {
      // Map items properly before setting state
      const mappedItems = purchaseOrder.items.map((item: any) => {
        return {
          ...item,
          recievelimit: item.quantity - item.actualquantityrecieved,
          currentInput: 0,
        };
      });
      // console.log(mappedItems);

      // Set the formData with the latest purchaseOrder values
      setFormData({
        ponumber: purchaseOrder.ponumber || "",
        supplier: purchaseOrder.supplier || "",
        address: purchaseOrder.address || "",
        placeofdelivery: purchaseOrder.placeofdelivery || "",
        dateofpayment: purchaseOrder.dateofpayment
          ? new Date(Number(purchaseOrder.dateofpayment))
          : null,
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
        ponumber: "",
        supplier: "",
        address: "",
        placeofdelivery: "",
        dateofpayment: null,
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
    console.log(name, value);
    setFormData({
      ...formData,
      [name]: value,
    });
    console.log(formData);
  };

  // Handle date changes
  const handleDateChange = (date: Date | null, fieldName: string) => {
    setFormData({
      ...formData,
      [fieldName]: date,
    });
  };

  // Add empty item
  // const addItem = () => {
  //   setAddingItem(true);
  //   setFormData({
  //     ...formData,
  //     items: [
  //       ...formData.items,
  //       {
  //         category: "",
  //         item: "",
  //         description: "",
  //         unit: "",
  //         quantity: 0,
  //         unitcost: 0,
  //         amount: 0,
  //         actualquantityrecieved: 0,
  //       },
  //     ],
  //   });
  // };

  // Update item
  const updateItem = (index: number, field: string, value: any) => {
    console.log({ index, field, value });
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    console.log({ updatedItems });

    // Auto-calculate amount if quantity or unitcost changes
    if (field === "quantity" || field === "unitcost") {
      formData.amount,
        (updatedItems[index].amount =
          Number(updatedItems[index].quantity) *
          Number(updatedItems[index].unitcost));
    }

    // Check if quantities match to update status
    const allItemsComplete = updatedItems.every((item) => {
      const quantity = Number(item.quantity);
      const currentInput = Number(item.currentInput);
      const actualReceived = Number(item.actualquantityrecieved);

      if (currentInput > 0) {
        return quantity === actualReceived + currentInput && quantity > 0;
      } else {
        return quantity === actualReceived && quantity > 0;
      }
    });

    console.log("allItemsComplete", allItemsComplete);
    // console.log("updatedItems", updatedItems);
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
      delete item.recievelimit;
      delete item.actualquantityrecieved;
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
      dateofpayment: formData.dateofpayment
        ? formData.dateofpayment.getTime().toString()
        : null,
      ponumber: parseInt(formData.ponumber),
    };

    // Remove __typename, status from the main object if it exists

    const { __typename, status, ...cleanData } = formattedData;

    console.log("formattedData", cleanData);

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
              name="ponumber"
              value={formData.ponumber}
              onChange={handleChange}
              disabled={purchaseOrder ? true : false}
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
              disabled={purchaseOrder ? true : false}
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={purchaseOrder ? true : false}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Place of Delivery"
              name="placeofdelivery"
              value={formData.placeofdelivery}
              onChange={handleChange}
              disabled={purchaseOrder ? true : false}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Payment Date"
                value={formData.dateofpayment}
                onChange={(date) => handleDateChange(date, "dateofpayment")}
                disabled={purchaseOrder ? true : false}
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
              {/*<Button*/}
              {/*  startIcon={<AddIcon />}*/}
              {/*  onClick={addItem}*/}
              {/*  variant="contained"*/}
              {/*  size="small"*/}
              {/*  sx={{ ml: 2 }}*/}
              {/*>*/}
              {/*  Add Item*/}
              {/*</Button>*/}
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
                    label={
                      Number(item.quantity) ===
                      Number(item.actualquantityrecieved)
                        ? `${item.quantity}`
                        : "Received"
                    }
                    placeholder={
                      Number(item.quantity) ===
                      Number(item.actualquantityrecieved)
                        ? `${item.quantity}`
                        : "0"
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: Number(item.recievelimit || 0),
                      },
                    }}
                    disabled={
                      Number(item.quantity) ===
                        Number(item.actualquantityrecieved) || !item.category
                    }
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      updateItem(index, "currentInput", value);
                    }}
                    onFocus={() => {
                      console.log(
                        Number(item.quantity) ===
                          Number(item.actualquantityrecieved)
                      );
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
                        Number(item.actualquantityrecieved) ===
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
                    value={item.unitcost}
                    onChange={(e) =>
                      updateItem(index, "unitcost", Number(e.target.value))
                    }
                    disabled={isFieldDisabled(item.unitcost)}
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
/*

  // const handleCategoryChange = (e: SelectChangeEvent) => {
  //   const { value } = e.target;
  //   setFormData({
  //     ...formData,
  //     ["category"]: value,
  //   });
  //   console.log(formData);
  // };


 // Update form data when purchaseOrder prop changes
  // React.useEffect(() => {
  //   // Reset addingItem when modal opens/closes
  //   setAddingItem(false);
  //   setHasSubmitted(false); // Add this line
  //   if (purchaseOrder) {
  //     console.log(purchaseOrder);
  //     setFormData({
  //       ponumber: purchaseOrder.ponumber || "",
  //       supplier: purchaseOrder.supplier || "",
  //       address: purchaseOrder.address || "",

  //       placeofdelivery: purchaseOrder.placeofdelivery || "", // dateofdelivery: purchaseOrder.dateofdelivery
  //       // dateofdelivery: purchaseOrder.dateofdelivery
  //       // ? new Date(Number(purchaseOrder.dateofdelivery))
  //       // : null,
  //       dateofpayment: purchaseOrder.dateofpayment
  //         ? new Date(Number(purchaseOrder.dateofpayment))
  //         : null,
  //       // items: purchaseOrder.items || [],
  //       items:
  //         purchaseOrder.items.map((item: any) => {
  //           setActualQuantityfromDb({
  //             actualquantityrecieved: item.actualquantityrecieved,
  //             id: item._id,
  //           });
  //           return {
  //             ...item,
  //             // Use the existing value instead of resetting to 0
  //             // actualquantityrecieved: item.actualquantityrecieved,
  //             // actualquantityrecieved:
  //             //   purchaseOrder.status === "completed"
  //             //     ? item.actualquantityrecieved
  //             //     : purchaseOrder.status !== "completed" &&
  //             //         item.quantity === item.actualquantityrecieved
  //             //       ? item.actualquantityrecieved
  //             //       : 0,
  //           };
  //         }) || [],
  //       amount: purchaseOrder.amount || 0,
  //       status: purchaseOrder.status || "",
  //       invoice: purchaseOrder.invoice || "",
  //     });
  //   } else {
  //     // Reset form when adding new PO
  //     setFormData({
  //       ponumber: "",
  //       supplier: "",
  //       address: "",
  //       placeofdelivery: "",
  //       // dateofdelivery: null,
  //       dateofpayment: null,
  //       amount: 0,
  //       items: [],
  //       status: "",
  //       invoice: "",
  //     });
  //   }
  // }, [purchaseOrder, open]);
  // Add this useEffect to log updated values
  // React.useEffect(() => {
  //   formData.items.forEach((item) => {
  //     console.log({
  //       itemquantityuseEffect: Number(item.quantity),
  //       actualquantityrecieveduseEffect: Number(
  //         actualQuantityfromDb.actualquantityrecieved
  //       ),
  //     });
  //   });
  // }, [formData.items, actualQuantityfromDb]);


  // Remove item
  // const removeItem = (index: number) => {
  //   setFormData({
  //     ...formData,
  //     items: formData.items.filter((_, i) => i !== index),
  //   });
  // };


  //ui 

     <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Delivery Date"
                value={formData.dateofdelivery}
                onChange={(date) => handleDateChange(date, "dateofdelivery")}
              />
            </LocalizationProvider>
          </Grid> 

          <NumberInput
                    placeholder="Received"
                    value={item.actualquantityrecieved}
                    min={0}
                    max={Number(item.quantity) - Number(actualQuantityfromDb)}
                    onInputChange={(e) => {
                      const value = Number(e.target.value);
                      if (
                        value >= 0 &&
                        value <= item.quantity - item.actualquantityrecieved
                      ) {
                        updateItem(index, "actualquantityrecieved", value);
                      }
                    }}
                  /> 

                  // disabled={
                    //   Number(item.actualquantityrecieved) ===
                    //     Number(item.quantity) &&
                    //   Number(item.actualquantityrecieved) !== 0
                    // }

                   // console.log(item);
                      // console.log({ value: value });
                      // const limit =
                      //   Number(item.quantity) -
                      //   Number(actualQuantityfromDb.actualquantityrecieved);
                      // console.log({ limit: limit });
                      // console.log({ condition: value >= 0 && value <= limit });
                      // if (value >= 0 && value <= limit) {
                      //   updateItem(index, "actualquantityrecieved", value);
                      // }

*/
