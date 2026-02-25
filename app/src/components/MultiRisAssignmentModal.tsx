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
import { GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY } from "../graphql/queries/requisitionIssueslip";
import {
  CREATE_MULTI_ITEM_RIS_ASSIGNMENT,
  ADD_ITEM_TO_EXISTING_RIS,
  SPLIT_AND_ASSIGN_RIS,
} from "../graphql/mutations/requisitionIS.mutation";
import { GET_ALL_USERS } from "../graphql/queries/user.query";
import useSignatoryStore from "../stores/signatoryStore";
import { currencyFormat } from "../utils/generalUtils";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import DeleteIcon from "@mui/icons-material/Delete";

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
}

interface MultiRisAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  availableItems: any[];
  preSelectedItems?: any[];
  poNumber: string;
  supplier: string;
  existingRISItems?: any[];
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

export default function MultiRisAssignmentModal({
  open,
  onClose,
  availableItems,
  preSelectedItems,
  poNumber,
  supplier,
  existingRISItems = [],
  onAssignmentComplete,
}: MultiRisAssignmentModalProps) {
  /* ---------- GraphQL ---------- */

  const { data: usersData, loading: usersLoading } = useQuery(GET_ALL_USERS);

  const [createMultiRIS, { loading: createLoading }] = useMutation(
    CREATE_MULTI_ITEM_RIS_ASSIGNMENT,
    {
      refetchQueries: [{ query: GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY }],
    },
  );

  const [addToExistingRIS, { loading: addLoading }] = useMutation(
    ADD_ITEM_TO_EXISTING_RIS,
    {
      refetchQueries: [{ query: GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY }],
    },
  );

  const [splitAndAssignRIS, { loading: splitLoading }] = useMutation(
    SPLIT_AND_ASSIGN_RIS,
    {
      refetchQueries: [{ query: GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY }],
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
  const [selectedExistingRisId, setSelectedExistingRisId] =
    useState<string>("");
  const [addToExistingItem, setAddToExistingItem] = useState<string>("");
  const [addToExistingQty, setAddToExistingQty] = useState<number>(1);

  // For "Split & Assign" tab
  const [splitSourceItemId, setSplitSourceItemId] = useState<string>("");
  const [splitRows, setSplitRows] = useState<
    Array<{
      quantity: number;
      department: string;
      receivedFrom: UserOption | null;
      receivedBy: UserOption | null;
    }>
  >([]);

  /* ---------- Effects ---------- */

  useEffect(() => {
    if (allSignatories.length === 0) fetchSignatories();
  }, [allSignatories.length, fetchSignatories]);

  useEffect(() => {
    if (open) {
      setError("");
      setSuccessMessage("");
      setSignatoryForm(emptySignatoryForm);
      setSelectedExistingRisId("");
      setAddToExistingItem("");
      setAddToExistingQty(1);
      setSplitSourceItemId("");
      setSplitRows([]);

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
      setSplitSourceItemId("");
      setSplitRows([]);
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

  // Unique existing RIS IDs with their end user info
  const existingRISGroups = useMemo(() => {
    const groups: Record<
      string,
      { risId: string; receivedBy: string; department: string; items: any[] }
    > = {};
    existingRISItems.forEach((item: any) => {
      if (item.risId) {
        if (!groups[item.risId]) {
          groups[item.risId] = {
            risId: item.risId,
            receivedBy: item.risReceivedBy || "",
            department: item.risDepartment || "",
            items: [],
          };
        }
        groups[item.risId].items.push(item);
      }
    });
    return Object.values(groups);
  }, [existingRISItems]);

  /* ---------- Handlers for "New RIS" tab ---------- */

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
      }));
  }, [availableItems, selectedItemIds, itemQuantities]);

  const totalAmount = selectedEntries.reduce(
    (sum, e) => sum + e.quantity * e.unitCost,
    0,
  );

  /* ---------- Submit: New RIS ---------- */

  const handleCreateNewRIS = async () => {
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
      const result = await createMultiRIS({
        variables: {
          input: {
            items: selectedEntries.map((e) => ({
              sourceItemId: e.sourceItemId,
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

      const { generatedRisId } = result.data.createMultiItemRISAssignment;
      setSuccessMessage(
        `RIS ID ${generatedRisId} created with ${selectedEntries.length} item(s)!`,
      );
      setSelectedItemIds(new Set());
      setItemQuantities({});
      setSignatoryForm(emptySignatoryForm);
      onAssignmentComplete();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: any) {
      console.error("createMultiRIS error:", err);
      setError(err.message || "Failed to create RIS. Please try again.");
    }
  };

  /* ---------- Submit: Add to Existing RIS ---------- */

  const handleAddToExisting = async () => {
    setError("");
    setSuccessMessage("");

    if (!selectedExistingRisId) {
      setError("Please select an existing RIS ID.");
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
      const result = await addToExistingRIS({
        variables: {
          input: {
            sourceItemId: addToExistingItem,
            quantity: addToExistingQty,
            existingRisId: selectedExistingRisId,
          },
        },
      });

      const { risId } = result.data.addItemToExistingRIS;
      setSuccessMessage(`Item added to existing RIS ID ${risId}!`);
      setAddToExistingItem("");
      setAddToExistingQty(1);
      onAssignmentComplete();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: any) {
      console.error("addToExistingRIS error:", err);
      setError(err.message || "Failed to add item to existing RIS.");
    }
  };

  /* ---------- Split & Assign helpers ---------- */

  const splitSourceItem = useMemo(() => {
    if (!splitSourceItemId) return null;
    return availableItems.find(
      (it: any) => String(it.id) === splitSourceItemId,
    );
  }, [availableItems, splitSourceItemId]);

  const splitTotalQty = splitRows.reduce((sum, r) => sum + r.quantity, 0);
  const splitOriginalQty = splitSourceItem?.actualQuantityReceived || 0;

  const addSplitRow = () => {
    setSplitRows((prev) => [
      ...prev,
      { quantity: 1, department: "", receivedFrom: null, receivedBy: null },
    ]);
  };

  const removeSplitRow = (index: number) => {
    setSplitRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSplitRow = (index: number, field: string, value: any) => {
    setSplitRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  /* ---------- Submit: Split & Assign ---------- */

  const handleSplitAndAssign = async () => {
    setError("");
    setSuccessMessage("");

    if (!splitSourceItemId) {
      setError("Please select a source item to split.");
      return;
    }
    if (splitRows.length === 0) {
      setError("Please add at least one split row.");
      return;
    }
    if (splitTotalQty === 0) {
      setError("Total split quantity must be greater than 0.");
      return;
    }

    for (let i = 0; i < splitRows.length; i++) {
      const row = splitRows[i];
      if (row.quantity <= 0) {
        setError(`Split row ${i + 1}: Quantity must be greater than 0.`);
        return;
      }
      if (!row.receivedFrom) {
        setError(`Split row ${i + 1}: Please select "Received From".`);
        return;
      }
      if (!row.receivedBy) {
        setError(`Split row ${i + 1}: Please select "Received By".`);
        return;
      }
    }

    try {
      await splitAndAssignRIS({
        variables: {
          input: {
            itemSplits: [
              {
                itemId: splitSourceItemId,
                splits: splitRows.map((row) => ({
                  quantity: row.quantity,
                  department: row.department.trim(),
                  receivedFrom: row.receivedFrom!.name,
                  receivedFromPosition:
                    row.receivedFrom!.position || row.receivedFrom!.role || "",
                  receivedBy: row.receivedBy!.name,
                  receivedByPosition: row.receivedBy!.position || "",
                })),
              },
            ],
          },
        },
      });

      setSuccessMessage(
        `Successfully split "${splitSourceItem?.description || "item"}" into ${splitRows.length} RIS assignment(s)!`,
      );
      setSplitSourceItemId("");
      setSplitRows([]);
      onAssignmentComplete();

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err: any) {
      console.error("splitAndAssignRIS error:", err);
      setError(err.message || "Failed to split and assign RIS.");
    }
  };

  /* ---------- Render ---------- */

  const isLoading = usersLoading || createLoading || addLoading || splitLoading;

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
            <Typography variant="h6">Multi-Item RIS Assignment</Typography>
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
            label="Create New RIS"
            icon={<AddCircleOutlineIcon />}
            iconPosition="start"
          />
          <Tab
            label={`Add to Existing RIS (${existingRISGroups.length})`}
            icon={<LinkIcon />}
            iconPosition="start"
            disabled={existingRISGroups.length === 0}
          />
          <Tab
            label="Split & Assign"
            icon={<CallSplitIcon />}
            iconPosition="start"
          />
        </Tabs>

        {/* ========== TAB 0: Create New RIS ========== */}
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
                        !it.risId && (it.actualQuantityReceived ?? 0) > 0,
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
                      !it.risId && (it.actualQuantityReceived ?? 0) > 0,
                  ).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
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
                    All selected items will share the same RIS ID and signatory
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
                  onClick={handleCreateNewRIS}
                  disabled={createLoading}
                >
                  Generate RIS ID & Save ({selectedEntries.length} item
                  {selectedEntries.length > 1 ? "s" : ""})
                </Button>
              </Box>
            )}
          </Stack>
        )}

        {/* ========== TAB 1: Add to Existing RIS ========== */}
        {tabIndex === 1 && (
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Select an existing RIS ID to add items to:
            </Typography>

            <Stack spacing={1}>
              {existingRISGroups.map((group) => (
                <Card
                  key={group.risId}
                  variant="outlined"
                  sx={{
                    borderColor:
                      selectedExistingRisId === group.risId
                        ? "primary.main"
                        : "divider",
                    borderWidth: selectedExistingRisId === group.risId ? 2 : 1,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => setSelectedExistingRisId(group.risId)}
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
                        label={group.risId}
                        color={
                          selectedExistingRisId === group.risId
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

            {selectedExistingRisId && (
              <Card variant="outlined" sx={{ borderColor: "primary.main" }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Add item to RIS {selectedExistingRisId}
                  </Typography>

                  <Box
                    sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                  >
                    <Autocomplete
                      size="small"
                      options={availableItems.filter(
                        (it: any) =>
                          !it.risId && (it.actualQuantityReceived ?? 0) > 0,
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
                        `${o.description || o.itemName} (${o.actualQuantityReceived} avail.)`
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

            {existingRISGroups.length === 0 && (
              <Alert severity="info">
                No existing RIS assignments found for this PO. Use the "Create
                New RIS" tab to create the first assignment.
              </Alert>
            )}
          </Stack>
        )}

        {/* ========== TAB 2: Split & Assign ========== */}
        {tabIndex === 2 && (
          <Stack spacing={2}>
            <Alert severity="info" sx={{ mb: 1 }}>
              Split one item into <strong>multiple end users</strong>. Each
              split gets its own RIS ID. You can split into any number of pieces
              (e.g. 1 lot → 6 RIS assignments). All splits are tracked back to
              the original source item.
            </Alert>

            {/* Source item selection */}
            <Typography variant="subtitle2" fontWeight="bold">
              1. Select the source item to split:
            </Typography>
            <Autocomplete
              size="small"
              options={availableItems.filter(
                (it: any) => !it.risId && (it.actualQuantityReceived ?? 0) > 0,
              )}
              value={
                availableItems.find(
                  (it: any) => String(it.id) === splitSourceItemId,
                ) || null
              }
              onChange={(_, v) => {
                setSplitSourceItemId(v ? String(v.id) : "");
                setSplitRows([]);
              }}
              getOptionLabel={(o: any) =>
                `${o.description || o.itemName} — ${o.actualQuantityReceived} ${o.unit || "unit(s)"} available (${currencyFormat(o.unitCost)})`
              }
              isOptionEqualToValue={(o: any, v: any) => o.id === v.id}
              renderInput={(params) => (
                <TextField {...params} label="Select Source Item" />
              )}
            />

            {/* Split rows */}
            {splitSourceItem && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    2. Define splits (Original Qty: {splitOriginalQty},
                    Splitting into: {splitTotalQty}):
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={addSplitRow}
                  >
                    Add Split
                  </Button>
                </Box>

                {splitRows.map((row, index) => (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{ borderColor: "primary.light" }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2" color="primary">
                          Split #{index + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeSplitRow(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                        <TextField
                          label="Quantity"
                          type="number"
                          size="small"
                          value={row.quantity}
                          onChange={(e) =>
                            updateSplitRow(
                              index,
                              "quantity",
                              Math.max(0, parseInt(e.target.value, 10) || 0),
                            )
                          }
                          inputProps={{ min: 1 }}
                          sx={{ width: 120 }}
                        />
                        <TextField
                          label="Department / Office"
                          size="small"
                          value={row.department}
                          onChange={(e) =>
                            updateSplitRow(index, "department", e.target.value)
                          }
                          sx={{ flexGrow: 1 }}
                        />
                      </Box>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Autocomplete
                          size="small"
                          options={signatoryOptions}
                          value={row.receivedFrom}
                          onChange={(_, v) =>
                            updateSplitRow(index, "receivedFrom", v)
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
                          value={row.receivedBy}
                          onChange={(_, v) =>
                            updateSplitRow(index, "receivedBy", v)
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
                ))}

                {splitRows.length === 0 && (
                  <Alert severity="info">
                    Click &quot;Add Split&quot; to define how to divide this
                    item across end users.
                  </Alert>
                )}

                {/* Summary and submit */}
                {splitRows.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="body2">
                          <strong>{splitRows.length}</strong> split(s) totaling{" "}
                          <strong>{splitTotalQty}</strong> unit(s) from original
                          qty of {splitOriginalQty}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Each split gets its own RIS ID. All splits are tracked
                          back to the source item.
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={
                          splitLoading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <CallSplitIcon />
                          )
                        }
                        onClick={handleSplitAndAssign}
                        disabled={splitLoading || splitTotalQty === 0}
                      >
                        Split & Assign ({splitRows.length})
                      </Button>
                    </Box>
                  </Paper>
                )}
              </>
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
