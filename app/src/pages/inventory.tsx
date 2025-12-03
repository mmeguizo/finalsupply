import * as React from "react";
import { useQuery } from "@apollo/client";
import {
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
  Toolbar,
  TablePagination,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PreviewIcon from "@mui/icons-material/Preview";
import SearchIcon from "@mui/icons-material/Search";
import NotificationDialog from "../components/notifications";
import ConfirmDialog from "../components/confirmationdialog";
//@ts-ignore
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT } from "../graphql/queries/inspectionacceptancereport.query";
import PrintReportDialogForIAR from "../components/printReportModalForIAR";
import SignatoriesComponent from "./inventoryFunctions/SignatorySelectionContainer";
import {
  formatTimestampToDateTime,
  currencyFormat,
} from "../utils/generalUtils";
import { Select, MenuItem, Chip } from "@mui/material";
import { useMutation } from "@apollo/client";
import {
  UPDATE_IAR_STATUS,
  REVERT_IAR_BATCH,
  APPEND_TO_EXISTING_IAR,
  CREATE_LINE_ITEM_FROM_EXISTING,
} from "../graphql/mutations/inventoryIAR.mutation";
// @ts-ignore
import {
  GET_PURCHASEORDERS,
  GET_ALL_DASHBOARD_DATA,
} from "../graphql/queries/purchaseorder.query";
// @ts-ignore
import { UPDATE_PURCHASEORDER } from "../graphql/mutations/purchaseorder.mutation";
import useSignatoryStore from "../stores/signatoryStore";

