# PO Remarks Field — Full Implementation Spec

## Overview

Add a new `poRemarks` field to IAR records. This field stores text like:

```
PHILIPPINE CONSORTIUM FOR SOCIAL WELFARE... PO# 0212-011-26
Supplier Name Here
```

It appears as an inline-editable multi-line field on the IAR inventory table (beside `details`), and propagates to print templates:

- **PAR** → appended to the **Remarks** section (new line after existing remarks)
- **ICS** → appended to the **Purpose** section (new line after existing purpose)
- **RIS** → appended to the **Purpose** section (new line after existing purpose)

---

## Layer-by-Layer Changes

### 1. Database Migration

**New file:** `api/migrations/YYYYMMDD000100-add_po_remarks_to_iar.js`

Add column `po_remarks` (TEXT, nullable) to `inspection_acceptance_report` table.

```js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inspection_acceptance_report', 'po_remarks', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'PO Remarks for propagation to PAR/ICS/RIS print templates',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('inspection_acceptance_report', 'po_remarks');
  },
};
```

---

### 2. Sequelize Model

**File:** `api/models/inspectionacceptancereport.js`

**Where:** After the `details` field definition (around line 152). The pattern is identical to `details`, `icsDetails`, `parDetails`, `risDetails`.

**Add:**

```js
// PO Remarks field for propagation to PAR/ICS/RIS print templates
poRemarks: {
  type: DataTypes.TEXT,
  allowNull: true,
  comment: 'PO Remarks text that propagates to PAR remarks and ICS/RIS purpose sections',
},
```

**Current model fields for reference (line ~135-152):**

```js
income: { type: DataTypes.TEXT, allowNull: true, comment: 'Income info specific to this IAR' },
mds: { type: DataTypes.TEXT, allowNull: true, comment: 'MDS info specific to this IAR' },
details: { type: DataTypes.TEXT, allowNull: true, comment: 'Details specific to this IAR' },
```

---

### 3. GraphQL TypeDefs

**File:** `api/typeDefs/inspectionacceptancereport.typeDef.js`

#### 3a. Add to `ItemWithPurchaseOrder` type (around line 108, after `risDetails: String`)

```graphql
poRemarks: String
```

#### 3b. Add to `updateIARInvoice` mutation signature (around line 191)

**Current:**

```graphql
updateIARInvoice(iarId: String!, invoice: String, invoiceDate: String, income: String, mds: String, details: String): UpdateIARInvoicePayload!
```

**Change to:**

```graphql
updateIARInvoice(iarId: String!, invoice: String, invoiceDate: String, income: String, mds: String, details: String, poRemarks: String): UpdateIARInvoicePayload!
```

#### 3c. Add to `UpdateIARInvoicePayload` type (around line 213)

**Current:**

```graphql
type UpdateIARInvoicePayload {
  success: Boolean!
  message: String!
  iarId: String!
  invoice: String
  invoiceDate: String
  income: String
  mds: String
  details: String
  updatedCount: Int!
}
```

**Add `poRemarks: String` after `details: String`.**

---

### 4. Backend Resolver

**File:** `api/resolvers/inspectionacceptancereport.resolver.js`

**Location:** `updateIARInvoice` resolver at **line 801**.

#### 4a. Add `poRemarks` to destructured args

**Current (line 801):**

```js
updateIARInvoice: async (_, { iarId, invoice, invoiceDate, income, mds, details }, context) => {
```

**Change to:**

```js
updateIARInvoice: async (_, { iarId, invoice, invoiceDate, income, mds, details, poRemarks }, context) => {
```

#### 4b. Add to updateData builder (around line 822)

**After:**

```js
if (details !== undefined) updateData.details = details;
```

**Add:**

```js
if (poRemarks !== undefined) updateData.poRemarks = poRemarks;
```

#### 4c. Add to return object (around line 835)

**After:**

```js
details: details ?? null,
```

**Add:**

```js
poRemarks: poRemarks ?? null,
```

---

### 5. Frontend GraphQL Mutation

**File:** `app/src/graphql/mutations/inventoryIAR.mutation.ts`

**Location:** `UPDATE_IAR_INVOICE` at **line 122**.

**Current:**

```graphql
mutation UpdateIARInvoice(
  $iarId: String!
  $invoice: String
  $invoiceDate: String
  $income: String
  $mds: String
  $details: String
) {
  updateIARInvoice(
    iarId: $iarId
    invoice: $invoice
    invoiceDate: $invoiceDate
    income: $income
    mds: $mds
    details: $details
  ) {
    success
    message
    iarId
    invoice
    invoiceDate
    income
    mds
    details
    updatedCount
  }
}
```

