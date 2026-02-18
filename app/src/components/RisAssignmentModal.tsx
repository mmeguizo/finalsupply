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
  LinearProgress,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY } from "../graphql/queries/requisitionIssueslip";
import { CREATE_SINGLE_RIS_ASSIGNMENT, UPDATE_RIS_ASSIGNMENT } from "../graphql/mutations/requisitionIS.mutation";
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

interface AssignmentForm {
  quantity: number | "";
  department: string;
  receivedFrom: UserOption | null;
  receivedBy: UserOption | null;
}

interface SavedAssignment {
  id: string;
  risId: string;
  quantity: number;
  department: string;
  receivedFrom: string;
  receivedFromPosition: string;
  receivedBy: string;
  receivedByPosition: string;
}

interface RisAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  item: any | null;
  onAssignmentComplete: () => void;
}

const emptyForm: AssignmentForm = {
  quantity: "",
  department: "",
  receivedFrom: null,
  receivedBy: null,
};

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function RisAssignmentModal({
  open,
  onClose,
  item,
  onAssignmentComplete,
}: RisAssignmentModalProps) {
  /* ---------- GraphQL ---------- */

  const { data: usersData, loading: usersLoading } = useQuery(GET_ALL_USERS);

  const [createRISAssignment, { loading: createLoading }] = useMutation(
    CREATE_SINGLE_RIS_ASSIGNMENT,
    {
      refetchQueries: [
        { query: GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY },
      ],
    }
  );

  const [updateRISAssignment, { loading: updateLoading }] = useMutation(
    UPDATE_RIS_ASSIGNMENT,
    {
      refetchQueries: [
        { query: GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY },
      ],
    }
  );

  /* ---------- Signatories from Zustand store ---------- */

  const allSignatories = useSignatoryStore((s) => s.signatories);
  const fetchSignatories = useSignatoryStore((s) => s.fetchSignatories);

  /* ---------- Local state ---------- */

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AssignmentForm>(emptyForm);
  const [savedAssignments, setSavedAssignments] = useState<SavedAssignment[]>([]);
  const [remainingQty, setRemainingQty] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AssignmentForm>(emptyForm);

  /* ---------- Derived item info ---------- */

  const description = item?.description || item?.itemName || "";
  const unit = item?.unit || "";
  const unitCost = parseFloat(item?.unitCost) || 0;
  const poNumber = item?.PurchaseOrder?.poNumber || "-";
  const originalQty = item?.actualQuantityReceived || 0;
  const existingRisId = item?.risId || null;

  /* ---------- Effects ---------- */

  useEffect(() => {
    if (allSignatories.length === 0) fetchSignatories();
  }, [allSignatories.length, fetchSignatories]);

  useEffect(() => {
    if (open && item) {
      setShowForm(false);
      setForm(emptyForm);
      setSavedAssignments([]);
      setRemainingQty(item.actualQuantityReceived || 0);
      setError("");
      setSuccessMessage("");
      setEditingId(null);
      setEditForm(emptyForm);

      if (item.risId) {
        setSavedAssignments([{
          id: item.id,
          risId: item.risId,
          quantity: item.actualQuantityReceived || 0,
          department: item.risDepartment || "",
          receivedFrom: item.risReceivedFrom || "",
          receivedFromPosition: item.risReceivedFromPosition || "",
          receivedBy: item.risReceivedBy || "",
          receivedByPosition: item.risReceivedByPosition || "",
        }]);
        setRemainingQty(0);
      }
    }
    if (!open) {
      setShowForm(false);
      setForm(emptyForm);
      setSavedAssignments([]);
      setError("");
      setSuccessMessage("");
      setEditingId(null);
    }
  }, [open, item]);

  /* ---------- Options ---------- */

  const userOptions: UserOption[] = useMemo(() => {
    const users = usersData?.users?.filter((u: any) => u.is_active) || [];
    return users.map((u: any) => ({
      id: u.id,
      name: `${u.name} ${u.last_name || ""}`.trim(),
      position: u.position || "",
      label: `${u.name} ${u.last_name || ""} ${u.position ? `(${u.position})` : ""}`.trim(),
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

  /* ---------- Form helpers ---------- */

  const updateForm = (field: keyof AssignmentForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditForm = (field: keyof AssignmentForm, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  /* ---------- Generate & Save ---------- */

  const handleGenerateAndSave = async () => {
    setError("");
    setSuccessMessage("");

    const qty = typeof form.quantity === "number" ? form.quantity : 0;

    if (qty <= 0) {
      setError("Please enter a quantity greater than 0.");
      return;
    }
    if (qty > remainingQty) {
      setError(`Quantity (${qty}) exceeds remaining (${remainingQty}).`);
      return;
    }
    if (!form.department.trim()) {
      setError("Please enter a department.");
      return;
    }
    if (!form.receivedFrom) {
      setError('Please select "Received From".');
      return;
    }
    if (!form.receivedBy) {
      setError('Please select "Received By".');
      return;
    }

    try {
      const result = await createRISAssignment({
        variables: {
          input: {
            sourceItemId: String(item.id),
            quantity: qty,
            department: form.department.trim(),
            receivedFrom: form.receivedFrom.name,
            receivedFromPosition: form.receivedFrom.position || form.receivedFrom.role || "",
            receivedBy: form.receivedBy.name,
            receivedByPosition: form.receivedBy.position || "",
          },
        },
      });

      const { newItem, sourceItem, generatedRisId } = result.data.createSingleRISAssignment;

      setSavedAssignments((prev) => [
        ...prev,
        {
          id: newItem.id,
          risId: generatedRisId,
          quantity: qty,
          department: form.department.trim(),
          receivedFrom: form.receivedFrom.name,
          receivedFromPosition: form.receivedFrom.position || form.receivedFrom.role || "",
          receivedBy: form.receivedBy.name,
          receivedByPosition: form.receivedBy.position || "",
        },
      ]);

      setRemainingQty(sourceItem.actualQuantityReceived);

      setSuccessMessage(`RIS ID ${generatedRisId} created and saved!`);
      resetForm();
      onAssignmentComplete();

      if (sourceItem.actualQuantityReceived === 0) {
        setTimeout(() => onClose(), 800);
      } else {
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err: any) {
      console.error("createRISAssignment error:", err);
      setError(err.message || "Failed to create RIS. Please try again.");
    }
  };

  /* ---------- Edit handlers ---------- */

  const startEditing = (assignment: SavedAssignment) => {
    setEditingId(assignment.id);
    const fromOption = signatoryOptions.find((o) => o.name === assignment.receivedFrom) || null;
    const byOption = userOptions.find((o) => o.name === assignment.receivedBy) || null;
    setEditForm({
      quantity: assignment.quantity,
      department: assignment.department,
      receivedFrom: fromOption,
      receivedBy: byOption,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError("");

    const qty = typeof editForm.quantity === "number" ? editForm.quantity : 0;
    if (qty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    try {
      await updateRISAssignment({
        variables: {
          input: {
            itemId: editingId,
            quantity: qty,
            department: editForm.department,
            receivedFrom: editForm.receivedFrom?.name,
            receivedFromPosition: editForm.receivedFrom?.position || editForm.receivedFrom?.role || "",
            receivedBy: editForm.receivedBy?.name,
            receivedByPosition: editForm.receivedBy?.position || "",
          },
        },
      });

      setSavedAssignments((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                quantity: qty,
                department: editForm.department,
                receivedFrom: editForm.receivedFrom?.name || a.receivedFrom,
                receivedFromPosition: editForm.receivedFrom?.position || editForm.receivedFrom?.role || "",
                receivedBy: editForm.receivedBy?.name || a.receivedBy,
                receivedByPosition: editForm.receivedBy?.position || "",
              }
            : a
        )
      );

      setSuccessMessage("Assignment updated!");
      cancelEditing();
      onAssignmentComplete();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("updateRISAssignment error:", err);
      setError(err.message || "Failed to update. Please try again.");
    }
  };

  /* ---------- Computed values ---------- */

  const totalAssigned = savedAssignments.reduce((sum, a) => sum + a.quantity, 0);
  const totalOriginal = existingRisId ? savedAssignments[0]?.quantity || originalQty : originalQty;
  const progress = totalOriginal > 0 ? (totalAssigned / totalOriginal) * 100 : 0;
  const isLoading = usersLoading || createLoading || updateLoading;

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">RIS Assignment</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">{description}</Typography>
              <Typography variant="body2" color="text.secondary">
                PO: {poNumber} &nbsp;|&nbsp; Unit: {unit} &nbsp;|&nbsp; Unit Cost: {currencyFormat(unitCost)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {totalAssigned} / {totalOriginal}
              </Typography>
              <Typography variant="caption" color="text.secondary">assigned</Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
            color={remainingQty === 0 ? "success" : "primary"}
          />
          {remainingQty > 0 && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
              {remainingQty} remaining to assign
            </Typography>
          )}
          {remainingQty === 0 && savedAssignments.length > 0 && (
            <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mt: 0.5 }}>
              All quantities assigned!
            </Typography>
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
        )}

        {isLoading && !showForm ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={2}>
            {savedAssignments.map((assignment) => (
              <Card
                key={assignment.id}
                variant="outlined"
                sx={{
                  borderColor: editingId === assignment.id ? "primary.main" : "success.main",
                  borderWidth: 2,
                  bgcolor: editingId === assignment.id ? "transparent" : "action.hover",
                }}
              >
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  {editingId === assignment.id ? (
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Quantity" type="number" size="small" value={editForm.quantity}
                          onChange={(e) => { const v = e.target.value; updateEditForm("quantity", v === "" ? "" : Math.max(0, parseInt(v, 10) || 0)); }}
                          sx={{ width: 120 }} />
                        <TextField label="Department" size="small" value={editForm.department}
                          onChange={(e) => updateEditForm("department", e.target.value)} sx={{ flexGrow: 1 }} />
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Autocomplete size="small" options={signatoryOptions} value={editForm.receivedFrom}
                          onChange={(_, v) => updateEditForm("receivedFrom", v)} getOptionLabel={(o) => o.label}
                          isOptionEqualToValue={(o, v) => o.id === v.id}
                          renderInput={(params) => <TextField {...params} label="Received From" />} sx={{ flex: 1 }} />
                        <Autocomplete size="small" options={userOptions} value={editForm.receivedBy}
                          onChange={(_, v) => updateEditForm("receivedBy", v)} getOptionLabel={(o) => o.label}
                          isOptionEqualToValue={(o, v) => o.id === v.id}
                          renderInput={(params) => <TextField {...params} label="Received By" />} sx={{ flex: 1 }} />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button size="small" onClick={cancelEditing}>Cancel</Button>
                        <Button size="small" variant="contained" onClick={saveEdit} disabled={updateLoading}
                          startIcon={updateLoading ? <CircularProgress size={16} /> : <SaveIcon />}>Save</Button>
                      </Box>
                    </Stack>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                      <CheckCircleIcon color="success" />
                      <Chip label={assignment.risId} color="success" size="medium" sx={{ fontWeight: "bold", fontSize: "0.95rem" }} />
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="body2"><strong>Qty:</strong> {assignment.quantity}</Typography>
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="body2">{assignment.department || "-"}</Typography>
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="body2" color="text.secondary">
                        {assignment.receivedFrom} → {assignment.receivedBy}
                      </Typography>
                      <Divider orientation="vertical" flexItem />
                      <Typography variant="body2">{currencyFormat(assignment.quantity * unitCost)}</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton size="small" color="primary" onClick={() => startEditing(assignment)} title="Edit this assignment">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}

            {showForm && (
              <Card variant="outlined" sx={{ borderColor: "primary.main" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">New Assignment</Typography>
                    <IconButton size="small" color="error" onClick={resetForm}><DeleteOutlineIcon fontSize="small" /></IconButton>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField label="Quantity" type="number" size="small" value={form.quantity}
                      onChange={(e) => { const v = e.target.value; updateForm("quantity", v === "" ? "" : Math.max(0, parseInt(v, 10) || 0)); }}
                      inputProps={{ min: 1, max: remainingQty }} helperText={`Max: ${remainingQty}`} sx={{ width: 130 }} required />
                    <TextField label="Department / Office" size="small" value={form.department}
                      onChange={(e) => updateForm("department", e.target.value)} sx={{ flexGrow: 1 }} required />
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Autocomplete size="small" options={signatoryOptions} value={form.receivedFrom}
                      onChange={(_, v) => updateForm("receivedFrom", v)} getOptionLabel={(o) => o.label}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      renderInput={(params) => <TextField {...params} label="Received From (Supply Officer)" required />} sx={{ flex: 1 }} />
                    <Autocomplete size="small" options={userOptions} value={form.receivedBy}
                      onChange={(_, v) => updateForm("receivedBy", v)} getOptionLabel={(o) => o.label}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      renderInput={(params) => <TextField {...params} label="Received By (End User)" required />} sx={{ flex: 1 }} />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="contained" color="primary"
                      startIcon={createLoading ? <CircularProgress size={20} /> : <VpnKeyIcon />}
                      onClick={handleGenerateAndSave} disabled={createLoading}>
                      Generate RIS ID & Save
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {!showForm && remainingQty > 0 && (
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderStyle: "dashed", cursor: "pointer" }}
                onClick={() => setShowForm(true)}>
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setShowForm(true)}>
                  Add Assignment ({remainingQty} remaining)
                </Button>
              </Paper>
            )}

            {!showForm && remainingQty === 0 && savedAssignments.length > 0 && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                All quantities have been assigned. You can edit existing assignments above or close this dialog.
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
