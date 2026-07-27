# PO Category Truncation Research Spec

## Scope

Investigate `Data truncated for column 'category'` during `updatePurchaseOrder` when the user performs a receive-only update on an existing purchase order item.

Relevant files reviewed:

- `api/models/purchaseorderitems.js`
- `api/typeDefs/purchaseorder.typeDef.js`
- `api/resolvers/purchaseorder.resolver.js`
- `app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx`
- `app/src/pages/purchaseOrderFunctions/purchaseOrderOperations.tsx`
- `app/src/graphql/mutations/purchaseorder.mutation.ts`

## Findings

### 1. DB / Sequelize definition of `category`

File: `api/models/purchaseorderitems.js`

Relevant snippet:

```js
category: {
  type: DataTypes.ENUM(
    'property acknowledgement reciept',
    'inventory custodian slip',
    'requisition issue slip'
  ),
  allowNull: true,
  defaultValue: null,
},
```

Implications:

- `category` is a MySQL/Sequelize `ENUM`, not a free-form string.
- Valid stored values are only:
  - `property acknowledgement reciept`
  - `inventory custodian slip`
  - `requisition issue slip`
- `NULL` is allowed.
- Empty string `''` is not one of the enum values.

### 2. Why `category: ""` causes truncation

Schema mismatch exists between GraphQL and the DB layer.

File: `api/typeDefs/purchaseorder.typeDef.js`

Relevant snippets:

```js
input ItemInput {
  ...
  category: String
  ...
  tag : String
}

input UpdatePurchaseOrderInput {
  ...
  items: [ItemInput!]
  ...
}
```

GraphQL accepts `category` as any string, including `""`.

Frontend normalization then creates blank strings for missing values.

File: `app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx`

Relevant snippets:

```tsx
const mappedItems = (purchaseOrder.items || []).map((item: any) => ({
  category: item.category || '',
  ...
  tag: item.tag || '',
  ...
}));
```

```tsx
const cleanedItems = formData.items.map((item: any) => {
  delete item.recievelimit;
  delete item.actualQuantityReceived;
  item.id = item.id ? item.id : 'temp';
  const { __typename, ...cleanItem } = item;
  return cleanItem;
});
...
handleSave(cleanData);
```

`purchaseOrderOperations.tsx` forwards those item objects directly into the mutation input:

```tsx
const cleanedItems = formData.items.map((item: any) => {
  const { __typename, iarId, ...cleanItem } = item;
  return cleanItem;
});
...
await updatePurchaseOrder({
  variables: {
    input: {
      id: parseInt(editingPO.id),
      ...cleanFormData,
    },
  },
});
```

On the backend update path, existing-item updates do not normalize blank `category` values before writing to Sequelize.

Result:

- frontend sends `category: ''`
- GraphQL accepts it because `category` is typed as `String`
- resolver copies it into `itemUpdates`
- Sequelize/MySQL tries to persist `''` into an `ENUM`
- MySQL raises `Data truncated for column 'category'`

### 3. Exact place where `category` is written for existing items

File: `api/resolvers/purchaseorder.resolver.js`

Relevant snippets from `Mutation.updatePurchaseOrder`:

#### A. `category` is copied into `itemUpdates`

```js
const itemUpdates = {};
let detailsChanged = false;
[
  'itemName',
  'description',
  'generalDescription',
  'specification',
  'unit',
  'category',
  'tag',
  'inventoryNumber',
].forEach((field) => {
  if (item[field] !== undefined && item[field] !== currentItem[field]) {
    itemUpdates[field] = item[field];
    detailsChanged = true;
  }
});
```

If the frontend sends `category: ''` and the stored row currently has `NULL` or a real enum value, this branch sets:

```js
itemUpdates.category = '';
```

#### B. Receive path writes `itemUpdates` back to `purchase_order_items`

```js
if (receivedQty > 0) {
  ...
  await PurchaseOrderItems.update(
    { ...itemUpdates, actualQuantityReceived: newAqr },
    { where: { id: currentItem.id, purchaseOrderId: poId } }
  );
  ...
}
```

This is the direct failing write for receive-only updates.

#### C. Details-only path can also write blank `category`

```js
if (detailsChanged) {
  await PurchaseOrderItems.update(itemUpdates, {
    where: { id: item.id, purchaseOrderId: poId },
  });
  ...
}
```

So the bug is not limited to receive; receive just makes it easy to hit because the modal submits every item field during receive.

