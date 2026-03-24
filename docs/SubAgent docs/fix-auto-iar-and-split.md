# Fix Spec: Auto IAR Creation & Split Validation Issues

## Issue 1: Auto IAR Creation When Adding PO Items

### Summary

When updating a Purchase Order (editing/adding items via the PO modal), if `currentInput` > 0 is sent, the `updatePurchaseOrder` resolver **automatically creates an IAR record**. This is **by design** for the "Receive" flow in the PO edit modal. However, the user reports that simply _adding_ items to a PO should NOT auto-create an IAR.

### Root Cause Analysis

**The `addPurchaseOrder` mutation is CLEAN — it does NOT create IARs.**

- File: `api/resolvers/purchaseorder.resolver.js`, lines 230–335
- Lines 324–325 explicitly state: _"IAR creation is now deferred to the separate 'Generate IAR' step."_
- `actualQuantityReceived` is set to `0` at line 317
- No `inspectionAcceptanceReport.create()` call exists in this path

**The `updatePurchaseOrder` mutation DOES create IARs** when `currentInput > 0`:

- File: `api/resolvers/purchaseorder.resolver.js`
- **Existing items** (id !== 'temp'): Lines 570–587 — if `receivedQty > 0`, creates IAR via `inspectionAcceptanceReport.create()` at line 587
- **New items** (id === 'temp'): Lines 716–738 — if `item.currentInput > 0`, creates IAR via `inspectionAcceptanceReport.create()` at line 720

**This is the "Receive" feature, intentionally triggered when a user clicks "Receive" in the PO edit modal.**

### Frontend Entry Points

1. **PO Edit Modal** (`app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx`):
   - Line 132: `currentInput` defaults to `0` for existing items ✓
   - Line 244: `currentInput` defaults to `0` for new (temp) items ✓
   - Lines 960–990: "Qty to Receive" TextField is only shown in an expandable section when user clicks "Receive" button
   - **This is correctly gated** — users must explicitly click "Receive" and enter a quantity

2. **Inventory page add-item** (`app/src/pages/inventory.tsx`):
   - Line 199: `currentInput: recv` — when adding items from the inventory page, `recv` value is passed
   - This calls `updatePurchaseOrder` and if `recv > 0`, IAR is created
   - **This is intentional** — the inventory page flow adds items AND receives them in one step

### Verdict on Issue 1

**The current code is actually working correctly.** The IAR is NOT auto-created when simply adding a PO or adding items. It is only created when:

1. A user explicitly clicks "Receive" in the PO edit modal and enters a quantity > 0
2. A user adds items from the inventory page with a receive quantity > 0
3. A user uses the dedicated "Generate IAR" button (`generateIARFromPO` mutation)

**If the user is still seeing auto-IAR creation**, the likely cause is:

- The `updatePurchaseOrder` receives `currentInput > 0` unintentionally from the frontend
- Possible: when the PO edit modal sends `currentInput` as empty string instead of 0, it might get coerced

### Recommended Investigation

Check if `currentInput` is being unintentionally sent with a value > 0 during PO item addition. The `purchaseOrderOperations.tsx` file (line 76–90) sends `cleanFormData` which includes all item fields — verify `currentInput` is stripped or reset to 0.

**File:** `app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx`, lines 298–312 (onSubmit cleanup):

```js
// currentInput should be excluded from the payload when not actively receiving
```

Check line 303 — `actualQuantityReceived` is deleted from the payload but `currentInput` is NOT explicitly stripped. If a temp item has `currentInput: 0`, the backend check `if (item.currentInput && Number(item.currentInput) > 0)` at line 688 correctly skips IAR creation. But if `currentInput` is truthy (non-zero), IAR gets created.

---

## Issue 2: Split Validation — Allows Invalid Quantities

### Summary

When splitting items (ICS/PAR/RIS), the total split quantities can **exceed** the original item's `actualQuantityReceived`. For example, an item with qty 2 can be split into 3+1=4.

### Root Cause

**Neither the frontend NOR the backend validates that `splitTotalQty === splitOriginalQty`.**

#### Backend — No validation at all:

