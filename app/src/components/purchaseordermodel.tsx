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
// @ts-ignore
import DeleteIcon from "@mui/icons-material/Delete";
// @ts-ignore
import AddIcon from "@mui/icons-material/Add";
// @ts-ignore
// import Grid from "@mui/material/Grid2";
import Grid from '@mui/material/Grid';
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { Unstable_NumberInput as NumberInput } from "@mui/base/Unstable_NumberInput";
// @ts-ignore
import NumberInputBasic from "./numberInput";
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

  // if adding item remove disabled in input
  const [addingItem, setAddingItem] = React.useState(false);

  // Modify the disabled logic in your TextField components
  // For example:
  const isFieldDisabled = (existingValue: any) => {
    // If editing (purchaseOrder exists) and value exists and not adding new item
    if (purchaseOrder && purchaseOrder.items.length !== 0 && existingValue && !addingItem) {
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
          recievelimit: item.quantity - item.actualQuantityReceived,
          currentInput: 0,
        };
      });
      // console.log(mappedItems);

      // Set the formData with the latest purchaseOrder values
      setFormData({
        poNumber: purchaseOrder.poNumber || "",
        supplier: purchaseOrder.supplier || "",
        address: purchaseOrder.address || "",
        placeOfDelivery: purchaseOrder.placeOfDelivery || "",
        dateOfPayment: dayjs(),
        dateOfDelivery: dayjs(),
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
  const addItem = () => {
    setAddingItem(true);
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          category: "",
          itemName: "",
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



  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    const item = updatedItems[index];

    // Ensure currentInput does not exceed the remaining quantity
    if (field === "currentInput") {
      const remaining =
        Number(item.quantity) - Number(item.actualQuantityReceived);
      value = Math.min(Math.max(value, 0), remaining); // Clamp value between 0 and remaining
    }

    updatedItems[index] = {
      ...item,
      [field]: value,
    };

    // Auto-calculate amount if quantity or unitCost changes
    if (field === "quantity" || field === "unitCost") {
      updatedItems[index].amount =
        Number(updatedItems[index].quantity) *
        Number(updatedItems[index].unitCost);
    }

    // Check if quantities match to update status
    const allItemsComplete = updatedItems.every((item) => {
      const quantity = Number(item.quantity);
      const currentInput = Number(item.currentInput);
      const actualReceived = Number(item.actualQuantityReceived);

      return quantity === actualReceived + currentInput && quantity > 0;
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
    const cleanedItems = formData.items.map((item: any) => {
      delete item.recievelimit;
      // delete this since we will increment this on the backend no need an input here
      delete item.actualQuantityReceived;
      //remove later for test purposes
      item.itemName = "";
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
      address : formData.address || "",
      placeOfDelivery: formData.placeOfDelivery || "",
      poNumber: parseInt(formData.poNumber),
    };
    // Remove __typename, status from the main object if it exists

    const { status, ...cleanData } = formattedData;


    setAddingItem(false);
    // console.log(cleanData)
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
              disabled={purchaseOrder?.invoice ? true : false}
              // disabled={isFieldDisabled(formData.invoice)}
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
          {/* <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mode of Procurement"
              name="modeOfProcurement"
              value={formData.modeOfProcurement}
              placeholder="e.g direct contracting"
              onChange={handleChange}
              disabled={purchaseOrder ? true : false}
            />
          </Grid> */}
          {/* <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Delivery Terms"
              name="deliveryTerms"
              value={formData.deliveryTerms}
              onChange={handleChange}
              disabled={purchaseOrder ? true : false}
            />
          </Grid> */}
          {/* <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Payment Terms"
              name="paymentTerms"
              value={formData.paymentTerms}
              placeholder="e.g not more than 30 days"
              onChange={handleChange}
              disabled={purchaseOrder ? true : false}
            />
          </Grid> */}
          {/* <Grid item xs={12} md={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={purchaseOrder ? true : false}
            />
          </Grid> */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Office / Dept"
              name="placeOfDelivery"
              value={formData.placeOfDelivery}
              onChange={handleChange}
              disabled={purchaseOrder ? true : false}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                name="dateOfPayment"
                label="Payment Date"
                value={dayjs(formData.dateOfPayment)}
                onChange={(newValue) =>
                  handleDateChange(newValue, "dateOfPayment")
                }
                disabled={purchaseOrder ? true : false}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                name="dateOfDelivery"
                label="Delivery Date"
                value={dayjs(formData.dateOfDelivery)}
                onChange={(newValue) =>
                  handleDateChange(newValue, "dateOfDelivery")
                }
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
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Category</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2">Description</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2">Received</Typography>
                </Grid>
                <Grid item xs={1.5}>
                  <Typography variant="subtitle2">Qty</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Typography variant="subtitle2">Unit</Typography>
                </Grid>
                {/* <Grid item xs={1}>
                  <Typography variant="subtitle2">Item</Typography>
                </Grid> */}
                <Grid item xs={1.5}>
                  <Typography variant="subtitle2">Unit Cost</Typography>
                </Grid>
                <Grid item xs={1.5}>
                  <Typography variant="subtitle2">Amount</Typography>
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
                    onChange={(e) => updateItem(index, "category", e.target.value)}
                    label="Category"
                    disabled={isFieldDisabled(item.category)}
                  >
                    <MenuItem value={"property acknowledgement reciept"}>PAR</MenuItem>
                    <MenuItem value={"inventory custodian slip"}>ICS</MenuItem>
                    <MenuItem value={"requisition issue slip"}>RIS</MenuItem>
                  </Select>
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    disabled={isFieldDisabled(item.description)}
                  />
                </Grid>


                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    size="small"
                      label={`left: ${
                      (Number(item.quantity) -
                      Number(item.actualQuantityReceived)) || 0
                    }`}
                    type="number"
                    placeholder={`${
                      Number(item.quantity) -
                      Number(item.actualQuantityReceived)
                    }`}
                    inputProps={{
                      min: 0,
                      max: Number(item.quantity) - Number(item.actualQuantityReceived)
                    }}
                    value={item.currentInput || ""}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const remaining = Number(item.quantity) - Number(item.actualQuantityReceived);
                      if (value >= 0 && value <= remaining) {
                        updateItem(index, "currentInput", value);
                      } else if (value > remaining) {
                        updateItem(index, "currentInput", remaining);
                      }
                    }}
                    disabled={Number(item.quantity) === Number(item.actualQuantityReceived) || !item.category}
                    sx={{
                      "& input": { textAlign: "right" },
                      backgroundColor: Number(item.actualQuantityReceived) === Number(item.quantity) 
                        ? "action.disabledBackground" 
                        : "transparent"
                    }}
                  />
                </Grid>
                <Grid item xs={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Qty"
                    inputProps={{ min: 0, style: { textAlign: "right" } }}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    disabled={isFieldDisabled(item.quantity)}
                  />
                </Grid>

                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Unit"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    disabled={isFieldDisabled(item.unit)}
                  />
                </Grid>

                {/* <Grid item xs={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Item"
                    value={item.itemName}
                    onChange={(e) => updateItem(index, "itemName", e.target.value)}
                    disabled={isFieldDisabled(item.itemName)}
                  />
                </Grid> */}

                <Grid item xs={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Unit Cost"
                    value={item.unitCost}
                    onChange={(e) => updateItem(index, "unitCost", Number(e.target.value))}
                    disabled={isFieldDisabled(item.unitCost)}
                    InputProps={{
                      startAdornment: <Typography sx={{ color: "text.secondary", mr: 0.5 }}>₱</Typography>
                    }}
                    sx={{ "& input": { textAlign: "right" } }}
                  />
                </Grid>

                <Grid item xs={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    disabled={true}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Typography sx={{ color: "text.secondary", mr: 0.5 }}>₱</Typography>
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


 {/* 
                <Grid item xs={1}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={
                      Number(item.quantity) ===
                      Number(item.actualQuantityReceived)
                        ? `${item.quantity}`
                        : "Received"
                    }
                    placeholder={
                      Number(item.quantity) ===
                      Number(item.actualQuantityReceived)
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
                        Number(item.actualQuantityReceived) || !item.category
                    }
                    onChange={(e) => {

                      updateItem(index, "currentInput", value);
                    }}
                    onFocus={() => {
                      console.log(
                        Number(item.quantity) ===
                          Number(item.actualQuantityReceived)
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
                        Number(item.actualQuantityReceived) ===
                        Number(item.quantity)
                          ? "action.disabledBackground"
                          : "transparent",
                    }}
                  />
                </Grid> */}

/*


  // Update item
  // const updateItem = (index: number, field: string, value: any) => {
  //   console.log({ index, field, value });
  //   const updatedItems = [...formData.items];
  //   updatedItems[index] = {
  //     ...updatedItems[index],
  //     [field]: value,
  //   };

  //   // Auto-calculate amount if quantity or unitCost changes
  //   if (field === "quantity" || field === "unitCost") {
  //     formData.amount,
  //       (updatedItems[index].amount =
  //         Number(updatedItems[index].quantity) *
  //         Number(updatedItems[index].unitCost));
  //   }

  //   // Check if quantities match to update status
  //   const allItemsComplete = updatedItems.every((item) => {
  //     const quantity = Number(item.quantity);
  //     const currentInput = Number(item.currentInput);
  //     const actualReceived = Number(item.actualQuantityReceived);

  //     if (currentInput > 0) {
  //       return quantity === actualReceived + currentInput && quantity > 0;
  //     } else {
  //       return quantity === actualReceived && quantity > 0;
  //     }
  //   });

  //   console.log("allItemsComplete", allItemsComplete);
  //   // console.log("updatedItems", updatedItems);
  //   setFormData({
  //     ...formData,
  //     items: updatedItems,
  //     status: allItemsComplete ? "completed" : "pending",
  //   });
  // };

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
  //       poNumber: purchaseOrder.poNumber || "",
  //       supplier: purchaseOrder.supplier || "",
  //       address: purchaseOrder.address || "",

  //       placeOfDelivery: purchaseOrder.placeOfDelivery || "", // dateofdelivery: purchaseOrder.dateofdelivery
  //       // dateofdelivery: purchaseOrder.dateofdelivery
  //       // ? new Date(Number(purchaseOrder.dateofdelivery))
  //       // : null,
  //       dateOfPayment: purchaseOrder.dateOfPayment
  //         ? new Date(Number(purchaseOrder.dateOfPayment))
  //         : null,
  //       // items: purchaseOrder.items || [],
  //       items:
  //         purchaseOrder.items.map((item: any) => {
  //           setActualQuantityfromDb({
  //             actualQuantityReceived: item.actualQuantityReceived,
  //             id: item._id,
  //           });
  //           return {
  //             ...item,
  //             // Use the existing value instead of resetting to 0
  //             // actualQuantityReceived: item.actualQuantityReceived,
  //             // actualQuantityReceived:
  //             //   purchaseOrder.status === "completed"
  //             //     ? item.actualQuantityReceived
  //             //     : purchaseOrder.status !== "completed" &&
  //             //         item.quantity === item.actualQuantityReceived
  //             //       ? item.actualQuantityReceived
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
  //       poNumber: "",
  //       supplier: "",
  //       address: "",
  //       placeOfDelivery: "",
  //       // dateofdelivery: null,
  //       dateOfPayment: null,
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
  //       actualQuantityReceiveduseEffect: Number(
  //         actualQuantityfromDb.actualQuantityReceived
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
                    value={item.actualQuantityReceived}
                    min={0}
                    max={Number(item.quantity) - Number(actualQuantityfromDb)}
                    onInputChange={(e) => {
                      const value = Number(e.target.value);
                      if (
                        value >= 0 &&
                        value <= item.quantity - item.actualQuantityReceived
                      ) {
                        updateItem(index, "actualQuantityReceived", value);
                      }
                    }}
                  /> 

                  // disabled={
                    //   Number(item.actualQuantityReceived) ===
                    //     Number(item.quantity) &&
                    //   Number(item.actualQuantityReceived) !== 0
                    // }

                   // console.log(item);
                      // console.log({ value: value });
                      // const limit =
                      //   Number(item.quantity) -
                      //   Number(actualQuantityfromDb.actualQuantityReceived);
                      // console.log({ limit: limit });
                      // console.log({ condition: value >= 0 && value <= limit });
                      // if (value >= 0 && value <= limit) {
                      //   updateItem(index, "actualQuantityReceived", value);
                      // }

*/
