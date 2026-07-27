# No-Category Feature — Comprehensive Specification

## Table of Contents

1. [Current Category System](#1-current-category-system)
2. [Blockers for No-Category IAR Generation](#2-blockers-for-no-category-iar-generation)
3. [Inventory Page Structure](#3-inventory-page-structure)
4. [Navigation & Routing](#4-navigation--routing)
5. [ID Generation Patterns](#5-id-generation-patterns)
6. [Issuance Assignment Flow](#6-issuance-assignment-flow)
7. [Print Templates](#7-print-templates)
8. [All Files That Need Changes](#8-all-files-that-need-changes)
9. [Phased Implementation Plan](#9-phased-implementation-plan)

---

## 1. Current Category System

### PO Items Model (`api/models/purchaseorderitems.js`)

```js
category: {
  type: DataTypes.ENUM(
    'property acknowledgement reciept',
    'inventory custodian slip',
    'requisition issue slip'
  ),
  allowNull: true,
  defaultValue: null,  // Changed via migration 20260610000100
}
```

**Key facts:**

- Category is a **MySQL ENUM** with exactly 3 values (PAR, ICS, RIS)
- `allowNull: true` — items CAN have null category
- `defaultValue: null` — new items start with no category (this was recently changed from 'requisition issue slip')
- Category is SET during IAR generation, not at PO creation time

### IAR Model (`api/models/inspectionacceptancereport.js`)

```js
category: {
  type: DataTypes.ENUM(
    'property acknowledgement reciept',
    'inventory custodian slip',
    'requisition issue slip'
  ),
  allowNull: true,
  defaultValue: 'requisition issue slip',  // ⚠️ Still has a default
}
```

**Key difference:** The IAR model still has `defaultValue: 'requisition issue slip'`. This means even if we allow no-category items, the IAR record creation will default to RIS. This needs to change.

### How Category Gets Used

| System       | Filter                                            | File                                                          |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------- |
| PAR Issuance | `category: 'property acknowledgement reciept'`    | `api/resolvers/propertyacknowledgementrepoert.resolver.js:42` |
| RIS Issuance | `category: 'requisition issue slip'`              | `api/resolvers/requisitionissueslip.resolver.js:39`           |
| ICS Issuance | `tag: ['high', 'low']` (uses tag, NOT category)   | `api/resolvers/inspectionacceptancereport.resolver.js:80`     |
| IAR List     | `recordType: 'iar_original'` (no category filter) | `api/resolvers/inspectionacceptancereport.resolver.js:31`     |

---

## 2. Blockers for No-Category IAR Generation

### Blocker 1: Frontend Category Validation (`GenerateIarModal.tsx:175-183`)

```typescript
// ⛔ THIS IS THE PRIMARY BLOCKER
for (const item of selectedItems) {
  if (!item.category) {
    setError(`Item "${item.description || 'N/A'}" must have a category (PAR/ICS/RIS) selected.`);
    return;
  }
  // ...
}
```

The `handleSubmit` function in `GenerateIarModal.tsx` **requires** every selected item to have a non-empty category. No-category items will be rejected with an error message.

### Blocker 2: Backend Fallback to RIS (`inspectionacceptancereport.resolver.js:550`)

```js
category: category || poi.category || 'requisition issue slip',
```

In the `generateIARFromPO` mutation, if `category` is falsy, it falls back to `'requisition issue slip'`. No-category items would silently become RIS items.

### Blocker 3: ENUM Doesn't Include "No Category" Value

The MySQL ENUM only has 3 values. Storing `null` is allowed (the column is nullable), but we need to ensure the system handles `null` correctly throughout the pipeline — queries, filters, display, and print.

### Blocker 4: No Issuance Path for No-Category Items

After IAR generation, items go to PAR/ICS/RIS issuance pages. No-category items have **no issuance page** to land on. They'd be invisible in the system.

---

## 3. Inventory Page Structure

### File: `app/src/pages/inventory.tsx`

The inventory page is a **flat table** (not tabbed). It shows all IAR records grouped by `iarId`.

**Key UI Elements:**

- Collapsible rows grouped by IAR ID
- Each row shows: PO#, IAR ID, Date, Category chip, Invoice, Invoice Date, Income, MDS, Details, PO Remarks
- Category displayed as a colored Chip (PAR=primary, ICS=secondary, RIS=success, else=default)
- "Generate IAR" happens via a modal (`GenerateIarModal`) opened from the PO Monitoring page

**How category is displayed (`inventory.tsx:288-300`):**

```typescript
const displayCategory = React.useMemo(() => {
  if (!row.category) return 'None';
  return formatCategory(row.category) || 'None';
}, [row.category]);
```

Items with null/no category already display as "None" with default chip color. ✅ This is already handled.

---

## 4. Navigation & Routing

### Sidebar (`app/src/navigation/routes.ts`)

```
Main items
├── Dashboard
├── PO Monitoring           → /purchaseorder
├── Generate IAR            → /inventory
├── Issuance
│   ├── Issuance PAR        → /issuance/issuance-par
│   ├── Issuance RIS        → /issuance/issuance-ris
│   └── Issuance ICS        → /issuance/issuance-ics
├── Signatories
├── Department
├── Users
│   ├── Users
│   └── Roles
└── Histories
```

### Router (`app/src/router/routes.tsx`)

The issuance section uses nested routes:

```
/issuance → redirects to /issuance/issuance-par
/issuance/issuance-par → IssuanceParPage
/issuance/issuance-ris → IssuanceRisPage
/issuance/issuance-ics → IssuanceIcsPage
```

**To add a no-category tab:** Add a new child route under `/issuance`:

```
/issuance/issuance-nocat → IssuanceNoCategoryPage (new)
```

---

## 5. ID Generation Patterns

### IAR ID (`api/utils/iarIdGenerator.js`)

- **Format:** `MMDDYY-XXX-CC` (e.g., `041626-001-T`)
- MM=month, DD=day, YY=year, XXX=annual sequence, CC=campus code
- Uses database query to find the max sequence for the current year
- **No-category items can use the same IAR ID system** — no changes needed

### ICS ID (`api/utils/icsIdGenerator.js`)

- **Format:** `PREFIX-YYYY-MM-NNNN` (e.g., `SPHV-2026-04-0001`)
- PREFIX: SPHV (high value) or SPLV (low value)
- Annual sequence per tag type
- Has batch tracking to avoid duplicates within a single request

### PAR ID (`api/resolvers/propertyacknowledgementrepoert.resolver.js`)

- Uses `generateNewParId()` from `api/utils/parIdGenerator.js`
- Format: `YY-NNNN` (e.g., `26-0001`)

### RIS ID (`api/resolvers/requisitionissueslip.resolver.js`)

- Uses `generateNewRisId()` from `api/utils/risIdGenerator.js`

### No-Category ID Strategy

For no-category issuance, we need a new ID. Options:

1. **Random nanoid** (user's suggestion) — simplest, e.g., `NC-XXXXXXXX`
2. **Sequential like PAR** — `NC-YYYY-NNNN`
3. **Re-use IAR ID** — just reference the IAR ID directly

**Recommendation:** Use `NC-YYYY-MM-NNNN` format, following the ICS pattern for consistency. Create a `noCategoryIdGenerator.js` utility.

---

## 6. Issuance Assignment Flow

### How PAR/ICS/RIS Issuance Works

1. **Query fetches IAR records** filtered by category/tag
2. **Records are grouped** by PO number in the UI
3. **User opens an Assignment Modal** (e.g., `IcsAssignmentModal`, `ParAssignmentModal`, `RisAssignmentModal`)
4. **User selects items** and assigns them to a ticket (PAR/ICS/RIS ID)
5. **Backend creates clones** of the IAR records with the assigned ID and marks them as `recordType: 'issuance_clone'`

### Multi-Assignment Modals

Each issuance type has both single and multi-assignment:

- `ParAssignmentModal` + `MultiParAssignmentModal`
- `IcsAssignmentModal` + `MultiIcsAssignmentModal`
- `RisAssignmentModal` + `MultiRisAssignmentModal`

### For No-Category Items

We need:

1. A **new query** to fetch IAR records where `category IS NULL`
2. A **new issuance page** (`IssuanceNoCategoryPage`)
3. A **new assignment modal** (simpler than PAR/ICS/RIS since no tag/sub-classification)
4. A **new mutation** to assign a "no-category ID" to selected items

---

## 7. Print Templates

### Existing Print Files (`app/src/components/printDocumentFiles/`)

| File                                    | Purpose                      |
| --------------------------------------- | ---------------------------- |
| `inspectionAcceptanceRerportForIAR.tsx` | IAR print (Appendix 62 form) |
| `inspectionAcceptanceRerport.tsx`       | IAR for RIS context          |
| `inspectionAcceptanceForReporting.tsx`  | IAR reporting                |
| `inventoryCustodianslip.tsx`            | ICS print                    |
| `inventoryCustodianslipPrinting.tsx`    | ICS alternate print          |
| `propertyAcknowledgementReceipt.tsx`    | PAR print                    |
| `requisitionAndIssueSlip.tsx`           | RIS print                    |

### Existing Preview Files (`app/src/components/previewDocumentFiles/`)

| File                                   | Purpose             |
| -------------------------------------- | ------------------- |
| `InspectionAcceptanceReportForIAR.tsx` | IAR preview         |
| `InspectionAcceptanceReport.tsx`       | IAR for RIS context |
| `InspectionAcceptanceForReporting.tsx` | IAR reporting       |
| `inventoryCustodianSlip.tsx`           | ICS preview         |
| `propertyAcknowledgementReceipt.tsx`   | PAR preview         |
| `requisitionAndIssueSlip.tsx`          | RIS preview         |

### For No-Category Items

The user wants a **"simple generic form"** based on the standard IAR form (Appendix 62/63). This matches the existing `inspectionAcceptanceRerportForIAR.tsx` template.

**Recommendation:** Re-use/adapt the existing IAR print template (`inspectionAcceptanceRerportForIAR.tsx`) for no-category issuance. No need for a completely new form — just a version without PAR/ICS/RIS-specific headers.

---

## 8. All Files That Need Changes

### Database / Backend

| File                                                   | Change                                                                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `api/models/inspectionacceptancereport.js`             | Remove default from `category`, ensure null is properly handled                         |
| `api/resolvers/inspectionacceptancereport.resolver.js` | (1) Allow null category in `generateIARFromPO`, (2) Add new query for no-category items |
| `api/typeDefs/inspectionacceptancereport.typeDef.js`   | Add new query type and mutation for no-category issuance                                |
| `api/utils/noCategoryIdGenerator.js`                   | **NEW** — ID generator for no-cat issuance                                              |
| `api/resolvers/nocategory.resolver.js`                 | **NEW** (or extend existing) — mutation to assign no-cat IDs                            |

### Frontend — Core Changes

| File                                      | Change                                                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `app/src/components/GenerateIarModal.tsx` | (1) Add "No Category" option to category dropdown, (2) Skip category validation when "No Category" selected |
| `app/src/pages/inventory.tsx`             | Handle null category display (already works — shows "None")                                                 |

### Frontend — New Issuance Tab

| File                                               | Change                                           |
| -------------------------------------------------- | ------------------------------------------------ |
| `app/src/navigation/routes.ts`                     | Add "No Category" child under Issuance           |
| `app/src/router/routes.tsx`                        | Add route for `/issuance/issuance-nocat`         |
| `app/src/pages/issuanceNoCategoryPage.tsx`         | **NEW** — No-category issuance page              |
| `app/src/components/NoCategoryAssignmentModal.tsx` | **NEW** — Assignment modal                       |
| `app/src/graphql/queries/nocategory.query.ts`      | **NEW** — GraphQL query for no-cat IAR items     |
| `app/src/graphql/mutations/nocategory.mutation.ts` | **NEW** — GraphQL mutation for no-cat assignment |

### Frontend — Print

| File                                                            | Change                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `app/src/components/printDocumentFiles/noCategoryPrint.tsx`     | **NEW** — Generic IAR form print (based on existing IAR template) |
| `app/src/components/previewDocumentFiles/noCategoryPreview.tsx` | **NEW** — Generic IAR form preview                                |
| `app/src/components/printReportModalForNoCategory.tsx`          | **NEW** — Print dialog wrapper                                    |

---

## 9. Phased Implementation Plan

### Phase 1: Allow No-Category IAR Generation (Backend + Modal)

**Goal:** Users can generate IARs for items without selecting PAR/ICS/RIS.

1. **Update `GenerateIarModal.tsx`:**
   - Add a 4th option in the category `<Select>`: `"none"` → displays as "No Category"
   - When "none" is selected, skip the category validation check
   - Do NOT require tag for no-category items
2. **Update `generateIARFromPO` resolver:**
   - Change fallback: `category: category || poi.category || null` (instead of defaulting to RIS)
   - Allow `null` category through without error
3. **Update IAR model:**
   - Change `defaultValue` to `null` on the IAR model's category field

4. **Update migration** (if DB still has old default):
   - Create migration to change IAR table's category default to null

### Phase 2: No-Category Issuance Page

**Goal:** No-category IAR items appear in their own issuance tab.

1. **Backend query (`inspectionacceptancereport.resolver.js`):**
   - Add `inspectionAcceptanceReportForNoCategory` query:
     ```js
     where: {
       isDeleted: false,
       category: null,          // ← no category
       // OR: category: { [Op.is]: null }
     }
     ```

2. **GraphQL typeDef:**
   - Add `inspectionAcceptanceReportForNoCategory: [InspectionAcceptanceReport]` to Query type

3. **Frontend query file:**
   - Create `app/src/graphql/queries/nocategory.query.ts`

4. **Issuance page:**
   - Create `app/src/pages/issuanceNoCategoryPage.tsx` (follow ICS page pattern — simplest)
   - Group by PO number, show items, allow assignment

5. **Navigation:**
   - Add `{ segment: 'issuance-nocat', title: 'No Category', icon: ... }` to `routes.ts`

6. **Router:**
   - Add `{ path: 'issuance-nocat', Component: IssuanceNoCategoryPage }` to `routes.tsx`

### Phase 3: No-Category ID Assignment

**Goal:** Users can assign a "NC" ID to no-category items.

1. **ID Generator:**
   - Create `api/utils/noCategoryIdGenerator.js`
   - Format: `NC-YYYY-MM-NNNN` (e.g., `NC-2026-04-0001`)

2. **Backend mutation:**
   - Add `updateNoCategoryIDs` mutation (similar to `updateICSInventoryIDs` / `updateRISInventoryIDs`)
   - Assigns the generated NC ID to selected IAR records

3. **Assignment modal:**
   - Create `NoCategoryAssignmentModal.tsx` — simpler version of ICS modal
   - No tag selection needed
   - User selects items → assigns NC ID → done

### Phase 4: Print Template

**Goal:** No-category items can be printed using a standard IAR form.

1. **Print template:**
   - Create `noCategoryPrint.tsx` — based on `inspectionAcceptanceRerportForIAR.tsx`
   - Title: "INSPECTION AND ACCEPTANCE REPORT" (standard Appendix 62)
   - Remove PAR/ICS/RIS-specific fields
   - Keep: Entity, Fund Cluster, Supplier, PO#, IAR#, Date, item table, signatories

2. **Preview template:**
   - Create `noCategoryPreview.tsx` — matching preview

3. **Print modal:**
   - Create `printReportModalForNoCategory.tsx`

---

## Appendix A: Category Flow Diagram

```
PO Created (items have category = null)
        ↓
Generate IAR Modal
        ↓
User selects items + picks category per item:
  ├── "PAR"  → category = 'property acknowledgement reciept'  → PAR issuance page
  ├── "ICS"  → category = 'inventory custodian slip'          → ICS issuance page
  ├── "RIS"  → category = 'requisition issue slip'            → RIS issuance page
  └── "None" → category = null                                → No-Category issuance page (NEW)
        ↓
IAR record created in DB
        ↓
Record appears on corresponding issuance page (filtered by category)
        ↓
User assigns ticket ID (PAR, ICS, RIS, or NC ID)
        ↓
Print using appropriate template
```

## Appendix B: Impact Assessment

### Low Risk Changes

- Adding "No Category" option to GenerateIarModal dropdown
- Creating new issuance page (isolated, doesn't touch existing)
- Creating new print template

### Medium Risk Changes

- Removing category fallback to RIS in the backend resolver
- Changing IAR model default from 'requisition issue slip' to null
- **Could affect existing records** with null category if not migrated carefully

### Mitigation

- The category removal migration already ran for PO items (`20260610000100`)
- For IAR model: run a similar migration, but existing IAR records ALREADY have explicit categories assigned
- New query with `category: null` won't accidentally catch old records because they all have categories set during IAR generation