1. **`splitAndAssignICS`** — `api/resolvers/inspectionacceptancereport.resolver.js`, lines 797–935
   - Lines 824–825: Only checks `splits.length === 0`
   - **NO check** that `sum(splits[].quantity) <= original.actualQuantityReceived`
   - Each split's `quantity` is used directly without bounds checking (line 852: `firstSplit.quantity`)

2. **`splitAndAssignPAR`** — `api/resolvers/propertyacknowledgementrepoert.resolver.js`, lines 252–380+
   - Lines 281–282: Only checks `splits.length === 0`
   - **NO check** that `sum(splits[].quantity) <= original.actualQuantityReceived`

3. **`splitAndAssignRIS`** — `api/resolvers/requisitionissueslip.resolver.js`, lines 105–230+
   - Lines 132–133: Only checks `splits.length === 0`
   - **NO check** that `sum(splits[].quantity) <= original.actualQuantityReceived`

#### Frontend — Displays but doesn't enforce:

1. **`MultiIcsAssignmentModal.tsx`** — `app/src/components/MultiIcsAssignmentModal.tsx`
   - Line 412: `splitTotalQty = splitRows.reduce((sum, r) => sum + r.quantity, 0)`
   - Line 413: `splitOriginalQty = splitSourceItem?.actualQuantityReceived || 0`
   - **Displayed** at lines 1037–1042 as informational text: "X unit(s) from original qty of Y"
   - **NOT enforced** — `handleSplitAndAssign()` (lines 432–498) only checks:
     - `splitTotalQty === 0` (line 444) — must be > 0
     - `row.quantity <= 0` (line 452) — each row must be > 0
     - **Missing:** `splitTotalQty > splitOriginalQty` — allows exceeding total!
   - Button disabled condition (line 1057): `splitLoading || splitTotalQty === 0` — only checks for zero, not overflow

2. **`MultiRisAssignmentModal.tsx`** — `app/src/components/MultiRisAssignmentModal.tsx`
   - Same pattern: lines 403–404 compute `splitTotalQty` and `splitOriginalQty`
   - `handleSplitAndAssign()` (lines 425–498): same missing validation
   - Button disabled (line 1040): `splitLoading || splitTotalQty === 0`

3. **`MultiParAssignmentModal.tsx`** — `app/src/components/MultiParAssignmentModal.tsx`
   - Same pattern: lines 412–413 compute `splitTotalQty` and `splitOriginalQty`
   - `handleSplitAndAssign()` (lines 432–498): same missing validation
   - Button disabled (line 1057): `splitLoading || splitTotalQty === 0`

### Required Fix

#### Backend (all three resolvers) — Add validation after `splits.length === 0` check:

**File: `api/resolvers/inspectionacceptancereport.resolver.js`**  
After line 825 (`throw new Error('At least one split is required per item');`), add:

```js
// Validate total split quantity equals original
const totalSplitQty = splits.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
const originalQty = Number(original.actualQuantityReceived || 0);
if (totalSplitQty !== originalQty) {
  throw new Error(
    `Total split quantity (${totalSplitQty}) must equal the original quantity (${originalQty}).`
  );
}
```

Insert at: **line 827** (after the `splits.length === 0` block closing brace)

**File: `api/resolvers/propertyacknowledgementrepoert.resolver.js`**  
After line 282, add same validation block.
Insert at: **line 284**

**File: `api/resolvers/requisitionissueslip.resolver.js`**  
After line 133, add same validation block.
Insert at: **line 135**

#### Frontend (all three modals) — Add validation in `handleSplitAndAssign`:

**File: `app/src/components/MultiIcsAssignmentModal.tsx`**  
After line 445 (`setError('Total split quantity must be greater than 0.');`), add:

```tsx
if (splitTotalQty !== splitOriginalQty) {
  setError(
    `Total split quantity (${splitTotalQty}) must equal the original quantity (${splitOriginalQty}).`
  );
  return;
}
```

Insert at: **line 448** (after the `splitTotalQty === 0` block)

Also disable the submit button when quantities don't match.  
Change line 1057 from:

```tsx
disabled={splitLoading || splitTotalQty === 0}
```

to:

```tsx
disabled={splitLoading || splitTotalQty === 0 || splitTotalQty !== splitOriginalQty}
```

**File: `app/src/components/MultiRisAssignmentModal.tsx`**  
Same changes at equivalent locations (after line 437, button at line 1040).

