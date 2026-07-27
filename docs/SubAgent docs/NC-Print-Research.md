# No Category (NC) Issuance — Print Functionality Research

## 1. File Inventory

### Pages & Table Rows

| File                                                     | Purpose                                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `app/src/pages/issuanceNoCategoryPage.tsx`               | Main NC issuance page — lists IAR items with `category = null`, grouped by PO |
| `app/src/pages/issuanceNoCategoryFunctions/tableRow.tsx` | `NoCategoryRow` — expandable row per PO group; has Print icon per item        |

### Print Modal & Templates

| File                                                            | Purpose                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------ |
| `app/src/components/printReportModalForNC.tsx`                  | NC print dialog — Purpose field + preview + "Print Report" button  |
| `app/src/components/previewDocumentFiles/noCategoryPreview.tsx` | Live MUI preview of NC form (Appendix 62 IAR layout, shows `ncId`) |
| `app/src/components/printDocumentFiles/noCategoryPrint.tsx`     | HTML template for NC printing (`getNoCategoryPrintTemplate`)       |

### IAR Print (Reference / Comparison)

| File                                                                          | Purpose                                                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `app/src/components/printReportModalForIAR.tsx`                               | IAR print dialog — preview + "Print Report"                          |
| `app/src/components/printDocumentFiles/inspectionAcceptanceRerportForIAR.tsx` | HTML template for IAR printing (`getInspectionReportTemplateForIAR`) |

### Other Print Modals (for signatory pattern reference)

| File                                            | Purpose                                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `app/src/components/printReportModalForPAR.tsx` | PAR print — uses per-item signatories (`parReceivedFrom`, `parReceivedBy`) with fallback to global |
| `app/src/components/printReportModalForICS.tsx` | ICS print                                                                                          |
| `app/src/components/printReportModalForRIS.tsx` | RIS print                                                                                          |

### All Print Document Templates

| File                                                                          |
| ----------------------------------------------------------------------------- |
| `app/src/components/printDocumentFiles/noCategoryPrint.tsx`                   |
| `app/src/components/printDocumentFiles/inspectionAcceptanceRerportForIAR.tsx` |
| `app/src/components/printDocumentFiles/inspectionAcceptanceRerport.tsx`       |
| `app/src/components/printDocumentFiles/inspectionAcceptanceForReporting.tsx`  |
| `app/src/components/printDocumentFiles/propertyAcknowledgementReceipt.tsx`    |
| `app/src/components/printDocumentFiles/requisitionAndIssueSlip.tsx`           |
| `app/src/components/printDocumentFiles/inventoryCustodianslipPrinting.tsx`    |
| `app/src/components/printDocumentFiles/inventoryCustodianslip.tsx`            |

---

## 2. Data Flow: Print Button Click → Print Output

```
User clicks Print icon on NC item (in tableRow.tsx)
    ↓
handleOpenPrintModal(item)  — called from NoCategoryRow
    ↓
issuanceNoCategoryPage.tsx sets:
  - printItem = [item]   (always wrapped in array)
  - openPrintModal = true
    ↓
<PrintReportDialogForNC> opens with:
  - open={openPrintModal}
  - reportData={printItem}        ← array of items
  - signatories={signatories}     ← from useSignatoryStore('nc')
  - title="No Category Issuance Report"
    ↓
Inside PrintReportDialogForNC:
  - Shows Purpose TextField (pre-filled from items[0]?.purpose)
  - Shows <NoCategoryPreview> (live MUI preview)
    ↓
User clicks "Print Report"
    ↓
handlePrintReport():
  - Calls getNoCategoryPrintTemplate(signatories, reportData, purpose)
  - Opens window.open('', '_blank')
  - Writes HTML template → triggers window.print()
  - Closes dialog
```

---

## 3. Signatory Architecture — CURRENT STATE

### How signatories reach the NC print modal

```
issuanceNoCategoryPage.tsx:
  const getSelections = useSignatoryStore((s) => s.getSelections);
  const signatories = getSelections('nc') || { recieved_from: '', recieved_by: '' };
```

This uses `selectionsByContext['nc']` from the Zustand signatory store.

### What the NC print template uses (footer section)

The NC template (`noCategoryPrint.tsx`) has a **2-signatory** footer:

**LEFT side (colspan=4):**

```
Date Inspected:______
[checkbox area]
"Inspected, verified and found in order as to quantity and specification"

${signatories?.recieved_by}        ← Inspection Officer name
─────────────────────
Inspection Officer
```

**RIGHT side (colspan=4):**

```
Date Received: _____
[Complete ✓] [Partial ✓]   ← checkboxes auto-filled from iarStatus

${signatories?.recieved_from}      ← Supply Officer name
─────────────────────
Property and Supply Management Officer
```

