/* eslint-disable */
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Checkbox,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface GenerateIarModalProps {
  open: boolean;
  handleClose: () => void;
  purchaseOrder: any;
  onGenerate: (purchaseOrderId: number, items: any[]) => Promise<any>;
  isSubmitting: boolean;
}

interface IarLineItem {
  purchaseOrderItemId: number;
  description: string;
  specification: string;
  generalDescription: string;
  unit: string;
  quantity: number;
  actualQuantityReceived: number;
  remaining: number;
  category: string;
  tag: string;
  received: number;
  selected: boolean;
  unitCost: number;
  inventoryNumber: string;
}

export default function GenerateIarModal({
  open,
  handleClose,
  purchaseOrder,
  onGenerate,
  isSubmitting,
}: GenerateIarModalProps) {
  const [lineItems, setLineItems] = React.useState<IarLineItem[]>([]);
  const [error, setError] = React.useState<string>("");

  // Initialize line items from PO items
  React.useEffect(() => {
    if (purchaseOrder && purchaseOrder.items) {
      const items: IarLineItem[] = purchaseOrder.items
        .filter((item: any) => !item.isDeleted)
        .map((item: any) => {
          const qty = Number(item.quantity ?? 0);
          const received = Number(item.actualQuantityReceived ?? 0);
          const remaining = Math.max(0, qty - received);
          return {
            purchaseOrderItemId: item.id,
            description: item.description || "",
            specification: item.specification || "",
            generalDescription: item.generalDescription || "",
            unit: item.unit || "",
            quantity: qty,
            actualQuantityReceived: received,
            remaining,
            category: item.category || "",
            tag: item.tag || "",
            received: 0, // default to 0 so user types the received qty
            selected: remaining > 0, // auto-select items with remaining qty
            unitCost: Number(item.unitCost ?? 0),
            inventoryNumber: item.inventoryNumber || "",
          };
        });
      setLineItems(items);
      setError("");
    } else {
      setLineItems([]);
    }
  }, [purchaseOrder, open]);

  const updateLine = (index: number, field: string, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // If changing category away from ICS, clear tag
      if (field === "category" && value !== "inventory custodian slip") {
        updated[index].tag = "";
      }

      // Clamp received to remaining
      if (field === "received") {
        const numeric = Number(value);
        if (isNaN(numeric) || numeric < 0) {
          updated[index].received = 0;
        } else {
          updated[index].received = Math.min(numeric, updated[index].remaining);
        }
      }

      return updated;
    });
  };

  const toggleSelect = (index: number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selected: !updated[index].selected,
      };
      return updated;
    });
  };

  const selectAll = () => {
    setLineItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: item.remaining > 0,
      })),
    );
  };

  const deselectAll = () => {
    setLineItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: false,
      })),
    );
  };

  const handleSubmit = async () => {
    setError("");

    // Validate selected items
    const selectedItems = lineItems.filter(
      (item) => item.selected && item.received > 0,
    );

    if (selectedItems.length === 0) {
      setError(
        "Please select at least one item with a received quantity greater than 0.",
      );
      return;
    }

    // Validate category for selected items
    for (const item of selectedItems) {
      if (!item.category) {
        setError(
          `Item "${item.description || "N/A"}" must have a category (PAR/ICS/RIS) selected.`,
        );
        return;
      }
      if (item.category === "inventory custodian slip" && !item.tag) {
        setError(
          `Item "${item.description || "N/A"}" is ICS and must have a tag (Low/High) selected.`,
        );
        return;
      }
    }

    // Build mutation input
    const mutationItems = selectedItems.map((item) => ({
      purchaseOrderItemId: Number(item.purchaseOrderItemId),
      category: item.category,
      tag: item.tag || null,
      received: item.received,
    }));

    try {
      await onGenerate(Number(purchaseOrder.id), mutationItems);
    } catch (err: any) {
      setError(err.message || "Failed to generate IAR");
    }
  };

  const selectedCount = lineItems.filter(
    (i) => i.selected && i.received > 0,
  ).length;
  const totalReceiving = lineItems
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + i.received, 0);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { minHeight: "50vh" } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" component="span">
              Generate IAR
            </Typography>
            {purchaseOrder && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                PO #{purchaseOrder.poNumber} — {purchaseOrder.supplier}
                {purchaseOrder.campus && (
                  <Chip
                    label={purchaseOrder.campus}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            )}
          </Box>
          <Box>
            <Chip
              label={`${selectedCount} item(s) selected`}
              color={selectedCount > 0 ? "success" : "default"}
              size="small"
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          Select items to receive, set the category (PAR/ICS/RIS), tag for ICS
          items, and the quantity to receive. Items with 0 remaining are already
          fully received.
        </Alert>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ fontWeight: "bold" }}>
                  <Checkbox
                    indeterminate={
                      selectedCount > 0 &&
                      selectedCount <
                        lineItems.filter((i) => i.remaining > 0).length
                    }
                    checked={
                      lineItems.filter((i) => i.remaining > 0).length > 0 &&
                      selectedCount ===
                        lineItems.filter((i) => i.remaining > 0).length
                    }
                    onChange={(e) =>
                      e.target.checked ? selectAll() : deselectAll()
                    }
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Specification</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Gen. Desc</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Qty
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Already Received
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Remaining
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tag</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Receive Qty
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lineItems.map((item, index) => {
                const fullyReceived = item.remaining <= 0;
                return (
                  <TableRow
                    key={item.purchaseOrderItemId}
                    sx={{
                      opacity: fullyReceived ? 0.5 : 1,
                      backgroundColor:
                        item.selected && !fullyReceived
                          ? "action.selected"
                          : "inherit",
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={item.selected}
                        onChange={() => toggleSelect(index)}
                        disabled={fullyReceived}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={item.specification || ""}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 180 }}
                        >
                          {item.specification}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                        {item.generalDescription}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="center">
                      {item.actualQuantityReceived}
                      {fullyReceived && (
                        <Tooltip title="Fully received">
                          <CheckCircleIcon
                            color="success"
                            sx={{
                              fontSize: 16,
                              ml: 0.5,
                              verticalAlign: "middle",
                            }}
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="center">{item.remaining}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={item.category}
                        onChange={(e) =>
                          updateLine(index, "category", e.target.value)
                        }
                        disabled={fullyReceived || !item.selected}
                        sx={{ minWidth: 100 }}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          <em>Select</em>
                        </MenuItem>
                        <MenuItem value="property acknowledgement reciept">
                          PAR
                        </MenuItem>
                        <MenuItem value="inventory custodian slip">
                          ICS
                        </MenuItem>
                        <MenuItem value="requisition issue slip">RIS</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={item.tag}
                        onChange={(e) =>
                          updateLine(index, "tag", e.target.value)
                        }
                        disabled={
                          fullyReceived ||
                          !item.selected ||
                          item.category !== "inventory custodian slip"
                        }
                        sx={{ minWidth: 80 }}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          <em>—</em>
                        </MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.received}
                        onChange={(e) =>
                          updateLine(index, "received", Number(e.target.value))
                        }
                        disabled={fullyReceived || !item.selected}
                        inputProps={{
                          min: 0,
                          max: item.remaining,
                          style: { textAlign: "center", width: 60 },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {lineItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2 }}
                    >
                      No items in this purchase order.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedCount > 0 && (
          <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}>
            <Chip
              label={`Total receiving: ${totalReceiving} unit(s)`}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting || selectedCount === 0}
          startIcon={<SaveIcon />}
        >
          {isSubmitting
            ? "Generating..."
            : `Generate IAR (${selectedCount} items)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