// Row component for collapsible table
function Row(props: {
  row: any;
  handleOpenPrintModal: (item: any, iarId: string) => void;
  onStatusUpdate: (iarId: string, status: string) => void;
  onRevert: (iarId: string) => void;
  onNotify: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
  // overrides
  invoiceOverride?: string;
  dateOfPaymentOverride?: string;
  incomeOverride?: string;
  mdsOverride?: string;
  detailsOverride?: string;
  onOverrideChange: (
    iarId: string,
    patch: { invoice?: string; dateOfPayment?: string; income?: string; mds?: string; details?: string }
  ) => void;
}) {
  const {
    row,
    handleOpenPrintModal,
    onStatusUpdate,
    onRevert,
    onNotify,
    invoiceOverride,
    dateOfPaymentOverride,
    incomeOverride,
    mdsOverride,
    detailsOverride,
    onOverrideChange,
  } = props;
  const [open, setOpen] = React.useState(false);
  const [savingIncome, setSavingIncome] = React.useState(false);
  const [savingMds, setSavingMds] = React.useState(false);
  const [savingDetails, setSavingDetails] = React.useState(false);
  const canRevert = React.useMemo(() => {
    if (!row?.items?.length) return false;
    return row.items.some(
      (it: any) => Number(it.actualQuantityReceived || 0) > 0
    );
  }, [row]);
  // Parent Purchase Order completed state (same PO across grouped items)
  const poCompleted = row?.items?.[0]?.PurchaseOrder?.status === "completed";

  // Local state to add a NEW item into the same Purchase Order directly from Inventory
  const [newItemDraft, setNewItemDraft] = React.useState<any>({
    description: "",
    unit: "",
    quantity: 0,
    unitCost: 0,
    received: 0,
    category: "requisition issue slip",
  });

  // Mutation to update item details (description/unit) via Purchase Order
  const [updatePurchaseOrder] = useMutation(UPDATE_PURCHASEORDER, {
    awaitRefetchQueries: true,
    refetchQueries: [
      { query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT },
      { query: GET_PURCHASEORDERS },
      { query: GET_ALL_DASHBOARD_DATA },
    ],
  });

  // Mutation to append a new IAR line under the same IAR ID
  const [appendToExistingIAR] = useMutation(APPEND_TO_EXISTING_IAR, {
    awaitRefetchQueries: true,
    refetchQueries: [
      { query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT },
      { query: GET_PURCHASEORDERS },
      { query: GET_ALL_DASHBOARD_DATA },
    ],
  });

  // Mutation to create a NEW PO item from an existing one (same itemGroupId)
  const [createLineItemFromExisting] = useMutation(CREATE_LINE_ITEM_FROM_EXISTING, {
    awaitRefetchQueries: true,
    refetchQueries: [
      { query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT },
      { query: GET_PURCHASEORDERS },
      { query: GET_ALL_DASHBOARD_DATA },
    ],
  });

  // Per-item add-line drafts keyed by purchaseOrderItemId
  const [iarLineDrafts, setIarLineDrafts] = React.useState<
    Record<
      string,
      {
        description?: string;
        generalDescription?: string;
        specification?: string;
        received?: number;
      }
    >
  >({});

  const handleAddNewItem = async () => {
    try {
      const poId =
        row.items?.[0]?.PurchaseOrder?.id || row.items?.[0]?.purchaseOrderId;
      if (!poId) return;

      const q = Number(newItemDraft.quantity || 0);
      const uc = Number(newItemDraft.unitCost || 0);
      const recv = Number(newItemDraft.received || 0);
      const amt = q * uc;

      // Basic validation: must have description and non-negative numbers; received cannot exceed quantity
      if (!newItemDraft.description?.trim()) return;
      if (q <= 0 || uc < 0 || recv < 0 || recv > q) return;

      const payloadItem = {
        id: "temp", // signals backend to create a new PO item
        description: newItemDraft.description,
        generalDescription: newItemDraft.generalDescription || "",
        specification: newItemDraft.specification || "",
        itemName: newItemDraft.itemName || "",
        unit: newItemDraft.unit,
        quantity: q,
        unitCost: uc,
        amount: amt,
        category: newItemDraft.category,
        currentInput: recv, // immediately receive this amount and create IAR/history
      };

      const resp = await updatePurchaseOrder({
        variables: {
          input: {
            id: Number(poId),
            items: [payloadItem],
          },
        },
      });

      // Ensure UI reflects the newly created PO item
      await refetch();

      // Reset draft row
      setNewItemDraft({
        description: "",
        generalDescription: "",
        specification: "",
        itemName: "",
        unit: "",
        quantity: 0,
        unitCost: 0,
        received: 0,
        category: "requisition issue slip",
      });
    } catch (e) {
      console.error("Failed to add new PO item from Inventory:", e);
    }
  };

  const poDefaults = {
    invoice: row.items?.[0]?.PurchaseOrder?.invoice || "",
    dateOfPayment: row.items?.[0]?.PurchaseOrder?.dateOfPayment || "",
    income: row.items?.[0]?.PurchaseOrder?.income || "",
    mds: row.items?.[0]?.PurchaseOrder?.mds || "",
    details: row.items?.[0]?.PurchaseOrder?.details || "",
  };
  const invoiceValue = invoiceOverride ?? poDefaults.invoice;
  const dateValue = dateOfPaymentOverride ?? poDefaults.dateOfPayment;
  const incomeValue = incomeOverride ?? poDefaults.income;
  const mdsValue = mdsOverride ?? poDefaults.mds;
  const detailsValue = detailsOverride ?? poDefaults.details;

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.po}
        </TableCell>
        <TableCell component="th" scope="row">
          {row.iarId}
        </TableCell>
        <TableCell>{formatTimestampToDateTime(row.createdAt)}</TableCell>
        <TableCell component="th" scope="row">
          <Select
            value={row.iarStatus || "none"}
            onChange={(e) => onStatusUpdate(row.iarId, e.target.value)}
            size="small"
            variant="outlined"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="complete">Complete</MenuItem>
          </Select>
        </TableCell>
        {/* Invoice input */}
        <TableCell>
          <TextField
            size="small"
            placeholder={poDefaults.invoice || "Invoice #"}
            value={invoiceOverride ?? ""}
            onChange={(e) =>
              onOverrideChange(row.iarId, { invoice: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            sx={{ minWidth: 160 }}
          />
        </TableCell>
        {/* Invoice Date input */}
        <TableCell>
          <TextField
            type="date"
            size="small"
            placeholder={poDefaults.dateOfPayment || "YYYY-MM-DD"}
            value={dateOfPaymentOverride ?? ""}
            onChange={(e) =>
              onOverrideChange(row.iarId, { dateOfPayment: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            sx={{ minWidth: 160 }}
            InputLabelProps={{ shrink: true }}
          />
        </TableCell>
        {/* Income multiline enter-to-save */}
        <TableCell>
          <TextField
            size="small"
            multiline
            maxRows={3}
            placeholder={poDefaults.income || "Hit Enter to save.."}
            value={incomeOverride !== undefined ? incomeOverride : poDefaults.income}
            onChange={(e) => onOverrideChange(row.iarId, { income: e.target.value })}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                const valueToSave = (target.value || '').trim();
                try {
                  setSavingIncome(true);
                  const poId = row.items?.[0]?.PurchaseOrder?.id || row.items?.[0]?.purchaseOrderId;
                  if (poId) {
                    await updatePurchaseOrder({ variables: { input: { id: Number(poId), income: valueToSave } } });
                    onNotify('Income saved');
                  }
                } catch (err) { console.error('Failed to save income', err); onNotify('Failed to save income','error'); }
                finally { setSavingIncome(false); }
              }
            }}
            sx={{ minWidth: 160 }}
            InputProps={{
              endAdornment: savingIncome ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
              readOnly: false,
            }}
            disabled={savingIncome}
          />
        </TableCell>
        {/* MDS multiline enter-to-save */}
        <TableCell>
          <TextField
            size="small"
            multiline
            maxRows={3}
            placeholder={poDefaults.mds || "Hit Enter to save.."}
            value={mdsOverride !== undefined ? mdsOverride : poDefaults.mds}
            onChange={(e) => onOverrideChange(row.iarId, { mds: e.target.value })}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                const valueToSave = (target.value || '').trim();
                try {
                  setSavingMds(true);
                  const poId = row.items?.[0]?.PurchaseOrder?.id || row.items?.[0]?.purchaseOrderId;
                  if (poId) {
                    await updatePurchaseOrder({ variables: { input: { id: Number(poId), mds: valueToSave } } });
                    onNotify('MDS saved');
                  }
                } catch (err) { console.error('Failed to save mds', err); onNotify('Failed to save MDS','error'); }
                finally { setSavingMds(false); }
              }
            }}
            sx={{ minWidth: 160 }}
            InputProps={{
              endAdornment: savingMds ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
              readOnly: false,
            }}
            disabled={savingMds}
          />
        </TableCell>
        {/* Details multiline enter-to-save */}
        <TableCell>
          <TextField
            size="small"
            multiline
            maxRows={3}
            placeholder={poDefaults.details || "Hit Enter to save..."}
            value={detailsOverride !== undefined ? detailsOverride : poDefaults.details}
            onChange={(e) => onOverrideChange(row.iarId, { details: e.target.value })}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                const valueToSave = (target.value || '').trim();
                try {
                  setSavingDetails(true);
                  const poId = row.items?.[0]?.PurchaseOrder?.id || row.items?.[0]?.purchaseOrderId;
                  if (poId) {
                    await updatePurchaseOrder({ variables: { input: { id: Number(poId), details: valueToSave } } });
                    onNotify('Details saved');
                  }
                } catch (err) { console.error('Failed to save details', err); onNotify('Failed to save details','error'); }
                finally { setSavingDetails(false); }
              }
            }}
            sx={{ minWidth: 200 }}
            InputProps={{
              endAdornment: savingDetails ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
              readOnly: false,
            }}
            disabled={savingDetails}
          />
        </TableCell>
        <TableCell>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPrintModal(row.items, row.iarId);
            }}
            sx={{ mr: 1 }}
          >
            <PreviewIcon fontSize="medium" />
          </Button>
        </TableCell>
        <TableCell>
          {canRevert && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              disabled={poCompleted}
              onClick={(e) => {
                e.stopPropagation();
                onRevert(row.iarId);
              }}
            >
              Revert
            </Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ p: 0 }} colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 0 }}>
          
              <Table size="small" aria-label="details" sx={{ width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>General Desc.</TableCell>
                    <TableCell>Specification</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Actual Received</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    {/* <TableCell>P.O. #</TableCell> */}
                    <TableCell>Category</TableCell>
                    <TableCell align="center">Add Line</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items.map((item: any) => {

                    console.log('🔍 Processing item:', item);

                    const poi = item.PurchaseOrderItem;
                    const isCompleted =
                      item.PurchaseOrder?.status === "completed";

                    const currentDescription =
                      poi?.description ?? item.description ?? "";
                    const currentGenDesc =
                      poi?.generalDescription ?? item.generalDescription ?? "";
                    const currentSpec =
                      poi?.specification ?? item.specification ?? "";
                    const currentUnit = poi?.unit ?? item.unit ?? "";

                    // Get itemGroupId - this should exist if items were created via createLineItemFromExisting
                    const currentItemGroupId = poi?.itemGroupId || item.itemGroupId;
                    
                    // console.log('🔍 Item Group Check:', {
                    //   itemId: item.id,
                    //   poiId: poi?.id,
                    //   currentItemGroupId,
                    //   description: currentDescription?.substring(0, 20),
                    //   actualReceived: poi?.actualQuantityReceived || item.actualQuantityReceived
                    // });

                    // Determine the base ordered quantity for the group
                    const baseQuantity = Number(poi?.quantity || item.quantity || 0);

                    // If NO itemGroupId exists, we need to find items that should be grouped
                    // by matching description, unit, unitCost, etc. (fallback heuristic)
                    let groupedItems = [];
                    if (currentItemGroupId) {
                      // Use itemGroupId to find all items in this group
                      groupedItems = row.items.filter((i: any) => {
                        const iPoi = i.PurchaseOrderItem;
                        const iGroupId = iPoi?.itemGroupId || i.itemGroupId;
                        return iGroupId === currentItemGroupId;
                      });
                    } else {
                      // Fallback: group by description + unit + unitCost
                      const desc = currentDescription;
                      const unit = currentUnit;
                      const cost = Number(poi?.unitCost || item.unitCost || 0);
                      
                      groupedItems = row.items.filter((i: any) => {
                        const iPoi = i.PurchaseOrderItem;
                        const iDesc = iPoi?.description ?? i.description ?? "";
                        const iUnit = iPoi?.unit ?? i.unit ?? "";
                        const iCost = Number(iPoi?.unitCost || i.unitCost || 0);
                        return iDesc === desc && iUnit === unit && iCost === cost;
                      });
                    }

                    // Sum actualQuantityReceived across ALL items in this logical group
                    const totalReceivedInGroup = groupedItems.reduce((sum: number, i: any) => {
                      const iPoi = i.PurchaseOrderItem;
                      const recv = Number(
                        iPoi?.actualQuantityReceived || i.actualQuantityReceived || 0
                      );
                      return sum + recv;
                    }, 0);

                    // Remaining for the WHOLE group, not per row
                    const remaining = Math.max(0, baseQuantity - totalReceivedInGroup);
                    
                    console.log('📊 Remaining Calc:', {
                      baseQuantity,
                      totalReceivedInGroup,
                      remaining,
                      groupedItemsCount: groupedItems.length
                    });

                    // Show this row's own received (for clarity)
                    const totalReceived = Number(
                      poi?.actualQuantityReceived || item.actualQuantityReceived || 0
                    );

                    // Original PO fields are view-only in this table.

                    // CRITICAL: Use itemGroupId as the ONLY draftKey so all items in a group share ONE form
                    // If no itemGroupId (shouldn't happen now), fall back to a stable group key
                    const draftKey = currentItemGroupId || 
                      `fallback_${currentDescription}_${currentUnit}_${Number(poi?.unitCost || item.unitCost || 0)}`;
                    
                    // Check if ANY item in this group already has a draft open
                    const draft = iarLineDrafts[draftKey] || null;

                    const updateDraft = (
                      patch: Partial<{
                        description?: string;
                        generalDescription?: string;
                        specification?: string;
                        received?: number;
                      }>
                    ) => {
                      // If updating received, clamp to [0, remaining]
                      if (patch.received !== undefined) {
                        const raw = Number(patch.received) || 0;
                        patch.received = Math.min(Math.max(0, raw), remaining);
                      }
                      setIarLineDrafts((prev) => ({
                        ...prev,
                        [draftKey]: { ...(prev[draftKey] || {}), ...patch },
                      }));
                    };

                    const clearDraft = () => {
                      setIarLineDrafts((prev) => {
                        const next = { ...prev } as any;
                        delete next[draftKey];
                        return next;
                      });
                    };

                    const handleAddLine = async () => {
                      if (!draft) return;
                      const recv = Number(draft.received || 0);
                      if (recv <= 0) return;
                      const clamped = Math.min(recv, remaining);
                      if (clamped <= 0) return;
                      try {
                        const poiIdNum = parseInt(
                          String(poi?.id ?? item.purchaseOrderItemId),
                          10
                        );
                        if (!Number.isFinite(poiIdNum)) {
                          console.error(
                            "Invalid purchaseOrderItemId",
                            poi?.id,
                            item.purchaseOrderItemId
                          );
                          return;
                        }
                        // Use the new mutation to create a distinct PO item with the same itemGroupId
                        await createLineItemFromExisting({
                          variables: {
                            sourceItemId: poiIdNum,
                            newItem: {
                              iarId: row.iarId,
                              quantity: clamped, // New item quantity = what we're receiving now
                              received: clamped, // Immediately mark as received
                              description: draft.description || undefined,
                              generalDescription: draft.generalDescription || undefined,
                              specification: draft.specification || undefined,
                            },
                          },
                        });
                        onNotify(`Created new line item (received ${clamped})`, 'success');
                        clearDraft();
                      } catch (e) {
                        console.error("Failed to create line item", e);
                        onNotify("Failed to create line item", 'error');
                      }
                    };

                    return (
                      <React.Fragment key={item.id}>
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {currentDescription || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {currentGenDesc || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              {currentSpec || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {currentUnit || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography>
                              {totalReceived}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {currencyFormat(item.unitCost)}
                          </TableCell>
                          <TableCell align="right">
                            {currencyFormat(item.amount)}
                          </TableCell>
                          {/* <TableCell>{item.PurchaseOrder?.poNumber}</TableCell> */}
                          <TableCell>
                            {item.category
                              ?.split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </TableCell>
                          <TableCell align="center">
                            {!draft && (
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={remaining <= 0 || isCompleted}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDraft({
                                    description: "",
                                    generalDescription: "",
                                    specification: "",
                                    received: 0,
                                  });
                                }}
                              >
                                + Add
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        {draft && groupedItems[0]?.id === item.id && (
                          <TableRow>
                            {/* Description */}
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                placeholder="New Description"
                                multiline
                                maxRows={3}
                                value={draft.description ?? ""}
                                onChange={(e) =>
                                  updateDraft({ description: e.target.value })
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            {/* General Desc. */}
                            <TableCell>
                              <TextField
                                size="small"
                                multiline
                                maxRows={3}
                                fullWidth
                                placeholder="New General Desc."
                                value={draft.generalDescription ?? ""}
                                onChange={(e) =>
                                  updateDraft({
                                    generalDescription: e.target.value,
                                  })
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            {/* Specification */}
                            <TableCell>
                              <TextField
                                size="small"
                                multiline
                                maxRows={3}
                                fullWidth
                                placeholder="New Specification"
                                value={draft.specification ?? ""}
                                onChange={(e) =>
                                  updateDraft({ specification: e.target.value })
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            {/* Unit (read-only to align) */}
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                value={currentUnit || "-"}
                                InputProps={{ readOnly: true }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            {/* Actual Received input aligned in its column */}
                            <TableCell align="right">
                              <TextField
                                type="number"
                                size="small"
                                sx={{ width: 120 }}
                                placeholder="Received"
                                value={draft.received ?? ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  updateDraft({
                                    received: val,
                                  });
                                }}
                                onBlur={(e) => {
                                  // Force clamp on blur to ensure value is within range
                                  const val = Number(e.target.value);
                                  if (val > remaining) {
                                    updateDraft({ received: remaining });
                                  }
                                }}
                                inputProps={{ min: 0, max: remaining }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            {/* Quantity */}
                            <TableCell align="right">{item.quantity}</TableCell>
                            {/* Unit Cost */}
                            <TableCell align="right">
                              {currencyFormat(item.unitCost)}
                            </TableCell>
                            {/* Amount */}
                            <TableCell align="right">
                              {currencyFormat(item.amount)}
                            </TableCell>
                            {/* Category */}
                            <TableCell>
                              {item.category
                                ?.split(" ")
                                .map(
                                  (word: string) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </TableCell>
                            {/* Add/Cancel buttons in Add Line column */}
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "center",
                                }}
                              >
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={handleAddLine}
                                  disabled={remaining <= 0}
                                >
                                  Add
                                </Button>
                                <Button size="small" onClick={clearDraft}>
                                  Cancel
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {/* Add-new-item row removed per requirement to avoid adding new line items from Inventory for now */}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Custom toolbar with search functionality
function EnhancedTableToolbar(props: {
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { searchQuery, onSearchChange } = props;

  return (
    <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
      <Typography
        sx={{ flex: "1 1 100%" }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        Inventory
      </Typography>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search IAR#, description..."
        value={searchQuery}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Toolbar>
  );
}
// InventoryPage component
export default function InventoryPage() {
  const { data, loading, error, refetch } = useQuery(
    GET_ALL_INSPECTION_ACCEPTANCE_REPORT,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    }
  );

  const [iarOverrides, setIarOverrides] = React.useState<
    Record<
      string,
      {
        invoice?: string;
        dateOfPayment?: string;
        income?: string;
        mds?: string;
        details?: string;
      }
    >
  >({});
  const [poOverrides, setPoOverrides] = React.useState<{
    invoice?: string;
    dateOfPayment?: string;
  } | null>(null);

  const [printPOI, setPrintPOI] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  // Local signatories state for Inventory printing
  // const [selectedSignatories, setSelectedSignatories] = React.useState<any>({});

  const IARSelections = useSignatoryStore((s) => s.IARSelections);

  const  setSelectedIAR = useSignatoryStore((s) => s.setIARSelections);
  const defaultSelections = React.useMemo(() => ({}), []);

  const currentSelections = IARSelections || defaultSelections;

  const [updateIARStatus] = useMutation(UPDATE_IAR_STATUS, {
    refetchQueries: [{ query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT }],
  });
  const [revertIARBatch] = useMutation(REVERT_IAR_BATCH, {
    awaitRefetchQueries: true,
    refetchQueries: [
      { query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT },
      // Also refresh purchase orders and dashboard aggregates so all views update
      { query: GET_PURCHASEORDERS },
      { query: GET_ALL_DASHBOARD_DATA },
    ],
  });

  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(6);

  // Notifications state
  const [showNotification, setShowNotification] = React.useState(false);
  const [notificationMessage, setNotificationMessage] = React.useState("");
  const [notificationSeverity, setNotificationSeverity] = React.useState<
    "success" | "error" | "info" | "warning"
  >("success");

  // Confirm dialog state for revert
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingIarToRevert, setPendingIarToRevert] = React.useState<
    string | null
  >(null);

  const handleOpenPrintModal = (poItems: any, iarId: string) => {
    setReportType("inspection");
    setPrintPOI(poItems);
    setPoOverrides(iarOverrides[iarId] ?? null);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintPOI(null);
    setPoOverrides(null);
  };

  const onSignatoriesChange = (signatories: any) => {
    console.log("onSignatoriesChange signatories for IAR:", signatories);
    setSelectedIAR(signatories);
  };
  
  // Add this function after handleClosePrintModal (around line 177)
  const handleStatusUpdate = async (iarId: string, newStatus: string) => {
    try {
      // TODO: Replace with your actual mutation
      // await updateIARStatus({ variables: { iarId, status: newStatus } });
      console.log(`Updating IAR ${iarId} to status: ${newStatus}`);
      const results = await updateIARStatus({
        variables: {
          airId: iarId, // <-- send the variable name your mutation expects
          iarStatus: newStatus,
        },
      });
      if (results.data?.updateIARStatus) {
        console.log({ updateIARStatus: results.data.updateIARStatus });
        setNotificationMessage(results.data.updateIARStatus.message);
        setNotificationSeverity("success"); // Always success if we get here
        setShowNotification(true);
        console.log("Status updated successfully");
        refetch(); // Don't forget to refetch to update the UI
      } else {
        console.error("Failed to update status");
        setNotificationSeverity("error");
      }

      // Refetch data to update UI
      // refetch();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRevertIAR = (iarId: string) => {
    setPendingIarToRevert(iarId);
    setConfirmOpen(true);
  };

  const handleConfirmClose = async (confirmed: boolean) => {
    const iarId = pendingIarToRevert;
    setConfirmOpen(false);
    if (!confirmed || !iarId) {
      setPendingIarToRevert(null);
      return;
    }
    try {
      const res = await revertIARBatch({
        variables: { iarId, reason: "User requested revert" },
      });
      if (res.data?.revertIARBatch?.success) {
        setNotificationMessage(res.data.revertIARBatch.message);
        setNotificationSeverity("success");
        setShowNotification(true);
        await refetch();
      } else {
        setNotificationMessage("Failed to revert IAR batch.");
        setNotificationSeverity("error");
        setShowNotification(true);
      }
    } catch (e: any) {
      console.error(e);
      setNotificationMessage(e.message || "Error reverting IAR batch");
      setNotificationSeverity("error");
      setShowNotification(true);
    } finally {
      setPendingIarToRevert(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Group rows by iarId
  const groupedRows = React.useMemo(() => {
    if (!data?.inspectionAcceptanceReport?.length) return [];
    console.log("Raw IAR data:", data.inspectionAcceptanceReport);
    // Group by iarId
    const groups = data.inspectionAcceptanceReport.reduce(
      (acc: any, item: any) => {
        const iarId = item.iarId;
        if (!acc[iarId]) {
          acc[iarId] = [];
        }
        acc[iarId].push(item);
        return acc;
      },
      {}
    );

    // Create one row per iarId with all items
    return Object.entries(groups).map(([id, items]: any) => ({
      id: items[0].id,
      po: items[0].PurchaseOrder?.poNumber,
      iarId: items[0].iarId,
      iarStatus: items[0].iarStatus,
      createdAt: items[0].createdAt,
      items: items, // Store all items for this iarId
    }));
  }, [data]);

  // Filter rows based on search query
  const filteredRows = React.useMemo(() => {
    if (!searchQuery.trim()) return groupedRows;

    const lowerCaseQuery = searchQuery.toLowerCase();

    return groupedRows.filter((row) => {
      // console.log(row);
      // Check if IAR ID matches
      if (row.iarId.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }

      // Check if any item in this group matches the search criteria
      return row.items.some((item: any) => {
        return (
          // Search in various fields
          (item.description &&
            item.description.toLowerCase().includes(lowerCaseQuery)) ||
          (item.unit && item.unit.toLowerCase().includes(lowerCaseQuery)) ||
          (item.category &&
            item.category.toLowerCase().includes(lowerCaseQuery)) ||
          (item.PurchaseOrder?.poNumber &&
            item.PurchaseOrder.poNumber.toLowerCase().includes(lowerCaseQuery))
        );
      });
    });
  }, [groupedRows, searchQuery]);

  // Apply pagination to the filtered rows
  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredRows, page, rowsPerPage]);

  if (loading) return <CircularProgress />;
  if (error)
    return <Alert severity="error">Error loading data: {error.message}</Alert>;

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: "hidden" }}>
      {showNotification && (
        <NotificationDialog
          message={notificationMessage}
          severity={notificationSeverity}
          duration={2000}
          onClose={() => setShowNotification(false)}
        />
      )}
      <Stack
        spacing={3}
        sx={{
          width: "100%",
          overflow: "auto",
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        <Paper sx={{ width: "100%" }}>
          <EnhancedTableToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
          <TableContainer sx={{ px: 0 }}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>PO#</TableCell>
                  <TableCell>IAR#</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>IAR</TableCell>
                  {/* Expanded headers including financial/meta fields */}
                  <TableCell>Invoice#</TableCell>
                  <TableCell>Invoice Date</TableCell>
                  <TableCell>Income</TableCell>
                  <TableCell>MDS</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Print</TableCell>
                  <TableCell>Revert</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => (
                  <Row
                    key={row.iarId}
                    row={row}
                    handleOpenPrintModal={handleOpenPrintModal}
                    onStatusUpdate={handleStatusUpdate}
                    onRevert={handleRevertIAR}
                    onNotify={(message, severity = 'success') => {
                      setNotificationMessage(message);
                      setNotificationSeverity(severity);
                      setShowNotification(true);
                    }}
                    // pass overrides including new financial/meta fields
                    invoiceOverride={iarOverrides[row.iarId]?.invoice}
                    dateOfPaymentOverride={iarOverrides[row.iarId]?.dateOfPayment}
                    incomeOverride={iarOverrides[row.iarId]?.income}
                    mdsOverride={iarOverrides[row.iarId]?.mds}
                    detailsOverride={iarOverrides[row.iarId]?.details}
                    onOverrideChange={(iarId, patch) =>
                      setIarOverrides((prev) => ({
                        ...prev,
                        [iarId]: { ...(prev[iarId] || {}), ...patch },
                      }))
                    }
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        {/* Signatory selection for IAR printing */}
        <Paper sx={{ width: "100%", p: 2 }}>
          <SignatoriesComponent
            signatories={currentSelections}
            onSignatoriesChange={onSignatoriesChange}
          />
        </Paper>
      </Stack>
      <ConfirmDialog
        open={confirmOpen}
        message={`Are you sure you want to revert IAR batch ${pendingIarToRevert || ""}? This will roll back received quantities and hide IAR entries.`}
        onClose={handleConfirmClose}
      />
      <PrintReportDialogForIAR
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printPOI}
        reportType={reportType}
        signatories={currentSelections}
        // NEW: pass overrides
        poOverrides={poOverrides || undefined}
      />
    </PageContainer>
  );
}