### THE PROBLEM: Only 2 signatories, but IAR form has 3 positions

Looking at the physical Appendix 62 IAR form layout, there should be **3** signatory positions:

1. **Inspection Officer** (left bottom) — `signatories.recieved_by` → currently used
2. **Supply Officer** (right middle) — `signatories.recieved_from` → currently used
3. **End User** (right bottom) — **MISSING** — not in current NC template

The IAR template (`inspectionAcceptanceRerportForIAR.tsx`) has the **exact same 2-signatory** layout. Both templates are identical in their footer — neither has an "End User" row.

### How PAR does it (for reference — per-item signatories)

PAR modal (`printReportModalForPAR.tsx`) has a more advanced pattern:

```typescript
// Check if item has per-item PAR signatories (new workflow)
if (firstItem?.parReceivedFrom || firstItem?.parReceivedBy) {
  return {
    recieved_from: firstItem.parReceivedFrom || '',
    recieved_by: firstItem.parReceivedBy || '',
    metadata: {
      recieved_from: { position: firstItem.parReceivedFromPosition || '' },
      recieved_by: { position: firstItem.parReceivedByPosition || '' },
    },
  };
}
// Fall back to global signatories
return signatories;
```

---

## 4. GraphQL Query — GET_ALL_IAR_NO_CATEGORY

```graphql
query GetAllIARNoCategory {
  inspectionAcceptanceReportNoCategory {
    id
    itemName
    purchaseOrderId
    description
    unit
    quantity
    unitCost
    amount
    actualQuantityReceived
    category
    isDeleted
    tag
    iarId
    icsId
    risId
    parId
    iarStatus
    inventoryNumber
    ncId
    purpose
    income
    mds
    details
    poRemarks
    splitGroupId
    splitFromItemId
    splitIndex
    recordType
    PurchaseOrder {
      id
      poNumber
      supplier
      address
      telephone
      placeOfDelivery
      dateOfDelivery
      dateOfPayment
      deliveryTerms
      paymentTerms
      category
      status
      amount
      invoice
      income
      mds
      details
    }
    PurchaseOrderItem {
      id
      purchaseOrderId
      itemName
      description
      generalDescription
      specification
      unit
      quantity
      unitCost
      amount
      category
      isDeleted
      actualQuantityReceived
      currentInput
    }
  }
}
```

**Notable:** The query does NOT fetch any NC-specific signatory fields (no `ncReceivedFrom`, `ncReceivedBy`, etc.)

---

## 5. Types

```typescript
// app/src/types/printReportModal/types.tsx
interface InspectionReportDialogPropsForIAR {
  open: boolean;
  handleClose: () => void;
  reportData?: any;
  reportType?: 'inspection' | 'property' | 'requisition' | 'inventory' | string;
  title?: string;
  signatories: any;
}
```

---

## 6. Signatory Store Pattern

```typescript
// app/src/stores/signatoryStore.tsx (Zustand with persist)
selectionsByContext: {}     // Key-value store: { 'nc': {...}, 'ics': {...}, etc. }

getSelections(key) → selectionsByContext[key]
setSelections(key, selections) → updates selectionsByContext[key]
```

The NC page reads `getSelections('nc')` which returns:

```typescript
{ recieved_from: string, recieved_by: string }
```

---

## 7. Key Findings & Issues

### Current NC Print Modal (`printReportModalForNC.tsx`) is SIMPLE

- Only has: Purpose TextField + Preview + Print button
- **NO signatory selection UI** — relies entirely on what's already in the store
- No remarks field (unlike PAR which has a remarks TextField)

### The Signatory Selection mentioned by user (Image 3: "Received From" + "Received By")

This is likely the **sidebar/global signatory selector** component that populates the store, NOT inside the NC modal itself. The NC modal just reads from the store.

### Missing 3rd signatory

Both the NC and IAR templates only have 2 signatory positions:

- `recieved_by` → Inspection Officer (left)
- `recieved_from` → Supply Officer (right)

There is NO "End User" signatory position in either template. If the requirement is for 3 signatories, both the template and the signatory selection would need to be updated.

### NC Template vs IAR Template — Differences

| Feature            | IAR Template                          | NC Template                    |
| ------------------ | ------------------------------------- | ------------------------------ |
| ID shown           | `iarId`                               | `ncId`                         |
| Purpose field      | No                                    | Yes (via modal)                |
| Income/MDS/Details | From item data                        | From item data + purpose       |
| Signatories        | 2 (same positions)                    | 2 (same positions)             |
| Template function  | `getInspectionReportTemplateForIAR()` | `getNoCategoryPrintTemplate()` |
| Everything else    | Identical                             | Identical                      |
