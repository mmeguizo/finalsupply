# IAR Duplicate Bug Analysis

## Summary

When a user generates an IAR and then creates an issuance (PAR/ICS/RIS assignment), **duplicate rows appear in the Inventory (Generate IAR) view** because the issuance mutations **clone records into the same `inspection_acceptance_report` table** with the same `iar_id`, and the main query has **no filter to distinguish originals from clones**.

---

## 1. How IAR Generation Creates Records

**File:** `api/resolvers/inspectionacceptancereport.resolver.js` — `generateIARFromPO` mutation (line 486)

### Flow:

1. User selects a PO and items to receive
2. A single `iarId` is generated for the batch via `generateNewIarId(campus)`
3. For each item line, one record is created in `inspection_acceptance_report`:

```js
// Line ~572
const iarRow = await inspectionAcceptanceReport.create({
  itemName: poi.itemName,
  description: poi.description,
  iarId: autoIarId,                    // Shared batch IAR ID
  purchaseOrderId: purchaseOrderId,
  purchaseOrderItemId: poi.id,
  actualQuantityReceived: delta,       // The quantity received
  category: category,                  // 'property acknowledgement reciept' | 'inventory custodian slip' | 'requisition issue slip'
  tag: tag,                            // 'low' | 'high' | 'none'
  parId: '',                           // Empty — no issuance yet
  icsId: '',
  risId: '',
  iarStatus: 'complete' or 'partial',
  // ...other fields...
}, { transaction: t });
```

4. The PO item's `actualQuantityReceived` and `deliveryStatus` are also updated

**Key point:** Original IAR records have `parId=''`, `icsId=''`, `risId=''` and `actualQuantityReceived` = the received delta.

---

## 2. How Issuance Assignment Creates DUPLICATE Records

### 2a. PAR Assignment — `createSinglePARAssignment` (line 402)

**File:** `api/resolvers/propertyacknowledgementrepoert.resolver.js`

```js
// 1. Fetch the source IAR record
const sourceItem = await inspectionAcceptanceReportResolver.findByPk(sourceItemId);

// 2. CLONE it into a NEW record in the SAME table
const newItem = await inspectionAcceptanceReportResolver.create({
  iarId: sourceData.iarId, // ⚠️ SAME iar_id as original!
  purchaseOrderId: sourceData.purchaseOrderId,
  purchaseOrderItemId: sourceData.purchaseOrderItemId,
  actualQuantityReceived: quantity, // The assigned quantity
  parId: newParId, // Has a PAR ID
  // ...copies all other fields from source...
});

// 3. REDUCE the source's actualQuantityReceived
const newSourceQty = currentReceived - quantity;
await sourceItem.update({ actualQuantityReceived: newSourceQty });
```

### 2b. `createMultiItemPARAssignment` (line 515) — Same pattern, shared PAR ID

### 2c. `splitAndAssignPAR` (line ~300) — Same pattern, plus sets `splitGroupId`/`splitFromItemId`

### 2d. RIS Assignment — `createSingleRISAssignment`, `createMultiItemRISAssignment`, `splitAndAssignRIS`

**File:** `api/resolvers/requisitionissueslip.resolver.js` — Identical clone pattern.

### 2e. ICS Assignment — `createMultiItemICSAssignment` (line 1125)

**File:** `api/resolvers/inspectionacceptancereport.resolver.js` — Same pattern.

---

## 3. The Exact Bug: What Happens in the Database

**Example from user's screenshot:**

| ID  | iar_id        | actual_quantity | par_id  | is_deleted | Record Type                 |
| --- | ------------- | --------------- | ------- | ---------- | --------------------------- |
| 567 | 041626-001-TI | 0               | (empty) | 0          | Original (qty reduced to 0) |
| 568 | 041626-001-TI | 1               | 26-001  | 0          | Clone (PAR assignment)      |

**What happened:**

1. User generated IAR → created ID 567 with `actualQuantityReceived=1`, `parId=''`
2. User assigned PAR → created ID 568 (clone) with `actualQuantityReceived=1`, `parId='26-001'`
3. Source ID 567 was updated to `actualQuantityReceived=0`
4. **Both records have `is_deleted=0` and the same `iar_id`**