**Add `$poRemarks: String` to variables, `poRemarks: $poRemarks` to args, and `poRemarks` to return fields.**

---

### 6. Frontend — Inventory Page (IAR Table)

**File:** `app/src/pages/inventory.tsx`

This is the most complex part. The pattern is: each inline field has an override, a saving state, and a TextField.

#### 6a. Add to `Row` props type (line ~73)

**After:**

```ts
detailsOverride?: string;
```

**Add:**

```ts
poRemarksOverride?: string;
```

#### 6b. Add to `onOverrideChange` patch type (line ~83)

**After:**

```ts
details?: string;
```

**Add:**

```ts
poRemarks?: string;
```

#### 6c. Add destructuring in Row component (line ~95)

**After:**

```ts
detailsOverride,
```

**Add:**

```ts
poRemarksOverride,
```

#### 6d. Add saving state (after line ~103)

```ts
const [savingPoRemarks, setSavingPoRemarks] = React.useState(false);
```

#### 6e. Add to iarDefaults (after line ~241 `details` default)

```ts
poRemarks: row.items?.[0]?.poRemarks || '',
```

#### 6f. Add derived value (after line ~246 `detailsValue`)

```ts
const poRemarksValue = poRemarksOverride ?? iarDefaults.poRemarks;
```

#### 6g. Add new TableCell with TextField (after the Details `<TableCell>` block, around line ~483)

Follow the exact same pattern as the Details field — multiline TextField, Shift+Enter to save, uses `updateIARInvoice` with `poRemarks` variable.

```tsx
{
  /* PO Remarks multiline shift+enter-to-save */
}
<TableCell>
  <TextField
    size="small"
    multiline
    maxRows={4}
    placeholder={iarDefaults.poRemarks || 'Hit Shift+Enter to save...'}
    value={poRemarksOverride !== undefined ? poRemarksOverride : iarDefaults.poRemarks}
    onChange={(e) => onOverrideChange(row.iarId, { poRemarks: e.target.value })}
    onKeyDown={async (e) => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        const valueToSave = (target.value || '').trim();
        try {
          setSavingPoRemarks(true);
          await updateIARInvoice({
            variables: { iarId: row.iarId, poRemarks: valueToSave },
          });
          onNotify('PO Remarks saved');
        } catch (err) {
          console.error('Failed to save PO Remarks', err);
          onNotify('Failed to save PO Remarks', 'error');
        } finally {
          setSavingPoRemarks(false);
        }
      }
    }}
    sx={{ minWidth: 220 }}
    InputProps={{
      endAdornment: savingPoRemarks ? (
        <InputAdornment position="end">
          <CircularProgress size={16} />
        </InputAdornment>
      ) : undefined,
      readOnly: false,
    }}
    disabled={savingPoRemarks}
  />
</TableCell>;
```

#### 6h. Add table header (after `<TableCell>Details</TableCell>` at line ~1251)

```tsx
<TableCell>PO Remarks</TableCell>
```

#### 6i. Add override prop to `<Row>` (after `detailsOverride` at line ~1275)

```tsx
poRemarksOverride={iarOverrides[row.iarId]?.poRemarks}
```

#### 6j. Update `iarOverrides` state type (line ~918)

Add `poRemarks?: string;` to the Record value type.

---

### 7. Print Template — PAR (Remarks Section)

**File:** `app/src/components/printDocumentFiles/propertyAcknowledgementReceipt.tsx`

**Location:** Line 435 — the Remarks cell.

**Current:**

```html
<td colspan="4" style="padding: 4px; vertical-align: top;">
  Remarks: ${remarks || firstItem?.remarks ? `<span style="font-style: italic;"
    >${escapeHtml(remarks || firstItem?.remarks || '')}</span
  >` : ''}
</td>
```

**Strategy:** After the existing remarks text, append a `<br/>` and the `poRemarks` value if it exists. The `poRemarks` comes from `firstItem?.poRemarks`.

**New logic:**

```js
const poRemarksText = firstItem?.poRemarks || '';
const remarksText = remarks || firstItem?.remarks || '';
const fullRemarks = [remarksText, poRemarksText].filter(Boolean).join('\n');
```

Then render with `nl2br(escapeHtml(fullRemarks))` in the Remarks cell.

