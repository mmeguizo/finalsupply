import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  TextField,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Tabs,
  Tab,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS } from "../graphql/queries/inspectionacceptancereport.query";
import {
  CREATE_MULTI_ITEM_ICS_ASSIGNMENT,
  ADD_ITEM_TO_EXISTING_ICS,
} from "../graphql/mutations/inventoryIAR.mutation";
import { GET_ALL_USERS } from "../graphql/queries/user.query";
import useSignatoryStore from "../stores/signatoryStore";
import { currencyFormat } from "../utils/generalUtils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserOption {
  id: string;
  name: string;
  last_name?: string;
  position?: string;
  role?: string;
  label: string;
}

interface ItemEntry {
  sourceItemId: string;
  description: string;
  unit: string;
  unitCost: number;
  maxAvailable: number;
  quantity: number;
  tag: string;
}

interface MultiIcsAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  availableItems: any[];
  preSelectedItems?: any[];
  poNumber: string;
  supplier: string;
  existingICSItems?: any[];
  onAssignmentComplete: () => void;
}

const emptySignatoryForm = {
  department: "",
  receivedFrom: null as UserOption | null,
  receivedBy: null as UserOption | null,
};

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function MultiIcsAssignmentModal({
  open,
  onClose,
  availableItems,
  preSelectedItems,
  poNumber,
  supplier,
  existingICSItems = [],
  onAssignmentComplete,
}: MultiIcsAssignmentModalProps) {
  /* ---------- GraphQL ---------- */

  const { data: usersData, loading: usersLoading } = useQuery(GET_ALL_USERS);

  const [createMultiICS, { loading: createLoading }] = useMutation(
    CREATE_MULTI_ITEM_ICS_ASSIGNMENT,
    {
      refetchQueries: [{ query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS }],
    },
  );

  const [addToExistingICS, { loading: addLoading }] = useMutation(
    ADD_ITEM_TO_EXISTING_ICS,
    {
      refetchQueries: [{ query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS }],
    },
  );

  /* ---------- Signatories from Zustand store ---------- */

  const allSignatories = useSignatoryStore((s) => s.signatories);
  const fetchSignatories = useSignatoryStore((s) => s.fetchSignatories);

  /* ---------- Local state ---------- */

  const [tabIndex, setTabIndex] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(
    {},
  );
  const [signatoryForm, setSignatoryForm] = useState(emptySignatoryForm);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // For "Add to Existing" tab
  const [selectedExistingIcsId, setSelectedExistingIcsId] =
    useState<string>("");
  const [addToExistingItem, setAddToExistingItem] = useState<string>("");
  const [addToExistingQty, setAddToExistingQty] = useState<number>(1);

  /* ---------- Effects ---------- */

  useEffect(() => {
    if (allSignatories.length === 0) fetchSignatories();
  }, [allSignatories.length, fetchSignatories]);

  useEffect(() => {
    if (open) {
      setError("");
      setSuccessMessage("");
      setSignatoryForm(emptySignatoryForm);
      setSelectedExistingIcsId("");
      setAddToExistingItem("");
      setAddToExistingQty(1);

      if (preSelectedItems && preSelectedItems.length > 0) {
        const ids = new Set(preSelectedItems.map((it: any) => String(it.id)));
        setSelectedItemIds(ids);
        const qtys: Record<string, number> = {};
        preSelectedItems.forEach((it: any) => {
          qtys[String(it.id)] = 1;
        });
        setItemQuantities(qtys);
        setTabIndex(0);
      } else {
        setSelectedItemIds(new Set());
        setItemQuantities({});
      }
    }
    if (!open) {
      setSelectedItemIds(new Set());
      setItemQuantities({});
      setError("");
      setSuccessMessage("");
    }
  }, [open, preSelectedItems]);

  /* ---------- Options ---------- */

  const userOptions: UserOption[] = useMemo(() => {
    const users = usersData?.users?.filter((u: any) => u.is_active) || [];
    return users.map((u: any) => ({
      id: u.id,
      name: `${u.name} ${u.last_name || ""}`.trim(),
      position: u.position || "",
      label:
        `${u.name} ${u.last_name || ""} ${u.position ? `(${u.position})` : ""}`.trim(),
    }));
  }, [usersData]);

  const signatoryOptions: UserOption[] = useMemo(() => {
    return (allSignatories || []).map((sig: any) => ({
      id: sig.id,
      name: sig.name,
      role: sig.role,
      position: sig.role,
      label: `${sig.name} (${sig.role})`,
    }));
  }, [allSignatories]);

  // Unique existing ICS IDs with their end user info
  const existingICSGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        icsId: string;
        receivedBy: string;
        department: string;
        tag: string;
        items: any[];
      }
    > = {};
    existingICSItems.forEach((item: any) => {
      if (item.icsId) {
        if (!groups[item.icsId]) {
          groups[item.icsId] = {
            icsId: item.icsId,
            receivedBy: item.icsReceivedBy || "",
            department: item.icsDepartment || "",
            tag: item.tag || "",
            items: [],
          };
        }
        groups[item.icsId].items.push(item);
      }
    });
    return Object.values(groups);
  }, [existingICSItems]);

  /* ---------- Handlers for "New ICS" tab ---------- */

  const toggleItem = (itemId: string) => {
    const next = new Set(selectedItemIds);
    if (next.has(itemId)) {
      next.delete(itemId);
      const qtys = { ...itemQuantities };
      delete qtys[itemId];
      setItemQuantities(qtys);
    } else {
      next.add(itemId);
      setItemQuantities((prev) => ({ ...prev, [itemId]: 1 }));
    }
    setSelectedItemIds(next);
  };

  const updateItemQty = (itemId: string, qty: number) => {
    setItemQuantities((prev) => ({ ...prev, [itemId]: qty }));
  };

  const selectedEntries: ItemEntry[] = useMemo(() => {
    return availableItems
      .filter((it: any) => selectedItemIds.has(String(it.id)))
      .map((it: any) => ({
        sourceItemId: String(it.id),
        description: it.description || it.itemName || "",
        unit: it.unit || "",
        unitCost: parseFloat(it.unitCost) || 0,
        maxAvailable: it.actualQuantityReceived || 0,
        quantity: itemQuantities[String(it.id)] || 1,
        tag: it.tag || "",
      }));
  }, [availableItems, selectedItemIds, itemQuantities]);

  const totalAmount = selectedEntries.reduce(
    (sum, e) => sum + e.quantity * e.unitCost,
    0,
  );

  /* ---------- Submit: New ICS ---------- */

  const handleCreateNewICS = async () => {
    setError("");
    setSuccessMessage("");

    if (selectedEntries.length === 0) {
      setError("Please select at least one item.");
      return;
    }

    for (const entry of selectedEntries) {
      if (entry.quantity <= 0) {
        setError(`Quantity for "${entry.description}" must be greater than 0.`);
        return;
      }
      if (entry.quantity > entry.maxAvailable) {
        setError(
          `Quantity (${entry.quantity}) exceeds available (${entry.maxAvailable}) for "${entry.description}".`,
        );
        return;
      }
    }

    if (!signatoryForm.department.trim()) {
      setError("Please enter a department.");
      return;
    }
    if (!signatoryForm.receivedFrom) {
      setError('Please select "Received From".');
      return;
    }
    if (!signatoryForm.receivedBy) {
      setError('Please select "Received By".');
      return;
    }

    try {
      const result = await createMultiICS({
        variables: {
          input: {
            items: selectedEntries.map((e) => ({
              sourceItemId: parseInt(e.sourceItemId, 10),
              quantity: e.quantity,
            })),
            department: signatoryForm.department.trim(),
            receivedFrom: signatoryForm.receivedFrom.name,
            receivedFromPosition:
              signatoryForm.receivedFrom.position ||
              signatoryForm.receivedFrom.role ||
              "",
            receivedBy: signatoryForm.receivedBy.name,
            receivedByPosition: signatoryForm.receivedBy.position || "",
          },
        },
      });

      const { generatedIcsId } = result.data.createMultiItemICSAssignment;
      setSuccessMessage(
        `ICS ID ${generatedIcsId} created with ${selectedEntries.length} item(s)!`,
      );
      setSelectedItemIds(new Set());
      setItemQuantities({});
      setSignatoryForm(emptySignatoryForm);
      onAssignmentComplete();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: any) {
      console.error("createMultiICS error:", err);
      setError(err.message || "Failed to create ICS. Please try again.");
    }
  };

  /* ---------- Submit: Add to Existing ICS ---------- */

  const handleAddToExisting = async () => {
    setError("");
    setSuccessMessage("");

    if (!selectedExistingIcsId) {
      setError("Please select an existing ICS ID.");
      return;
    }
    if (!addToExistingItem) {
      setError("Please select an item to add.");
      return;
    }
    if (addToExistingQty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    const sourceItem = availableItems.find(
      (it: any) => String(it.id) === addToExistingItem,
    );
    if (
      sourceItem &&
      addToExistingQty > (sourceItem.actualQuantityReceived || 0)
    ) {
      setError(
        `Quantity (${addToExistingQty}) exceeds available (${sourceItem.actualQuantityReceived}).`,
      );
      return;
    }

    try {
      const result = await addToExistingICS({
        variables: {
          input: {
            sourceItemId: parseInt(addToExistingItem, 10),
            quantity: addToExistingQty,
            existingIcsId: selectedExistingIcsId,
          },
        },
      });

      const { icsId } = result.data.addItemToExistingICS;
      setSuccessMessage(`Item added to existing ICS ID ${icsId}!`);
      setAddToExistingItem("");
      setAddToExistingQty(1);
      onAssignmentComplete();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: any) {
      console.error("addToExistingICS error:", err);
      setError(err.message || "Failed to add item to existing ICS.");
    }
  };

  /* ---------- Render ---------- */

  const isLoading = usersLoading || createLoading || addLoading;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6">Multi-Item ICS Assignment</Typography>
            <Typography variant="body2" color="text.secondary">
              PO: {poNumber} &nbsp;|&nbsp; Supplier: {supplier}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Tabs
          value={tabIndex}
          onChange={(_, v) => {
            setTabIndex(v);
            setError("");
          }}
          sx={{ mb: 2 }}
        >
          <Tab
            label="Create New ICS"
            icon={<AddCircleOutlineIcon />}
            iconPosition="start"
          />
          <Tab
            label={`Add to Existing ICS (${existingICSGroups.length})`}
            icon={<LinkIcon />}
            iconPosition="start"
            disabled={existingICSGroups.length === 0}
          />
        </Tabs>

        {/* ========== TAB 0: Create New ICS ========== */}
        {tabIndex === 0 && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Select items and quantities for this end user:
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>Description</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Tag</TableCell>
                    <TableCell align="right">Available</TableCell>
                    <TableCell align="right" sx={{ width: 130 }}>
                      Assign Qty
                    </TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableItems
                    .filter(
                      (it: any) =>
                        !it.icsId && (it.actualQuantityReceived ?? 0) > 0,
                    )
                    .map((item: any) => {
                      const id = String(item.id);
                      const isSelected = selectedItemIds.has(id);
                      const qty = itemQuantities[id] || 1;
                      const cost = parseFloat(item.unitCost) || 0;

                      return (
                        <TableRow
                          key={id}
                          hover
                          selected={isSelected}
                          sx={{ cursor: "pointer" }}
                          onClick={() => toggleItem(id)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected} />
                          </TableCell>
                          <TableCell>
                            {item.description || item.itemName}
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            {item.tag
                              ?.split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ") || "N/A"}
                          </TableCell>
                          <TableCell align="right">
                            {item.actualQuantityReceived}
                          </TableCell>
                          <TableCell align="right">
                            {isSelected ? (
                              <TextField
                                type="number"
                                size="small"
                                value={qty}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const v = Math.max(
                                    0,
                                    Math.min(
                                      parseInt(e.target.value, 10) || 0,
                                      item.actualQuantityReceived,
                                    ),
                                  );
                                  updateItemQty(id, v);
                                }}
                                inputProps={{
                                  min: 1,
                                  max: item.actualQuantityReceived,
                                }}
                                sx={{ width: 90 }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {currencyFormat(cost)}
                          </TableCell>
                          <TableCell align="right">
                            {isSelected ? currencyFormat(qty * cost) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {availableItems.filter(
                    (it: any) =>
                      !it.icsId && (it.actualQuantityReceived ?? 0) > 0,
                  ).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ py: 2 }}
                        >
                          No unassigned items available in this PO.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedEntries.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">
                    <strong>{selectedEntries.length}</strong> item(s) selected
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total: {currencyFormat(totalAmount)}
                  </Typography>
                </Box>
              </Paper>
            )}

            {selectedEntries.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    End User / Signatory Information
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: "block" }}
                  >
                    All selected items will share the same ICS ID and signatory
                    info.
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField
                      label="Department / Office"
                      size="small"
                      value={signatoryForm.department}
                      onChange={(e) =>
                        setSignatoryForm((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      sx={{ flexGrow: 1 }}
                      required
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Autocomplete
                      size="small"
                      options={signatoryOptions}
                      value={signatoryForm.receivedFrom}
                      onChange={(_, v) =>
                        setSignatoryForm((prev) => ({
                          ...prev,
                          receivedFrom: v,
                        }))
                      }
                      getOptionLabel={(o) => o.label}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Received From (Supply Officer)"
                          required
                        />
                      )}
                      sx={{ flex: 1 }}
                    />
                    <Autocomplete
                      size="small"
                      options={userOptions}
                      value={signatoryForm.receivedBy}
                      onChange={(_, v) =>
                        setSignatoryForm((prev) => ({
                          ...prev,
                          receivedBy: v,
                        }))
                      }
                      getOptionLabel={(o) => o.label}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Received By (End User)"
                          required
                        />
                      )}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {selectedEntries.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={
                    createLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <VpnKeyIcon />
                    )
                  }
                  onClick={handleCreateNewICS}
                  disabled={createLoading}
                >
                  Generate ICS ID & Save ({selectedEntries.length} item
                  {selectedEntries.length > 1 ? "s" : ""})
                </Button>
              </Box>
            )}
          </Stack>
        )}

        {/* ========== TAB 1: Add to Existing ICS ========== */}
        {tabIndex === 1 && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Select an existing ICS ID to add items to:
            </Typography>

            <Stack spacing={1}>
              {existingICSGroups.map((group) => (
                <Card
                  key={group.icsId}
                  variant="outlined"
                  sx={{
                    borderColor:
                      selectedExistingIcsId === group.icsId
                        ? "primary.main"
                        : "divider",
                    borderWidth: selectedExistingIcsId === group.icsId ? 2 : 1,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => setSelectedExistingIcsId(group.icsId)}
                >
                  <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={group.icsId}
                        color={
                          selectedExistingIcsId === group.icsId
                            ? "primary"
                            : "success"
                        }
                        size="medium"
                        sx={{ fontWeight: "bold" }}
                      />
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="body2">
                        <strong>End User:</strong> {group.receivedBy}
                      </Typography>
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="body2">
                        <strong>Dept:</strong> {group.department}
                      </Typography>
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="body2">
                        <strong>Tag:</strong> {group.tag || "N/A"}
                      </Typography>
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="body2" color="text.secondary">
                        {group.items.length} item(s):{" "}
                        {group.items
                          .map((it: any) => it.description)
                          .join(", ")}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            {selectedExistingIcsId && (
              <Card variant="outlined" sx={{ borderColor: "primary.main" }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Add item to ICS {selectedExistingIcsId}
                  </Typography>

                  <Box
                    sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                  >
                    <Autocomplete
                      size="small"
                      options={availableItems.filter(
                        (it: any) =>
                          !it.icsId && (it.actualQuantityReceived ?? 0) > 0,
                      )}
                      value={
                        availableItems.find(
                          (it: any) => String(it.id) === addToExistingItem,
                        ) || null
                      }
                      onChange={(_, v) => {
                        setAddToExistingItem(v ? String(v.id) : "");
                        setAddToExistingQty(1);
                      }}
                      getOptionLabel={(o: any) =>
                        `${o.description || o.itemName} (${o.actualQuantityReceived} avail.) [${o.tag || "N/A"}]`
                      }
                      isOptionEqualToValue={(o: any, v: any) => o.id === v.id}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Item" />
                      )}
                      sx={{ flex: 2 }}
                    />
                    <TextField
                      label="Quantity"
                      type="number"
                      size="small"
                      value={addToExistingQty}
                      onChange={(e) =>
                        setAddToExistingQty(
                          Math.max(0, parseInt(e.target.value, 10) || 0),
                        )
                      }
                      inputProps={{ min: 1 }}
                      sx={{ width: 120 }}
                    />
                    <Button
                      variant="contained"
                      startIcon={
                        addLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <LinkIcon />
                        )
                      }
                      onClick={handleAddToExisting}
                      disabled={addLoading || !addToExistingItem}
                    >
                      Add
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {existingICSGroups.length === 0 && (
              <Alert severity="info">
                No existing ICS assignments found for this PO. Use the "Create
                New ICS" tab to create the first assignment.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
