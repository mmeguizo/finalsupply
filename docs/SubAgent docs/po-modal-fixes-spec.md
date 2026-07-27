# Purchase Order Modal — Research Spec

## Relevant File Paths

| File                                                               | Purpose                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx`      | **Main PO modal** (active, used in production)                                 |
| `app/src/pages/purchaseOrderFunctions/purchaseOrderOperations.tsx` | Save/validation logic for PO                                                   |
| `app/src/pages/purchaseorder.tsx`                                  | Parent page that renders the PO modal                                          |
| `app/src/pages/purchaseOrderFunctions/purchaseorder_column.tsx`    | Column definitions for PO DataGrid                                             |
| `app/src/components/purchaseOrder/PurchaseOrderModal.tsx`          | **Alternate/older PO modal** (component-based, possibly unused)                |
| `app/src/components/purchaseOrder/PurchaseOrderItems.tsx`          | **Alternate/older item list component** (possibly unused)                      |
| `app/src/components/PurchaseOrderOverview.tsx`                     | PO overview drawer component                                                   |
| `app/src/types/purchaseOrder.ts`                                   | TypeScript types for PO items                                                  |
| `app/src/utils/constants.ts`                                       | Category constants & initial item template                                     |
| `api/resolvers/purchaseorder.resolver.js`                          | Backend resolver (handles `currentInput` → `actualQuantityReceived` increment) |

---

## 1. How the PO Modal Works

### Active Modal: `purchaseordermodel.tsx` (Lines 1–980)

- Opened from `purchaseorder.tsx` (line 561) via `<PurchaseOrderModal>`.
- Props: `open`, `handleClose`, `purchaseOrder` (null = Add mode, object = Edit mode), `handleSave`, `isSubmitting`.
- Two modes:
  - **Add mode** (`purchaseOrder === null`): Shows full form (PO#, supplier, address, dates, TIN, telephone, email, etc.). All fields editable.
  - **Edit mode** (`purchaseOrder !== null`): Hides most header fields (supplier, address, etc.). Only shows items, delivery date, Invoice (not shown in edit mode currently). Title says "Update Received Item or Invoice".

### State Structure (Lines 62–82, reset in useEffect Lines 96–171)

```typescript
formData = {
  poNumber, supplier, address, email, telephone, tin, campus,
  placeOfDelivery, deliveryTerms, paymentTerms,
  dateOfConformity (Dayjs), dateOfDelivery (Dayjs), dateOfPayment (Dayjs),
  modeOfProcurement, items[], amount, status, invoice, fundsource
}
```

### Item Mapping on Edit (Lines 106–122)

Each item is mapped from DB to include:

```typescript
{
  category, itemName, description, specification, generalDescription,
  unit, quantity, unitCost, amount, actualQuantityReceived,
  tag, inventoryNumber,
  recievelimit: quantity - actualQuantityReceived,  // computed
  currentInput: 0,   // user's "this batch" input
  id
}
```

---

## 2. How Items Are Rendered in the Modal

### Item Row Layout (Lines 580–960)

The active modal renders items with these columns (horizontal scroll, min-width 980px):

| Column                                 | Flex | Shown          |
| -------------------------------------- | ---- | -------------- |
| Item #                                 | 4%   | Always         |
| Stock # (inventoryNumber)              | 7%   | Always         |
| Description                            | 14%  | Always         |
| Specs (specification)                  | 18%  | Always         |
| Gen. Desc                              | 18%  | Always         |
| Qty (quantity)                         | 8%   | Always         |
| **Delivered** (actualQuantityReceived) | 8%   | Edit mode only |
| **Received** (currentInput)            | 8%   | Edit mode only |
| **Balance** (computed)                 | 8%   | Edit mode only |
| Unit                                   | 7%   | Always         |
| Unit Cost                              | 9%   | Always         |
| Total Cost (amount)                    | 9%   | Always         |
| Delete button                          | 5%   | Always         |

**Category/Tag columns are NOT shown** — removed with comment "Category/Tag removed from this modal — set in Generate IAR step only" (line 685).

---

## 3. Number Fields and NaN Handling

### Quantity Field (Lines 789–803)

```tsx
<TextField
  type="number"
  value={item.quantity ?? 0}
  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
  disabled={Number(item.actualQuantityReceived ?? 0) > 0 || status === 'completed'}
  inputProps={{ style: { textAlign: 'right' } }}