---

## 4. The Query That Populates the Inventory (Generate IAR) View

### Backend Resolver (line 15):

```js
// api/resolvers/inspectionacceptancereport.resolver.js
inspectionAcceptanceReport: async (_, __, context) => {
  const rows = await inspectionAcceptanceReport.findAll({
    where: { isDeleted: false }, // ⚠️ NO FILTER for record type!
    order: [['id', 'DESC']],
    include: [
      { model: PurchaseOrder, required: true },
      { model: PurchaseOrderItems, as: 'PurchaseOrderItem', required: false },
    ],
  });
  return rows;
};
```

**Problem:** `where: { isDeleted: false }` is the ONLY filter. It returns ALL records — originals AND clones.

### Frontend (inventory.tsx, line 1157):

```tsx
const groups = data.inspectionAcceptanceReport.reduce((acc, item) => {
  const iarId = item.iarId;
  if (!acc[iarId]) acc[iarId] = [];
  acc[iarId].push(item); // Both original AND clone end up in same group
  return acc;
}, {});
```

**Result:** The grouped IAR row shows 2 items instead of 1 — the original (qty=0) AND the clone (qty=1).

### GraphQL Query (inspectionacceptancereport.query.ts):

```graphql
query GetAllInspectionAcceptanceReport {
  inspectionAcceptanceReport {
    id, iarId, parId, icsId, risId, actualQuantityReceived, ...
  }
}
```

---

## 5. Fields That Could Distinguish IAR Originals from Issuance Clones

| Field                    | Original IAR Record                | Issuance Clone                             |
| ------------------------ | ---------------------------------- | ------------------------------------------ |
| `parId`                  | `''` (empty)                       | Has a value (e.g., `'26-001'`)             |
| `icsId`                  | `''` (empty)                       | Has a value                                |
| `risId`                  | `''` (empty)                       | Has a value                                |
| `splitFromItemId`        | `null`                             | Set (only for `splitAndAssign*` mutations) |
| `splitGroupId`           | `null`                             | Set (only for `splitAndAssign*` mutations) |
| `actualQuantityReceived` | `0` (if fully assigned) or partial | The assigned quantity                      |

**Important caveat:** The `updatePARInventoryIDs` and `assignPARWithSignatories` mutations UPDATE the `parId` on existing original records (without cloning). So `parId` being non-empty doesn't always mean it's a clone.

However, the **single/multi-item assignment** mutations (`createSinglePARAssignment`, `createMultiItemPARAssignment`, etc.) are the ones that CREATE clones AND reduce the source's `actualQuantityReceived`.

---

## 6. Recommended Fix Approaches

### Option A: Add a `recordType` column (BEST — clean, explicit)

**Migration:** Add `record_type ENUM('iar_original', 'issuance_clone') DEFAULT 'iar_original'`

**Changes:**

1. In `generateIARFromPO`: set `recordType: 'iar_original'` (default, no change needed)
2. In all `createSingle*Assignment` / `createMultiItem*Assignment` / `splitAndAssign*` mutations: set `recordType: 'issuance_clone'`
3. In `inspectionAcceptanceReport` query: add `where: { recordType: 'iar_original' }` (or exclude `'issuance_clone'`)

**Pros:** Explicit, no ambiguity, backward compatible (existing records default to `'iar_original'`)
**Cons:** Requires a migration + updating every clone mutation

### Option B: Filter by `splitFromItemId` + issuance ID presence (QUICK — no migration)

**Changes to the `inspectionAcceptanceReport` query resolver:**

```js
const rows = await inspectionAcceptanceReport.findAll({
  where: {
    isDeleted: false,
    // Exclude records that are issuance clones:
    // They have a splitFromItemId OR were created by assignment
    // (have parId/icsId/risId set AND actualQuantityReceived was set by clone)
    [Op.or]: [
      // Original records with no split tracking
      { splitFromItemId: null },
      // Include originals that were split (splitIndex = 1 means it's the original updated)
      // Actually this gets complicated...
    ],
  },
  // ...
});
```

