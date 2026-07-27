# IAR Complete/Partial Status Bug — Research & Spec

## Summary

When generating an IAR for a Purchase Order with multiple line items, the `iarStatus` is set **per-item** (based on whether each individual item is fully received). This means if a user generates an IAR and fully receives 3 out of 5 PO items, those 3 IAR rows get `iarStatus = 'complete'`. The print/preview template then checks "Complete" because all items **in that IAR batch** are complete — even though the PO still has 2 unreceived items.

**Expected behavior**: The IAR should show "Partial" unless **ALL items on the entire PO** are fully received.

---

## Files Involved

| File                                                                           | Role                                                                                             |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `api/resolvers/inspectionacceptancereport.resolver.js`                         | Backend — `generateIARFromPO` mutation (lines 461–607) and `appendToExistingIAR` (lines 340–454) |
| `api/models/inspectionacceptancereport.js`                                     | Model — defines `iarStatus` ENUM: `'partial' \| 'complete' \| 'none'` (line 51)                  |
| `api/typeDefs/inspectionacceptancereport.typeDef.js`                           | GraphQL schema — `iarStatus` field on `ItemWithPurchaseOrder` type                               |
| `app/src/components/GenerateIarModal.tsx`                                      | Frontend — IAR generation dialog (no status logic here — status is backend-determined)           |
| `app/src/pages/inventory.tsx`                                                  | Frontend — calls `generateIARFromPOMutation` (lines 1002–1055)                                   |
| `app/src/components/previewDocumentFiles/InspectionAcceptanceReportForIAR.tsx` | Preview — checkbox display logic (lines 524–560)                                                 |
| `app/src/components/printDocumentFiles/inspectionAcceptanceRerportForIAR.tsx`  | Print — checkbox display logic (lines 103–106, 404–414)                                          |

---

## Root Cause Analysis

### Backend: `generateIARFromPO` (the main bug)

**File**: `api/resolvers/inspectionacceptancereport.resolver.js`  
**Lines 519–556** (inside the `for` loop):

```js
// Line 519-522: Determine delivery status PER ITEM
let deliveryStatus = 'partial';
if (afterAqr >= Number(poi.quantity || 0)) {
  deliveryStatus = 'delivered';
}

// ... (lines 535-556: create IAR record) ...

// Line 556: Set iarStatus based on THIS ITEM ONLY
iarStatus: deliveryStatus === 'delivered' ? 'complete' : 'partial',
```

**Problem**: The `iarStatus` is determined inside the loop, checking only whether **that specific PO item** (`poi`) is fully received (`afterAqr >= quantity`). It does NOT check whether all OTHER items on the PO are also fully received.

**Scenario that triggers the bug**:

1. PO has items A (qty 10), B (qty 5), C (qty 3)
2. User generates IAR, selects only items A and B, receives A×10 and B×5 (fully)
3. Backend sets `iarStatus = 'complete'` for both A and B rows (because each is individually fully received)
4. Item C is never even included in the IAR — it has 0 received
5. Print/Preview shows the "Complete ✓" checkbox because all items **in the IAR batch** are 'complete'
6. But the PO is NOT complete — item C hasn't been received at all

### Backend: `appendToExistingIAR` (same pattern)

**File**: `api/resolvers/inspectionacceptancereport.resolver.js`  
**Lines 376-377** (inside the append loop):

```js
// Line 376-377: Same per-item logic
const appendIarStatus = afterAqr >= Number(poi.quantity || 0) ? 'complete' : 'partial';
```

Same bug — checks only the individual item, not the overall PO status.

### Frontend: Display Logic (NOT buggy — but surface area of the symptom)

**Preview** (`InspectionAcceptanceReportForIAR.tsx`, lines 524-560):

```tsx
// Line 524: Checks if ALL items in the IAR batch are 'complete'
backgroundColor: items.every((i) => i.iarStatus === 'complete') ? '#ccc' : 'transparent',
// Line 534
{items.every((i) => i.iarStatus === 'complete') ? '✓' : ''}

// Line 550: Checks if ANY item in the IAR batch is 'partial'
backgroundColor: items.some((i) => i.iarStatus === 'partial') ? '#ccc' : 'transparent',
// Line 560
{items.some((i) => i.iarStatus === 'partial') ? '✓' : ''}
```

**Print** (`inspectionAcceptanceRerportForIAR.tsx`, lines 103-104):

```js
const overallComplete = items.length && items.every((i) => i.iarStatus === 'complete');
const overallPartial = items.some((i) => i.iarStatus === 'partial');
```

