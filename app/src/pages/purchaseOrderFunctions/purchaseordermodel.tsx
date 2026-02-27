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
  Box,
} from "@mui/material";
import Chip from "@mui/material/Chip";
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

// Helper: compute delivery date = conformity + N days (N from deliveryTerms)
const computeDeliveryDate = (conformityDate: Dayjs | null, daysToAdd = 0) =>
  conformityDate ? conformityDate.add(daysToAdd, "day") : null;

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
  const isEditing = !!purchaseOrder;

  // Initialize form state with purchase order data or empty values
  const [formData, setFormData] = React.useState<any>({
    // keep dates as Dayjs
    poNumber: purchaseOrder?.poNumber || "",
    supplier: purchaseOrder?.supplier || "",
    address: purchaseOrder?.address || "",
    email: purchaseOrder?.email || "",
    telephone: purchaseOrder?.telephone || "",
    tin: purchaseOrder?.tin || "",
    campus: purchaseOrder?.campus || "",
    placeOfDelivery: purchaseOrder?.placeOfDelivery || "",
    deliveryTerms: purchaseOrder?.deliveryTerms || "",
    paymentTerms: purchaseOrder?.paymentTerms || "",
    dateOfConformity: purchaseOrder?.dateOfConformity
      ? dayjs(purchaseOrder.dateOfConformity)
      : dayjs(),
    dateOfDelivery: purchaseOrder?.dateOfDelivery
      ? dayjs(purchaseOrder.dateOfDelivery)
      : dayjs(),
    dateOfPayment: purchaseOrder?.dateOfPayment
      ? dayjs(purchaseOrder.dateOfPayment)
      : dayjs(),
    modeOfProcurement: purchaseOrder?.modeOfProcurement || "",
    items: purchaseOrder?.items || [],
    amount: purchaseOrder?.amount || 0,
    status: purchaseOrder?.status || "",
    invoice: purchaseOrder?.invoice || "",
    fundsource: purchaseOrder?.fundsource || "",
  });

  // if adding item remove disabled in input
  const [addingItem, setAddingItem] = React.useState(false);

  const isIndexFieldDisabled = (
    existingValue: any,
    field: string,
    itemIndex: number,
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
    return false;
  };

  React.useEffect(() => {
    if (purchaseOrder) {
      if (purchaseOrder.status === "completed") {
        setAddItemButtonDisable(true);
      } else {
        setAddItemButtonDisable(false);
      }
      const mappedItems = (purchaseOrder.items || []).map((item: any) => ({
        category: item.category || "",
        itemName: item.itemName || "",
        description: item.description || "",
        specification: item.specification || "",
        generalDescription: item.generalDescription || "",
        unit: item.unit || "",
        quantity: item.quantity ?? 0,
        unitCost: item.unitCost ?? 0,
        amount: item.amount ?? 0,
        actualQuantityReceived: item.actualQuantityReceived ?? 0,
        tag: item.tag || "",
        inventoryNumber: item.inventoryNumber || "",
        recievelimit: (item.quantity ?? 0) - (item.actualQuantityReceived ?? 0),
        currentInput: 0,
        id: item.id,
      }));

      setFormData({
        poNumber: purchaseOrder.poNumber || "",
        supplier: purchaseOrder.supplier || "",
        address: purchaseOrder.address || "",
        email: purchaseOrder.email || "",
        telephone: purchaseOrder.telephone || "",
        tin: purchaseOrder.tin || "",
        campus: purchaseOrder.campus || "",
        placeOfDelivery: purchaseOrder.placeOfDelivery || "",
        dateOfConformity: dayjs(purchaseOrder?.dateOfConformity) || dayjs(),
        dateOfPayment: dayjs(purchaseOrder?.dateOfPayment) || dayjs(),
        dateOfDelivery: dayjs(purchaseOrder.dateOfDelivery) || dayjs(),
        deliveryTerms: purchaseOrder.deliveryTerms || "", // always string
        paymentTerms: purchaseOrder.paymentTerms || "",
        modeOfProcurement: purchaseOrder.modeOfProcurement || "",
        items: mappedItems,
        amount: purchaseOrder.amount || 0,
        status: purchaseOrder.status || "",
        invoice: purchaseOrder.invoice || "",
        fundsource: purchaseOrder?.fundsource || "",
      });
      setAddingItem(false);
      setHasSubmitted(false);
    } else {
      // Reset when adding new PO to avoid stale state from previous edit session
      setAddItemButtonDisable(false);
      setFormData({
        poNumber: "",
        supplier: "",
        address: "",
        email: "",
        telephone: "",
        tin: "",
        campus: "",
        placeOfDelivery: "",
        modeOfProcurement: "",
        deliveryTerms: "",
        paymentTerms: "",
        dateOfConformity: dayjs(),
        dateOfPayment: dayjs(),
        dateOfDelivery: dayjs(),
        items: [],
        amount: 0,
        status: "",
        invoice: "",
        fundsource: "",
      });
    }
  }, [purchaseOrder, open]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => {
      const next: any = { ...prev, [name]: value };
      if (name === "deliveryTerms") {
        const days = parseInt(value as any, 10);
        if (!isNaN(days) && prev.dateOfConformity) {
          const newDelivery = computeDeliveryDate(prev.dateOfConformity, days);
          next.dateOfDelivery = newDelivery;
        }
      }
      return next;
    });
  };

  // Date handlers (store Dayjs objects)
  const handleDateChange = (date: Dayjs | null, field: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleConformityDateChange = (date: Dayjs | null) => {
    setFormData((prev: any) => {
      const days = parseInt(prev.deliveryTerms || "0", 10);
      const deliveryDate = !isNaN(days)
        ? computeDeliveryDate(date, days)
        : date;
      return {
        ...prev,
        dateOfConformity: date,
        dateOfDelivery: deliveryDate,
      };
    });
  };

  // Add empty item
  // Add empty item
  const addItem = () => {
    setAddingItem(true);
    setFormData((prev: any) => ({
      ...prev,
      items: [
        {
          category: "",
          itemName: "",
          description: "",
          specification: "",
          generalDescription: "",
          unit: "",
          quantity: 0,
          unitCost: 0,
          amount: 0,
          actualQuantityReceived: 0,
          tag: "",
          inventoryNumber: "",
          recievelimit: 0,
          currentInput: 0,
          id: "temp",
        },
        ...prev.items,
      ],
    }));
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
      dateOfConformity: formData.dateOfConformity
        ? dayjs(formData.dateOfConformity).format("YYYY-MM-DD HH:mm:ss")
        : null,
      dateOfDelivery: formData.dateOfDelivery
        ? dayjs(formData.dateOfDelivery).format("YYYY-MM-DD HH:mm:ss")
        : null,
      dateOfPayment: formData.dateOfPayment
        ? dayjs(formData.dateOfPayment).format("YYYY-MM-DD HH:mm:ss")
        : null,
    };

    const { status, ...cleanData } = formattedData;
    console.log("Submitting Purchase Order:", cleanData);
    handleSave(cleanData);
  };

  return (
    <Dialog
      key={
        isEditing
          ? `edit-${purchaseOrder?.id || purchaseOrder?.poNumber || "unknown"}`
          : "add"
      }
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {purchaseOrder
          ? "Update Recieved Item or Invoice"
          : "Add Purchase Order"}
        <Chip
          label={
            isEditing
              ? `Edit • ${String(formData.status || purchaseOrder?.status || "").toUpperCase() || "PENDING"}`
              : "Add"
          }
          size="small"
          color={
            isEditing &&
            String(
              formData.status || purchaseOrder?.status || "",
            ).toLowerCase() === "completed"
              ? "default"
              : "primary"
          }
        />
      </DialogTitle>
      <DialogContent>
        {(() => {
          const addItemDisabled = !isEditing
            ? false
            : String(
                formData.status || purchaseOrder?.status || "",
              ).toLowerCase() === "completed";
          console.log("[PO Model] render", {
            dialogKey: isEditing
              ? `edit-${purchaseOrder?.id || purchaseOrder?.poNumber || "unknown"}`
              : "add",
            open,
            isEditing,
            formStatus: formData.status,
            poStatus: purchaseOrder?.status,
            addItemDisabled,
            items: formData.items?.length || 0,
          });
          return null;
        })()}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic PO Info */}
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <Select
                fullWidth
                value={formData.placeOfDelivery}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    placeOfDelivery: e.target.value,
                    campus: e.target.value,
                  }))
                }
                displayEmpty
              >
                <MenuItem value="">
                  <em>Place of Delivery</em>
                </MenuItem>
                <MenuItem value="Talisay Main">Talisay Main</MenuItem>
                <MenuItem value="Alijis">Alijis</MenuItem>
                <MenuItem value="Binalbagan">Binalbagan</MenuItem>
                <MenuItem value="Fortune Town">Fortune Town</MenuItem>
              </Select>
            </Grid>
          )}

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
                label="TIN"
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                placeholder="e.g 123-456-789-000"
              />
            </Grid>
          )}
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="e.g (034) 123-4567"
              />
            </Grid>
          )}
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="supplier@example.com"
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
                value={formData.deliveryTerms ?? ""} // ensure string
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fund Source"
                name="fundsource"
                value={formData.fundsource}
                placeholder="Source of Funds"
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
          {/* Office/Dept removed - not needed before end user assignment */}

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                name="dateOfDelivery"
                label="Expected Delivery Date"
                value={formData.dateOfDelivery}
                onChange={(newValue) =>
                  handleDateChange(newValue, "dateOfDelivery")
                }
                // disabled={purchaseOrder ? true : false}
              />
            </LocalizationProvider>
          </Grid>
          {purchaseOrder ? null : (
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  name="dateOfConformity"
                  label="Conformity Date"
                  value={formData.dateOfConformity}
                  onChange={handleConformityDateChange}
                  // disabled={purchaseOrder ? true : false}
                />
              </LocalizationProvider>
            </Grid>
          )}
          {/* Items Section */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 3, display: "flex", alignItems: "center" }}
            >
              Items
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
                variant="contained"
                size="small"
                sx={{ ml: 2 }}
                disabled={
                  // In Add mode, always allow adding items
                  !isEditing
                    ? false
                    : // In Edit mode, disable if current status is completed (prefer formData.status if present)
                      String(
                        formData.status || purchaseOrder?.status || "",
                      ).toLowerCase() === "completed"
                }
              >
                Add Item
              </Button>
            </Typography>

            {/* Items header */}
            {formData.items.length > 0 && (
              <Box sx={{ overflowX: "auto", width: "100%", mb: 1 }}>
                <Box sx={{ minWidth: 980 }}>
                  <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    sx={{
                      mb: 1,
                      px: 1,
                      py: 0.5,
                      backgroundColor: "background.default",
                      borderRadius: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {/* use fixed flex widths so the entire row stays on one line */}
                    {/* Cat/Low-High columns removed: category is set in Generate IAR modal, not here */}
                    <Grid item sx={{ flex: "0 0 4%", maxWidth: 45 }}>
                      <Typography variant="subtitle2">Item #</Typography>
                    </Grid>
                    <Grid item sx={{ flex: "0 0 7%", maxWidth: 70 }}>
                      <Typography variant="subtitle2">Stock #</Typography>
                    </Grid>
                    <Grid
                      item
                      sx={{
                        flex: "0 0 14%",
                        minWidth: 100,
                      }}
                    >
                      <Typography variant="subtitle2">Desc</Typography>
                    </Grid>
                    <Grid
                      item
                      sx={{
                        flex: "0 0 18%",
                        minWidth: 144,
                      }}
                    >
                      <Typography variant="subtitle2">Specs</Typography>
                    </Grid>
                    <Grid
                      item
                      sx={{
                        flex: "0 0 18%",
                        minWidth: 144,
                      }}
                    >
                      <Typography variant="subtitle2">Gen. Desc</Typography>
                    </Grid>
                    <Grid item sx={{ flex: "0 0 8%", maxWidth: 90 }}>
                      <Typography variant="subtitle2">Qty</Typography>
                    </Grid>
                    {/* Delivered, Received, Balance columns only shown when editing */}
                    {isEditing && (
                      <Grid item sx={{ flex: "0 0 8%", maxWidth: 85 }}>
                        <Typography variant="subtitle2">Delivered</Typography>
                      </Grid>
                    )}
                    {isEditing && (
                      <Grid item sx={{ flex: "0 0 8%", maxWidth: 85 }}>
                        <Typography variant="subtitle2">Received</Typography>
                      </Grid>
                    )}
                    {isEditing && (
                      <Grid item sx={{ flex: "0 0 8%", maxWidth: 85 }}>
                        <Typography variant="subtitle2">Balance</Typography>
                      </Grid>
                    )}
                    <Grid item sx={{ flex: "0 0 7%", maxWidth: 100 }}>
                      <Typography variant="subtitle2">Unit</Typography>
                    </Grid>
                    <Grid item sx={{ flex: "0 0 9%", maxWidth: 120 }}>
                      <Typography variant="subtitle2">Unit Cost</Typography>
                    </Grid>
                    <Grid item sx={{ flex: "0 0 9%", maxWidth: 120 }}>
                      <Typography variant="subtitle2">Total Cost</Typography>
                    </Grid>
                    <Grid
                      item
                      sx={{ flex: "0 0 5%", maxWidth: 60, textAlign: "center" }}
                    >
                      <Typography variant="subtitle2">Del</Typography>
                    </Grid>
                  </Grid>

                  {formData.items.map((item: any, index: any) => (
                    <Grid
                      container
                      spacing={1}
                      key={index}
                      alignItems="center"
                      sx={{
                        mb: 0.5,
                        p: 0.5,
                        "&:hover": { backgroundColor: "action.hover" },
                        borderBottom: 1,
                        borderColor: "divider",
                        flexWrap: "nowrap",
                      }}
                    >
                      {(() => {
                        // Lock most fields once any units have been received
                        const hasReceived =
                          Number(item.actualQuantityReceived ?? 0) > 0;
                        const isCompleted =
                          String(
                            purchaseOrder?.status || formData.status || "",
                          ).toLowerCase() === "completed";
                        const lockFields = hasReceived || isCompleted;
                        return null;
                      })()}
                      {/** Helper booleans for clarity inside JSX below */}
                      {(() => {
                        return null;
                      })()}
                      {/* Category/Tag removed from this modal — set in Generate IAR step only */}

                      <Grid item sx={{ flex: "0 0 4%", maxWidth: 45 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            textAlign: "center",
                            color: "text.secondary",
                          }}
                        >
                          {formData.items.length - index}
                        </Typography>
                      </Grid>

                      <Grid item sx={{ flex: "0 0 7%", maxWidth: 70 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={item.inventoryNumber ?? ""}
                          onChange={(e) =>
                            updateItem(index, "inventoryNumber", e.target.value)
                          }
                          disabled={
                            Number(item.actualQuantityReceived ?? 0) > 0 ||
                            String(
                              purchaseOrder?.status || formData.status || "",
                            ).toLowerCase() === "completed"
                          }
                        />
                      </Grid>

                      <Grid
                        item
                        sx={{
                          flex: "0 0 14%",
                          minWidth: 100,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          value={item.description ?? ""}
                          onChange={(e) =>
                            updateItem(index, "description", e.target.value)
                          }
                          disabled={
                            String(
                              purchaseOrder?.status || formData.status || "",
                            ).toLowerCase() === "completed" ||
                            (Number(item.quantity ?? 0) > 0 &&
                              Number(item.quantity ?? 0) ===
                                Number(item.actualQuantityReceived ?? 0))
                          }
                        />
                      </Grid>

                      <Grid
                        item
                        sx={{
                          flex: "0 0 18%",
                          minWidth: 144,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          value={item.specification ?? ""}
                          onChange={(e) =>
                            updateItem(index, "specification", e.target.value)
                          }
                          multiline
                          maxRows={2}
                          disabled={
                            String(
                              purchaseOrder?.status || formData.status || "",
                            ).toLowerCase() === "completed" ||
                            (Number(item.quantity ?? 0) > 0 &&
                              Number(item.quantity ?? 0) ===
                                Number(item.actualQuantityReceived ?? 0))
                          }
                        />
                      </Grid>

                      <Grid
                        item
                        sx={{
                          flex: "0 0 18%",
                          minWidth: 144,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          value={item.generalDescription ?? ""}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "generalDescription",
                              e.target.value,
                            )
                          }
                          multiline
                          maxRows={2}
                          disabled={
                            String(
                              purchaseOrder?.status || formData.status || "",
                            ).toLowerCase() === "completed" ||
                            (Number(item.quantity ?? 0) > 0 &&
                              Number(item.quantity ?? 0) ===
                                Number(item.actualQuantityReceived ?? 0))
                          }
                        />
                      </Grid>

                      <Grid item sx={{ flex: "0 0 8%", maxWidth: 90 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={item.quantity ?? 0}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                          // Disable if any quantity has already been received OR PO completed
                          disabled={
                            Number(item.actualQuantityReceived ?? 0) > 0 ||
                            String(
                              purchaseOrder?.status || formData.status || "",
                            ).toLowerCase() === "completed"
                          }
                          inputProps={{ style: { textAlign: "right" } }}
                        />
                      </Grid>

                      {/* Delivered, Received (currentInput), Balance only shown when editing */}
                      {isEditing && (
                        <Grid item sx={{ flex: "0 0 8%", maxWidth: 85 }}>
                          {item.id !== "temp" && (
                            <TextField
                              fullWidth
                              size="small"
                              disabled
                              value={item.actualQuantityReceived ?? ""}
                              inputProps={{ style: { textAlign: "right" } }}
                            />
                          )}
                        </Grid>
                      )}

                      {isEditing && (
                        <Grid item sx={{ flex: "0 0 8%", maxWidth: 85 }}>
                          {item.id !== "temp" && (
                            <TextField
                              fullWidth
                              size="small"
                              value={item.currentInput || ""}
                              type="number"
                              onChange={(e) => {
                                const raw = e.target.value;
                                const remaining = Math.max(
                                  0,
                                  Number(item.quantity ?? 0) -
                                    Number(item.actualQuantityReceived ?? 0),
                                );
                                // Allow clearing the input box
                                if (raw === "") {
                                  updateItem(index, "currentInput", "");
                                  return;
                                }
                                const numeric = Number(raw);
                                if (Number.isNaN(numeric)) {
                                  // ignore non-numeric
                                  return;
                                }
                                const clamped = Math.min(
                                  Math.max(0, numeric),
                                  remaining,
                                );
                                updateItem(index, "currentInput", clamped);
                              }}
                              disabled={
                                Number(item.quantity ?? 0) -
                                  Number(item.actualQuantityReceived ?? 0) <=
                                0
                              }
                              placeholder={
                                Number(item.quantity ?? 0) -
                                  Number(item.actualQuantityReceived ?? 0) <=
                                0
                                  ? "Fully received"
                                  : undefined
                              }
                              inputProps={{
                                style: { textAlign: "right" },
                                min: 0,
                                max: Math.max(
                                  0,
                                  Number(item.quantity ?? 0) -
                                    Number(item.actualQuantityReceived ?? 0),
                                ),
                              }}
                            />
                          )}
                        </Grid>
                      )}

                      {isEditing && (
                        <Grid item sx={{ flex: "0 0 8%", maxWidth: 85 }}>
                          {item.id !== "temp" && (
                            <TextField
                              fullWidth
                              size="small"
                              disabled
                              value={Math.max(
                                0,
                                Number(item.quantity) -
                                  Number(item.actualQuantityReceived),
                              )}
                            />
                          )}
                        </Grid>
                      )}

                      <Grid item sx={{ flex: "0 0 7%", maxWidth: 100 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={item.unit ?? ""}
                          onChange={(e) =>
                            updateItem(index, "unit", e.target.value)
                          }
                          disabled={
                            Number(item.actualQuantityReceived ?? 0) > 0 ||
                            String(
                              purchaseOrder?.status || formData.status || "",
                            ).toLowerCase() === "completed"
                          }
                        />
                      </Grid>

                      <Grid item sx={{ flex: "0 0 9%", maxWidth: 120 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={item.unitCost ?? 0}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unitCost",
                              Number(e.target.value),
                            )
                          }
                          InputProps={{
                            startAdornment: (
                              <Typography
                                sx={{ color: "text.secondary", mr: 0.5 }}
                              >
                                ₱
                              </Typography>
                            ),
                          }}
                          sx={{ "& input": { textAlign: "right" } }}
                          disabled={
                            Number(item.actualQuantityReceived ?? 0) > 0 ||
                            String(
                              purchaseOrder?.status || formData.status || "",
                            ).toLowerCase() === "completed"
                          }
                        />
                      </Grid>

                      <Grid item sx={{ flex: "0 0 9%", maxWidth: 120 }}>
                        <TextField
                          fullWidth
                          size="small"
                          disabled
                          value={item.amount ?? 0}
                          InputProps={{
                            startAdornment: (
                              <Typography
                                sx={{ color: "text.secondary", mr: 0.5 }}
                              >
                                ₱
                              </Typography>
                            ),
                          }}
                          sx={{ "& input": { textAlign: "right" } }}
                        />
                      </Grid>

                      <Grid
                        item
                        sx={{
                          flex: "0 0 5%",
                          maxWidth: 60,
                          textAlign: "center",
                        }}
                      >
                        <IconButton
                          onClick={() => removeItem(index)}
                          color="error"
                          size="small"
                          disabled={
                            purchaseOrder && item.id && item.id !== "temp"
                          }
                          title="Remove"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </Box>
            )}

            {/* Items table/form */}
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