**Problem:** This is fragile. `createSinglePARAssignment` and `createMultiItemPARAssignment` do NOT set `splitFromItemId`, so we can't use that field alone.

### Option C: Filter out zero-quantity originals (QUICK FIX — partial)

In the query, filter out records where `actualQuantityReceived = 0`:

```js
where: {
  isDeleted: false,
  actualQuantityReceived: { [Op.gt]: 0 },
}
```

**Problem:** This hides legitimate partial-receive records that happen to have 0 remaining. And the clones (qty > 0) still show up.

### Option D: Hybrid — check if parId/icsId/risId is non-empty + splitFromItemId (MEDIUM)

Filter the query to exclude records that are clearly issuance clones:

```js
where: {
  isDeleted: false,
  // Exclude records where splitFromItemId is set (split clones)
  // AND exclude records created by single/multi assignment
  // by checking if they have an issuance ID but were NOT the original
  [Op.not]: [
    // Records with splitFromItemId set AND splitIndex > 1 are definitely clones
    {
      splitFromItemId: { [Op.ne]: null },
      splitIndex: { [Op.gt]: 1 },
    }
  ]
}
```

**Problem:** Still doesn't catch `createSinglePARAssignment` clones which don't set `splitFromItemId`.

---

## 7. RECOMMENDED: Option A (Add `recordType` column)

This is the cleanest fix because:

1. **Explicit** — no guessing based on field combinations
2. **Backward compatible** — default `'iar_original'` means existing data works immediately
3. **Future-proof** — any new mutation just needs to set the right type
4. **One-line query filter** — `where: { recordType: 'iar_original' }`

### Implementation Steps:

1. **Create migration**: `20260416000100-add_record_type_to_inspection_acceptance_reports.js`
   - Add `record_type ENUM('iar_original', 'issuance_clone') DEFAULT 'iar_original' NOT NULL`

2. **Update model**: `api/models/inspectionacceptancereport.js`
   - Add `recordType` field

3. **Update IAR resolver query** (line ~27): Add `recordType: 'iar_original'` to the `where` clause

4. **Update all clone mutations** (6 mutations across 3 files):
   - `createSinglePARAssignment` → add `recordType: 'issuance_clone'`
   - `createMultiItemPARAssignment` → add `recordType: 'issuance_clone'`
   - `splitAndAssignPAR` (clone portion) → add `recordType: 'issuance_clone'`
   - `createSingleRISAssignment` → add `recordType: 'issuance_clone'`
   - `createMultiItemRISAssignment` → add `recordType: 'issuance_clone'`
   - `splitAndAssignRIS` (clone portion) → add `recordType: 'issuance_clone'`
   - `createMultiItemICSAssignment` → add `recordType: 'issuance_clone'`

5. **Backfill existing data** (in migration):

   ```sql
   -- Records with splitFromItemId AND splitIndex > 1 are clones from split mutations
   UPDATE inspection_acceptance_reports
   SET record_type = 'issuance_clone'
   WHERE split_from_item_id IS NOT NULL AND split_index > 1;

   -- Records created by single/multi assignment don't have splitFromItemId
   -- but they DO have an issuance ID and were created AFTER the original
   -- These need manual identification or a more complex backfill query
   ```

6. **Run migration script**

---

## 8. Files Involved

| File                                                          | Role                                          |
| ------------------------------------------------------------- | --------------------------------------------- |
| `api/models/inspectionacceptancereport.js`                    | Model — needs `recordType` field              |
| `api/resolvers/inspectionacceptancereport.resolver.js`        | IAR query (line 15) + ICS clone (line 1125)   |
| `api/resolvers/propertyacknowledgementrepoert.resolver.js`    | PAR clone mutations                           |
| `api/resolvers/requisitionissueslip.resolver.js`              | RIS clone mutations                           |
| `app/src/pages/inventory.tsx`                                 | Frontend — displays IAR inventory (line 912+) |
| `app/src/graphql/queries/inspectionacceptancereport.query.ts` | GraphQL query definition                      |