**Note:** The PAR template currently uses inline `escapeHtml` but does NOT use `nl2br`. We need to add newline handling here so multi-line poRemarks renders properly. The template already defines `nl2br` at line 23.

---

### 8. Print Template — ICS (Purpose Section)

**File:** `app/src/components/printDocumentFiles/inventoryCustodianslipPrinting.tsx`

**Location:** Line 77 — `purposeText` derivation, and line 438 — Purpose rendering.

**Current (line 77):**

```js
const purposeText = purpose || itemsArray[0]?.purpose || '';
```

**Strategy:** Append `poRemarks` as a new line after purpose text.

**New:**

```js
const basePurpose = purpose || itemsArray[0]?.purpose || '';
const poRemarksText = itemsArray[0]?.poRemarks || '';
const purposeText = [basePurpose, poRemarksText].filter(Boolean).join('\n');
```

**Rendering (line 438):** Already uses `escapeHtml(purposeText)`. Need to change to `nl2br(escapeHtml(purposeText))` so newlines render as `<br/>`. The `nl2br` function is already imported at line 2.

---

### 9. Print Template — RIS (Purpose Section)

**File:** `app/src/components/printDocumentFiles/requisitionAndIssueSlip.tsx`

**Location:** Line 431 — Purpose rendering.

**Current:**

```html
Purpose: ${escapeHtml(purpose || itemsArray[0]?.purpose || '')}
```

**Strategy:** Same as ICS — combine purpose + poRemarks with newline separator.

**New:**

```js
// At top of function, derive combined purpose
const basePurpose = purpose || itemsArray[0]?.purpose || '';
const poRemarksText = itemsArray[0]?.poRemarks || '';
const combinedPurpose = [basePurpose, poRemarksText].filter(Boolean).join('\n');
```

Then render:

```html
Purpose: ${nl2br(escapeHtml(combinedPurpose))}
```

`nl2br` and `escapeHtml` are already imported at line 2.

---

## GraphQL Query — Ensure `poRemarks` is fetched

**File:** `app/src/graphql/queries/inspectionacceptancereport.query.ts`

The `GET_ALL_INSPECTION_ACCEPTANCE_REPORT` query must include `poRemarks` in the returned fields so the IAR table can display it. Add `poRemarks` alongside the existing `details`, `income`, `mds` fields.

---

## Data Flow Diagram

```
User types in "PO Remarks" column on IAR inventory table
    ↓ Shift+Enter
Frontend calls UPDATE_IAR_INVOICE mutation with { iarId, poRemarks }
    ↓
GraphQL resolver updateIARInvoice destructures poRemarks
    ↓
Sequelize updates all IAR records matching iarId → sets po_remarks column
    ↓
On print:
  ├─ PAR: poRemarks appended to Remarks section (new line)
  ├─ ICS: poRemarks appended to Purpose section (new line)
  └─ RIS: poRemarks appended to Purpose section (new line)
```

---

## Files Modified (Summary)

| #   | File                                                                       | Change                                      |
| --- | -------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | `api/migrations/YYYYMMDD-add_po_remarks_to_iar.js`                         | **NEW** — add `po_remarks` column           |
| 2   | `api/models/inspectionacceptancereport.js`                                 | Add `poRemarks` field definition            |
| 3   | `api/typeDefs/inspectionacceptancereport.typeDef.js`                       | Add to type, mutation, payload              |
| 4   | `api/resolvers/inspectionacceptancereport.resolver.js`                     | Add to `updateIARInvoice` resolver          |
| 5   | `app/src/graphql/mutations/inventoryIAR.mutation.ts`                       | Add `poRemarks` to `UPDATE_IAR_INVOICE`     |
| 6   | `app/src/graphql/queries/inspectionacceptancereport.query.ts`              | Add `poRemarks` to query fields             |
| 7   | `app/src/pages/inventory.tsx`                                              | Add inline editable column + state + header |
| 8   | `app/src/components/printDocumentFiles/propertyAcknowledgementReceipt.tsx` | Append poRemarks to Remarks                 |
| 9   | `app/src/components/printDocumentFiles/inventoryCustodianslipPrinting.tsx` | Append poRemarks to Purpose                 |
| 10  | `app/src/components/printDocumentFiles/requisitionAndIssueSlip.tsx`        | Append poRemarks to Purpose                 |

---

## Implementation Order

1. Migration + Model (backend DB ready)
2. TypeDefs + Resolver (GraphQL layer ready)
3. Frontend mutation + query (data can flow)
4. Inventory page UI (user can edit)
5. Print templates (propagation works)
6. Test end-to-end