#### D. The same blank value is also propagated into IAR creation

```js
const effectiveCategory =
  itemUpdates.category !== undefined ? itemUpdates.category : currentItem.category;

const iarRow = await inspectionAcceptanceReport.create({
  ...
  category: effectiveCategory,
  ...
});
```

That is not the enum failure itself, but it shows the resolver currently treats blank `category` as an intentional new value.

### 4. Safest minimal fix

Recommended minimal fix: backend-first normalization in the existing-item branch of `updatePurchaseOrder`.

Behavior to implement:

- If incoming `item.category` is blank or whitespace-only, do not write it for existing items.
- Preserve `currentItem.category` during receive-only updates.
- Apply the same rule to `tag` for consistency, even though `tag` is not the DB error source.

Why this is safest:

- It fixes the trust boundary where invalid data enters persistence.
- It does not rely on all frontend callers behaving correctly.
- It preserves historical data on existing items instead of unexpectedly clearing or changing classification.
- It is smaller and lower-risk than changing schema types or broader update semantics.
- It aligns with the existing comments in the frontend and create path that category/tag are assigned elsewhere, not in the PO modal.

Recommended normalization rule in the resolver:

- `undefined` => no change
- `null` => only allow if there is an explicit use case to clear the field
- `''` or whitespace => treat as “not provided” for existing item updates
- invalid non-empty category not in the enum set => reject or coerce to no change; for this specific bug, “skip write” is the least disruptive

### 5. Frontend vs backend responsibility

Recommendation: both, with the backend as the required fix and frontend as defense in depth.

#### Backend should:

- Skip blank writes for `category` and `tag` on existing item updates.
- Preserve existing values when the PO modal submits placeholder blanks.

Reason:

- The backend owns data integrity.
- GraphQL currently exposes `String`, so invalid values can arrive from any client, not only this modal.
- The current create path already sanitizes category, but the update path does not. The inconsistency should be corrected server-side.

#### Frontend should also:

- Strip `category` and `tag` from update payloads when they are `''` in the PO modal.
- Especially for receive-only actions, avoid sending placeholder values for fields that the modal no longer edits.

Reason:

- `purchaseordermodel.tsx` explicitly comments that category/tag are no longer set in this modal.
- Sending placeholder blanks is semantically wrong even if the backend becomes tolerant.
- This reduces accidental field churn and avoids future regressions in other update branches.

## Recommended Fix Plan

### Phase 1: Minimal safe fix

1. In `api/resolvers/purchaseorder.resolver.js`, normalize `category` and `tag` for existing items before `itemUpdates` is written.
2. For existing items, treat blank `category` / `tag` as omitted fields.
3. Ensure `effectiveCategory` / `effectiveTag` fall back to `currentItem` when incoming values are blank.
4. Leave create-path behavior unchanged for now because it already coerces blank `category` to `null`.

Expected outcome:

- receive-only updates succeed even when the modal sends `category: ''`
- existing item classification is preserved
- no change to user-facing behavior beyond eliminating the failure

### Phase 2: Frontend hardening

1. In `app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx` and/or `app/src/pages/purchaseOrderFunctions/purchaseOrderOperations.tsx`, omit `category` and `tag` from outgoing item payloads when they are blank.
2. Keep receive-only payloads focused on quantity and any truly edited fields.

Expected outcome:

- less noisy mutation payloads
- fewer chances of overwriting data with placeholder values

## Direct Answers

1. `category` is defined in `api/models/purchaseorderitems.js` as a nullable Sequelize/MySQL `ENUM` with exactly three allowed values and `defaultValue: null`.
2. `category: ''` causes truncation because GraphQL accepts it as a `String`, but MySQL cannot store `''` in that enum column; the update resolver passes the blank string through unchanged.
3. For existing items, `category` is copied into `itemUpdates` inside `Mutation.updatePurchaseOrder`, then written by `PurchaseOrderItems.update({ ...itemUpdates, actualQuantityReceived: newAqr }, ...)` in the receive branch, and also by `PurchaseOrderItems.update(itemUpdates, ...)` in the details-only branch.
4. The safest minimal fix is to normalize existing-item updates in the backend so blank `category`/`tag` values are treated as omitted and existing DB values are preserved.
5. Do both, but backend first. The backend must guard persistence. The frontend should also stop sending blank placeholder `category`/`tag` values from the PO modal.
