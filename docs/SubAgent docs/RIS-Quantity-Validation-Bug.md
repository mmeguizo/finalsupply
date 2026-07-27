# RIS Quantity Validation Bug — Spec & Analysis

## Bug Summary

**Error:** `Quantity for "item name" must be greater than 0`  
**When:** Creating an RIS ticket for an item with `actualQuantityReceived = 1`  
**Expected:** Should work the same as PAR and ICS ticket creation (which work fine)

---

## Root Cause

The bug is a **frontend-only issue** caused by a single inconsistent fallback value in the `selectedEntries` memo inside `MultiRisAssignmentModal.tsx`.

### The Exact Line Causing the Error

**File:** `app/src/components/MultiRisAssignmentModal.tsx`, **line ~275**

```js
quantity: itemQuantities[String(it.id)] || 0, // Default to 0
```

### How PAR and ICS Do It (correctly)

**File:** `app/src/components/MultiParAssignmentModal.tsx`, **line ~280**

```js
quantity: itemQuantities[String(it.id)] || 1,
```

**File:** `app/src/components/MultiIcsAssignmentModal.tsx`, **line ~280**

```js
quantity: itemQuantities[String(it.id)] || 1,
```

---

## Detailed Flow Explanation

### What Happens in All Three Modals

1. **User opens modal** → `useEffect` runs, sets `itemQuantities` defaults to `0` for pre-selected items
2. **User checks an item** → `toggleItem()` runs:
   ```js
   setItemQuantities((prev) => ({ ...prev, [itemId]: 0 }));
   // ^^^ All three modals set this to 0
   ```
3. **`selectedEntries` memo recalculates** → maps selected items to entry objects

### The Critical Difference (Step 3)

| Modal   | `selectedEntries` quantity fallback | Effect when `itemQuantities[id]` is `0` |
| ------- | ----------------------------------- | --------------------------------------- |
| **RIS** | `itemQuantities[id] \|\| 0`         | `0 \|\| 0` → **stays `0`**              |
| **PAR** | `itemQuantities[id] \|\| 1`         | `0 \|\| 1` → **becomes `1`**            |
| **ICS** | `itemQuantities[id] \|\| 1`         | `0 \|\| 1` → **becomes `1`**            |

### Why JavaScript `||` Matters Here

In JavaScript, `0` is **falsy**. So:

- `0 || 0` → `0` (RIS: quantity stays 0)
- `0 || 1` → `1` (PAR/ICS: quantity silently becomes 1)

### What Happens Next

4. **User submits** → validation runs:
   ```js
   if (entry.quantity <= 0) {
     setError(`Quantity for "${entry.description}" must be greater than 0.`);
     return;
   }
   ```
5. **RIS**: `entry.quantity` is `0` → **ERROR triggered** ❌
6. **PAR/ICS**: `entry.quantity` is `1` → passes validation → works ✅

### Why It Specifically Affects Items with Quantity 1

For an item with `actualQuantityReceived = 1`:

- **PAR/ICS**: Auto-defaults to `1`, which equals available quantity → passes all checks
- **RIS**: Stays at `0` → fails the `> 0` check immediately

For items with higher quantities (e.g., 10), the user would still need to manually set a quantity in all three modals. But for quantity-1 items, PAR/ICS "just work" because the `|| 1` fallback happens to match the available qty.

---

## Backend Validation (Not the Issue)

The backend resolvers for all three ticket types have identical validation patterns. They are **not** causing this bug:

**RIS resolver** (`api/resolvers/requisitionissueslip.resolver.js`, lines ~280-284):

```js
if (quantity > currentReceived) {
  throw new Error(`Quantity (${quantity}) exceeds available (${currentReceived})`);
}
if (quantity <= 0) {
  throw new Error('Quantity must be greater than 0');
}
```

**PAR resolver** (`api/resolvers/propertyacknowledgementrepoert.resolver.js`, lines ~458-462):

```js
if (quantity > currentReceived) {
  throw new Error(`Quantity (${quantity}) exceeds available (${currentReceived})`);
}
if (quantity <= 0) {
  throw new Error('Quantity must be greater than 0');
}
```

Both are identical — the quantity never reaches the backend because the frontend catches it first.

---

## The Fix

### Option A: Make RIS consistent with PAR/ICS (minimal change)

**File:** `app/src/components/MultiRisAssignmentModal.tsx`

Change line ~275 in the `selectedEntries` memo from:

```js
quantity: itemQuantities[String(it.id)] || 0, // Default to 0
```

To:

```js
quantity: itemQuantities[String(it.id)] || 1,
```

**Pros:** One-line fix, matches PAR/ICS behavior  
**Cons:** For items with quantity > 1, the default becomes 1 instead of 0, which contradicts the design spec "default quantity should be 0 to prevent accidental submissions"

### Option B: Keep default 0, but use nullish coalescing (recommended)

This is the more correct fix. The `toggleItem` intentionally sets `0`, but `|| 0` is redundant. The real issue is that when a user hasn't explicitly set a quantity yet (item just toggled on), we want `0`. When they type `0`, we also want `0`. The `||` operator can't distinguish these cases.

**Fix all three modals** for consistency by changing the `selectedEntries` fallback to use `?? 0`:

```js
// In all three modals:
quantity: itemQuantities[String(it.id)] ?? 0,
```

Then remove the `|| 1` from PAR and ICS as well to enforce consistent "default to 0" behavior per the design spec. This means for ALL ticket types, the user must explicitly enter quantity before submitting.

### Option C: Quick pragmatic fix — just match PAR/ICS (simplest)

Same as Option A. Just change `|| 0` to `|| 1` in the RIS modal. This is the least risky change and makes all three modals behave the same way.

---

## Files Involved

| File                                                       | Role                                       | Lines of Interest                         |
| ---------------------------------------------------------- | ------------------------------------------ | ----------------------------------------- |
| `app/src/components/MultiRisAssignmentModal.tsx`           | **BUG HERE** — `selectedEntries` memo      | Line ~275: `\|\| 0` fallback              |
| `app/src/components/MultiParAssignmentModal.tsx`           | Working reference — `selectedEntries` memo | Line ~280: `\|\| 1` fallback              |
| `app/src/components/MultiIcsAssignmentModal.tsx`           | Working reference — `selectedEntries` memo | Line ~280: `\|\| 1` fallback              |
| `api/resolvers/requisitionissueslip.resolver.js`           | Backend RIS resolver                       | Lines 277-284: validation (not the issue) |
| `api/resolvers/propertyacknowledgementrepoert.resolver.js` | Backend PAR resolver                       | Lines 458-462: identical validation       |
| `api/typeDefs/requisitionissueslip.typeDef.js`             | RIS GraphQL schema                         | No issues here                            |

---

## Recommendation

**Go with Option A** (change `|| 0` to `|| 1` in the RIS modal). This is the safest fix because:

1. It's a one-line change
2. It makes RIS behave identically to PAR and ICS
3. It doesn't break existing PAR/ICS flows
4. For quantity-1 items (the reported bug scenario), it "just works"
5. The design spec says "default to 0" but PAR/ICS already don't follow this — making RIS match them is more pragmatically correct than enforcing the spec and breaking the other two