/>
```

**NaN issue**: `Number('')` returns `0`, but `Number` on other edge-case inputs can produce `NaN`. No explicit NaN guard.

### Unit Cost Field (Lines 907–928)

```tsx
<TextField
  type="number"
  value={item.unitCost ?? 0}
  onChange={(e) => updateItem(index, 'unitCost', Number(e.target.value))}
/>
```

**NaN issue**: Same pattern — `Number(e.target.value)` with no NaN guard.

### Balance Field (Lines 870–884) — Read-Only

```tsx
value={Math.max(0, Number(item.quantity) - Number(item.actualQuantityReceived))}
```

**NaN issue**: If `item.quantity` or `item.actualQuantityReceived` is `undefined`/`null`/`NaN`, `Number(undefined)` → `NaN`, and `Math.max(0, NaN)` → `NaN`. This would display "NaN" in the balance field.

### Amount Computation in `updateItem` (Lines 271–274)

```tsx
if (field === 'quantity' || field === 'unitCost') {
  updatedItems[index].amount =
    Number(updatedItems[index].quantity) * Number(updatedItems[index].unitCost);
}
```

**NaN issue**: If either value is NaN, amount becomes NaN.

### Delivered Field (Lines 805–815) — Read-Only

```tsx
value={item.actualQuantityReceived ?? ''}
```

Uses `??` with fallback to empty string. No NaN risk here (just displays raw value).

### currentInput (Received) Field (Lines 818–870) — Has NaN Guard

```tsx
onChange={(e) => {
  const raw = e.target.value;
  const remaining = Math.max(0, Number(item.quantity ?? 0) - Number(item.actualQuantityReceived ?? 0));
  if (raw === '') { updateItem(index, 'currentInput', ''); return; }
  const numeric = Number(raw);
  if (Number.isNaN(numeric)) { return; }  // ← Only field with NaN guard
  const clamped = Math.min(Math.max(0, numeric), remaining);
  updateItem(index, 'currentInput', clamped);
}}
```

**This is the ONLY number field with explicit NaN handling** (line 837). Also clamps to [0, remaining].

### Summary of NaN Handling

| Field        | Type               | NaN Guard                 | Risk                                         |
| ------------ | ------------------ | ------------------------- | -------------------------------------------- |
| quantity     | `type="number"`    | ❌ None                   | `Number('')` → 0, but edge cases produce NaN |
| unitCost     | `type="number"`    | ❌ None                   | Same                                         |
| amount       | computed           | ❌ None                   | NaN if qty or unitCost is NaN                |
| balance      | computed read-only | ❌ None                   | `Math.max(0, NaN)` → displays "NaN"          |
| currentInput | `type="number"`    | ✅ `Number.isNaN()` check | Safe                                         |
| delivered    | read-only          | N/A                       | N/A                                          |

---

## 4. Category Validation

### In the Active Modal (purchaseordermodel.tsx)

**Category is NOT displayed anywhere in the main PO modal.** It was removed (line 685 comment: "Category/Tag removed from this modal — set in Generate IAR step only").

However, the data still carries `category` and `tag` fields (mapped at lines 107, 117). They are just not editable from this modal.

### In purchaseOrderOperations.tsx (Lines 38–57)

Category validation runs on save:

```typescript
// Category & tag validation only applies when editing existing (non-temp) items
if (editingPO && item.id && item.id !== 'temp') {
  const categoryIsValid = item.category && item.category.trim() !== '';
  if (!categoryIsValid) {
    return { success: false, message: `Item ${index + 1} must have a category selected.` };
  }
  if (item.category === 'inventory custodian slip') {
    if (item.tag === '' || !item.tag) {
      return { success: false, message: `Item ${index + 1} must have a tag selected.` };
    }
  }
}
```

**CRITICAL PROBLEM**: When editing an existing PO, the validation REQUIRES a category for each non-temp item. But the PO modal does NOT show a category selector! This means:

- If an existing item has no category set (e.g., it was added before categories were required), the user CANNOT save the PO because they have no way to set the category from this modal.
- The error message tells them to select a category, but there's no UI to do so.

### In the Alternate Modal (PurchaseOrderModal.tsx, Lines 395–415)

The alternate modal DOES show a category dropdown:

```tsx
<Select value={item.category} onChange={(e) => updateItem(index, 'category', e.target.value)}>
  <MenuItem value={'property acknowledgement reciept'}>PAR</MenuItem>
  <MenuItem value={'inventory custodian slip'}>ICS</MenuItem>
  <MenuItem value={'requisition issue slip'}>RIS</MenuItem>