The frontend display logic is **logically correct** in how it interprets the data — it checks `.every()` for complete and `.some()` for partial. The problem is that the **backend is setting incorrect values** for `iarStatus` in the first place.

### Frontend: `GenerateIarModal.tsx` (NO status logic)

The modal only sends `purchaseOrderItemId`, `category`, `tag`, and `received` to the backend. It does **not** set or determine `iarStatus` — that's entirely backend.

---

## Required Fix

### Fix Location: `api/resolvers/inspectionacceptancereport.resolver.js`

#### Fix 1: `generateIARFromPO` mutation (lines ~460-607)

**After the `for` loop completes and before `await t.commit()`**, add a post-processing step:

1. Fetch ALL items for this PO (not just the ones in this IAR batch)
2. Check if every PO item's `actualQuantityReceived >= quantity`
3. If ALL are fully received → set `iarStatus = 'complete'` for all IAR rows in this batch
4. If ANY item is not fully received → set `iarStatus = 'partial'` for all IAR rows in this batch

**Approximate location**: After line ~600 (after the `for` loop), before `await t.commit()` on line ~602.

**Pseudocode**:

```js
// After the for loop, before t.commit():

// Fetch ALL PO items (not just the ones in this IAR) to determine overall status
const allPoItems = await PurchaseOrderItems.findAll({
  where: { purchaseOrderId: parseInt(purchaseOrderId), isDeleted: false },
  transaction: t,
});

const allFullyReceived = allPoItems.every(
  (item) => Number(item.actualQuantityReceived || 0) >= Number(item.quantity || 0)
);

const overallIarStatus = allFullyReceived ? 'complete' : 'partial';

// Update all IAR rows in this batch to the correct overall status
await inspectionAcceptanceReport.update(
  { iarStatus: overallIarStatus },
  {
    where: { iarId: autoIarId },
    transaction: t,
  }
);
```

#### Fix 2: `appendToExistingIAR` mutation (lines ~340-454)

Same pattern — after the append loop, check all PO items for overall completion:

**Approximate location**: After line ~445 (after the `for` loop), before `await t.commit()` on line ~447.

**Pseudocode**:

```js
// Need to determine the purchaseOrderId from the existing IAR or the first appended item
// Then do the same check as Fix 1:

if (appended > 0 && existingIar) {
  const allPoItems = await PurchaseOrderItems.findAll({
    where: { purchaseOrderId: existingIar.purchaseOrderId, isDeleted: false },
    transaction: t,
  });

  const allFullyReceived = allPoItems.every(
    (item) => Number(item.actualQuantityReceived || 0) >= Number(item.quantity || 0)
  );

  const overallIarStatus = allFullyReceived ? 'complete' : 'partial';

  // Update ALL IAR rows sharing this iarId
  await inspectionAcceptanceReport.update(
    { iarStatus: overallIarStatus },
    {
      where: { iarId },
      transaction: t,
    }
  );
}
```

### No Frontend Changes Required

The frontend preview and print components already use correct logic:

- `items.every(i => i.iarStatus === 'complete')` for the "Complete" checkbox
- `items.some(i => i.iarStatus === 'partial')` for the "Partial" checkbox

Once the backend correctly sets `iarStatus`, the frontend will display correctly.

---

## Edge Cases to Consider

1. **User generates IAR for only a subset of PO items**: Even if all selected items are fully received, the IAR should show "Partial" if other PO items remain unreceived.

2. **User generates multiple IARs over time**: When the final IAR is generated and all items are now fully received, ONLY the new IAR batch should get 'complete'. Previous IARs should retain their 'partial' status (they were partial at the time of generation).

3. **Append to existing IAR**: If appending items to an existing IAR causes ALL PO items to be fully received, the entire IAR batch (all rows with that `iarId`) should be updated to 'complete'.

4. **Zero-quantity items**: Items with `quantity = 0` should be treated as "fully received" (0 received of 0 required = complete).

---

## Data Flow Summary

```
User selects PO → Opens GenerateIarModal
  → User picks items, sets received qty, category, tag
  → Clicks "Generate IAR"
  → Frontend calls generateIARFromPO mutation
  → Backend loops through selected items:
      → Updates PO item's actualQuantityReceived
      → Creates IAR row with iarStatus (BUG: per-item check)
  → Returns success + iarId
  → Frontend refetches IAR list
  → User clicks print/preview
  → Frontend groups items by iarId
  → Checks iarStatus values to determine Complete vs Partial checkbox
```

**The fix intercepts at the backend level**, after the loop, to correct the `iarStatus` based on the FULL PO status — not just individual items.
