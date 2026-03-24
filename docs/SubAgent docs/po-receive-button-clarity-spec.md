# PO Receive Button Clarity Spec

## Target

- File: `app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx`

## Current State

### 1. Receive button label logic

Current receive button logic is in the receive column around lines 815-844.

```tsx
const balance = Math.max(
  0,
  (Number(item.quantity) || 0) - (Number(item.actualQuantityReceived) || 0)
);
const fullyReceived = balance <= 0;

{
  fullyReceived ? '✓ Done' : receivingItems.has(index) ? 'Close' : `Receive (${balance})`;
}
```

What the number currently shows:

- `balance`
- This is the remaining quantity to receive, not the delivered quantity
- Example: if ordered quantity is 4 and `actualQuantityReceived` is 0, the button shows `Receive (4)`

### 2. Expanded receive section labels

Current receive section labels are around lines 949-960.

```tsx
<Typography variant="body2" color="text.secondary">
  Already Delivered: <strong>{Number(item.actualQuantityReceived) || 0}</strong>
</Typography>
```

```tsx
<Typography variant="body2" color="text.secondary">
  Remaining:{' '}
  <strong>
    {Math.max(0, (Number(item.quantity) || 0) - (Number(item.actualQuantityReceived) || 0))}
  </strong>
</Typography>
```

Current visible labels:

- `Already Delivered:`
- `Remaining:`

## Problem

The closed-state button label `Receive (${balance})` is ambiguous because users can read the number as already delivered instead of remaining to receive.

When nothing has been delivered yet, `Receive (4)` can be misread as 4 already received, even though the expanded section correctly shows:

- `Already Delivered: 0`
- `Remaining: 4`

## Recommended Minimal Fix

Change only the closed-state button label so the number is explicitly described as remaining.

Current snippet:

```tsx
: `Receive (${balance})`}
```

Recommended minimal replacement:

```tsx
: `Receive (${balance} remaining)`}
```

Why this is the smallest safe fix:

- no behavior changes
- no state changes
- no layout logic changes
- preserves the existing `balance` calculation
- removes the ambiguity without changing the expanded receive workflow

## Optional Follow-up

If the button still needs stronger clarity, a slightly more explicit version could be:

```tsx
: `Receive (${Number(item.actualQuantityReceived) || 0} delivered, ${balance} remaining)`}
```

That is clearer, but it is not the minimal fix and may be too long for the current button width.