</Select>
```

But this alternate modal does NOT appear to be the one used in production.

### Constants (constants.ts)

```typescript
export const PURCHASE_ORDER_CATEGORIES = {
  PAR: 'property acknowledgement reciept',
  ICS: 'inventory custodian slip',
  RIS: 'requisition issue slip',
};
```

---

## 5. "Received" Quantity Input UX

### Active Modal (purchaseordermodel.tsx) — Two-Field System

The active modal uses a **split approach**:

1. **"Delivered" column** (read-only): Shows `item.actualQuantityReceived` — total received so far from DB.
2. **"Received" column** (editable input): Shows `item.currentInput` — the amount to receive THIS session/batch.
3. **"Balance" column** (read-only): Shows `quantity - actualQuantityReceived`.

**How it works:**

- When editing, `actualQuantityReceived` is loaded from DB (line 113).
- User enters a value in `currentInput` (the "Received" column).
- `currentInput` is clamped to `[0, remaining]` where `remaining = quantity - actualQuantityReceived`.
- On submit (line 284), `actualQuantityReceived` is DELETED from items (`delete item.actualQuantityReceived`, line 290). The `currentInput` field is sent to the backend.
- **Backend** (resolver line 511-512): `const receivedQty = item.currentInput && Number(item.currentInput) > 0 ? Number(item.currentInput) : 0;` — it increments `actualQuantityReceived` by `currentInput`.

**Disabled logic** (line 853-858): The Received input is disabled when:

- `quantity - actualQuantityReceived <= 0` (nothing left to receive)
- Shows placeholder "Fully received" when balance ≤ 0

### Alternate Modal (PurchaseOrderModal.tsx) — Direct Input

The alternate modal uses a DIFFERENT approach:

- On edit, `actualQuantityReceived` is reset to 0 (line 102):
  ```typescript
  actualQuantityReceived: purchaseOrder.status === 'completed' ? Number(item.actualQuantityReceived || 0) : 0,
  ```
- Stores `originalActualQuantityReceived` for computing remaining balance.
- User directly types into `actualQuantityReceived` field (this represents "this session" received).
- Value is clamped to `[0, quantity - originalActualQuantityReceived]`.
- Auto-sets status to 'completed' when all items fully received.

---

## 6. Key Observations / Issues

### Issue A: NaN in Number Fields

- `quantity`, `unitCost`, and computed `amount`/`balance` fields have NO NaN protection.
- Only `currentInput` (Received) has `Number.isNaN()` guard.
- Risk: Clearing a number field could show "NaN" in balance/amount.

### Issue B: Category Validation vs. UI Mismatch

- `purchaseOrderOperations.tsx` requires category for existing items when editing.
- The main modal does NOT show a category selector.
- Users get a validation error they cannot resolve from the modal.

### Issue C: Two Competing Modals

- `app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx` — **ACTIVE** (imported in purchaseorder.tsx line 35)
- `app/src/components/purchaseOrder/PurchaseOrderModal.tsx` — **ALTERNATE** (not imported in main page)
- They have different field sets, different received-input UX, different date handling (Dayjs vs Date).

### Issue D: Submitted Data Shape

In the active modal's `onSubmit` (lines 284-310):

- `actualQuantityReceived` is DELETED from items before sending.
- `recievelimit` is DELETED.
- `currentInput` remains and is sent to backend for incremental receiving.
- `status` is stripped from the top-level form data.

### Issue E: Balance NaN Risk

Line 878: `Number(item.quantity) - Number(item.actualQuantityReceived)` — if either is undefined/null/non-numeric string, this produces NaN.