**File: `app/src/components/MultiParAssignmentModal.tsx`**  
Same changes at equivalent locations (after line 448, button at line 1057).

#### Visual Feedback — Show warning when quantities don't match:

In all three modals, in the summary section where `splitTotalQty` and `splitOriginalQty` are displayed, add a color/warning:

```tsx
<Typography variant="body2" color={splitTotalQty !== splitOriginalQty ? 'error' : 'text.primary'}>
  <strong>{splitRows.length}</strong> split(s) totaling <strong>{splitTotalQty}</strong> unit(s)
  from original qty of {splitOriginalQty}
  {splitTotalQty !== splitOriginalQty && <> — must equal {splitOriginalQty}</>}
</Typography>
```

---

## Issue 3: Split Confirmation Popup

### Summary

Splitting is a destructive, hard-to-reverse operation (can only be undone by reverting the entire IAR). A confirmation dialog should be shown before proceeding.

### Current Behavior

All three modals (`MultiIcsAssignmentModal`, `MultiRisAssignmentModal`, `MultiParAssignmentModal`) submit the split immediately when the "Split & Assign" button is clicked — no confirmation step.

### Required Fix

Add a confirmation dialog before calling the split mutation in all three modals.

#### Files to modify:

1. **`app/src/components/MultiIcsAssignmentModal.tsx`**
   - Add state: `const [showSplitConfirm, setShowSplitConfirm] = useState(false);`
   - In `handleSplitAndAssign()`: After all validation passes (line ~465), instead of calling `splitAndAssignICS(...)` directly, set `setShowSplitConfirm(true)` and return
   - Create a new function `confirmSplitAndAssign()` that contains the actual mutation call (the try/catch block from lines 466–498)
   - Add a confirmation Dialog:

   ```tsx
   <Dialog open={showSplitConfirm} onClose={() => setShowSplitConfirm(false)}>
     <DialogTitle>Confirm Split</DialogTitle>
     <DialogContent>
       <Alert severity="warning" sx={{ mb: 2 }}>
         This action cannot be easily undone. Splits can only be reverted by reverting the entire
         IAR.
       </Alert>
       <Typography>
         You are about to split "{splitSourceItem?.description || 'item'}" into {splitRows.length}{' '}
         separate ICS assignment(s) totaling {splitTotalQty} unit(s).
       </Typography>
     </DialogContent>
     <DialogActions>
       <Button onClick={() => setShowSplitConfirm(false)}>Cancel</Button>
       <Button variant="contained" color="warning" onClick={confirmSplitAndAssign}>
         Confirm Split
       </Button>
     </DialogActions>
   </Dialog>
   ```

2. **`app/src/components/MultiRisAssignmentModal.tsx`**  
   Same pattern — add confirmation dialog before `splitAndAssignRIS()` call.

3. **`app/src/components/MultiParAssignmentModal.tsx`**  
   Same pattern — add confirmation dialog before `splitAndAssignPAR()` call.

---

## Summary of All Changes

| File                                                             | Issue  | Change                                                    |
| ---------------------------------------------------------------- | ------ | --------------------------------------------------------- |
| `api/resolvers/inspectionacceptancereport.resolver.js` ~L827     | #2     | Add split qty validation                                  |
| `api/resolvers/propertyacknowledgementrepoert.resolver.js` ~L284 | #2     | Add split qty validation                                  |
| `api/resolvers/requisitionissueslip.resolver.js` ~L135           | #2     | Add split qty validation                                  |
| `app/src/components/MultiIcsAssignmentModal.tsx` ~L448, L1057    | #2, #3 | Add qty validation + disable button + confirmation dialog |
| `app/src/components/MultiRisAssignmentModal.tsx` ~L437, L1040    | #2, #3 | Add qty validation + disable button + confirmation dialog |
| `app/src/components/MultiParAssignmentModal.tsx` ~L448, L1057    | #2, #3 | Add qty validation + disable button + confirmation dialog |

### Issue 1 Status

The `addPurchaseOrder` resolver already correctly does NOT create IARs. The `updatePurchaseOrder` resolver creates IARs only when `currentInput > 0`, which is the intentional "Receive" feature. If the user is seeing unwanted IAR creation, it may be due to `currentInput` being unintentionally non-zero — investigate the specific scenario the user is experiencing.
