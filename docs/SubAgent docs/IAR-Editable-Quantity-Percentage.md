# IAR Editable Quantity Display (Percentage)

## Problem

The IAR (Inspection & Acceptance Report) preview and print currently show `actualQuantityReceived` as an integer in the Quantity column. For construction projects, users need to display percentages (e.g., "11.79%") instead of integer counts, and these values need to be manually editable and persistent (saved to DB).

## Design Decision

Add a NEW field `iarQuantityDisplay` (STRING) rather than changing the existing `actualQuantityReceived` (INTEGER). This preserves backward compatibility with inventory tracking, remaining quantity calculations, and partial/complete status logic.

## Approach

1. **New column `iarQuantityDisplay`**: VARCHAR(50), nullable. Stores the display text for the quantity column (e.g., "11.79%")
2. **Existing `amount` field**: Already exists as DECIMAL(10,2) in the model but is currently AUTO-CALCULATED in the preview as `actualQuantityReceived * unitCost`. We'll make it editable and persist the user-entered value.
3. **Preview component**: Add inline-editable TextFields for Quantity and Amount columns. Save on blur using a GraphQL mutation.
4. **Print template**: Use `iarQuantityDisplay` when available, otherwise fall back to `actualQuantityReceived`. Use DB `amount` when `iarQuantityDisplay` is set.
5. **Total row**: Use DB `amount` per item to sum up the total, with fallback to auto-calculation.

## Files to Modify

### Backend

1. `api/migrations/YYYYMMDD-add_iar_quantity_display.js` - NEW: migration to add column
2. `api/scripts/run_iar_quantity_display_migration.js` - NEW: migration runner
3. `api/models/inspectionacceptancereport.js` - ADD `iarQuantityDisplay` field
4. `api/typeDefs/inspectionacceptancereport.typeDef.js` - ADD `iarQuantityDisplay` to types + new mutation
5. `api/resolvers/inspectionacceptancereport.resolver.js` - ADD mutation handler

### Frontend

6. `app/src/graphql/queries/inspectionacceptancereport.query.ts` - ADD `iarQuantityDisplay` to queries
7. `app/src/graphql/mutations/inventoryIAR.mutation.ts` - ADD `UPDATE_IAR_ITEM_DISPLAY` mutation
8. `app/src/components/previewDocumentFiles/InspectionAcceptanceReportForIAR.tsx` - ADD editable fields
9. `app/src/components/printDocumentFiles/inspectionAcceptanceRerportForIAR.tsx` - USE new field in print

## New GraphQL Types

### Mutation

```graphql
updateIARItemDisplay(id: Int!, iarQuantityDisplay: String, amount: Float): UpdateIARItemDisplayPayload!
```

### Payload

```graphql
type UpdateIARItemDisplayPayload {
  success: Boolean!
  message: String!
  id: Int!
  iarQuantityDisplay: String
  amount: Float
}
```

## UI Behavior

- Quantity column: Shows a TextField pre-filled with `iarQuantityDisplay` or `actualQuantityReceived`
- Amount column: Shows a TextField pre-filled with `amount` value
- Save on blur: When user moves focus away, mutation fires to save
- Print: Uses `iarQuantityDisplay` text directly (includes "%" if user typed it)
- Total: Sum of individual `amount` values
