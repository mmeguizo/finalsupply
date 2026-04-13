# Modal Flicker Bug — PAR / ICS / RIS Multi-Item Assignment Modals

## Bug Summary

When the user clicks Submit (e.g. "GENERATE PAR ID & SAVE") in any multi-item assignment modal, the modal **briefly closes → reopens → then closes again**. It should close only once.

---

## Root Cause

**The parent page replaces the entire DOM with `<CircularProgress />` during refetch, which unmounts the modal mid-flight.**

Three ingredients combine to create the flicker:

### Ingredient 1: `notifyOnNetworkStatusChange: true` + `cache-and-network` fetch policy

All three parent pages use the same query configuration:

| Parent Page | File                                 | Line     |
| ----------- | ------------------------------------ | -------- |
| PAR         | `app/src/pages/issueanceParPage.tsx` | L33–38   |
| ICS         | `app/src/pages/issuanceIcsPage.tsx`  | L39–46   |
| RIS         | `app/src/pages/issuanceRisPage.tsx`  | L335–342 |

```js
const { data, loading, error, refetch } = useQuery(QUERY, {
  fetchPolicy: 'cache-and-network',
  nextFetchPolicy: 'cache-first',
  notifyOnNetworkStatusChange: true, // <-- This causes loading=true during refetch
});
```

With `notifyOnNetworkStatusChange: true`, Apollo sets `loading = true` whenever the network status changes — including during a `refetch()`. Normally with `cache-and-network`, `loading` stays `false` during refetch (data is served from cache), but `notifyOnNetworkStatusChange` overrides this behavior.

### Ingredient 2: Early return replaces entire page with spinner

All three parent pages have this guard:

| Parent Page | File                                 | Line |
| ----------- | ------------------------------------ | ---- |
| PAR         | `app/src/pages/issueanceParPage.tsx` | L194 |
| ICS         | `app/src/pages/issuanceIcsPage.tsx`  | L250 |
| RIS         | `app/src/pages/issuanceRisPage.tsx`  | L570 |

```js
if (loading) return <CircularProgress />;
```

When `loading` becomes `true` during a refetch, **the entire page — including the modal — is replaced by a spinner**. The modal gets unmounted.

### Ingredient 3: Double refetch after mutation

Each modal's submit handler triggers refetch **twice**:

1. **Via `refetchQueries` on the mutation** (configured in the modal):

   ```js
   // e.g. MultiParAssignmentModal.tsx L109–112
   const [createMultiPAR] = useMutation(CREATE_MULTI_ITEM_PAR_ASSIGNMENT, {
     refetchQueries: [{ query: GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY }],
   });
   ```

2. **Via `onAssignmentComplete()` in the parent** which calls `refetch()` again:
   ```js
   // e.g. issueanceParPage.tsx L166
   const handleMultiAssignmentComplete = () => {
     refetch();
   };
   ```

Both hit the same query, causing redundant network requests.

---

## Exact Flow When User Clicks Submit

Using PAR as the example (ICS and RIS are identical in structure):

### Step-by-step timeline

```
1. User clicks "GENERATE PAR ID & SAVE"
   → handleCreateNewPAR() called (MultiParAssignmentModal.tsx ~L282)

2. await createMultiPAR({...}) completes
   → Apollo processes refetchQueries → starts re-fetching
     GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY

3. Success path executes:
   → setSuccessMessage("PAR ID ... created!")
   → onAssignmentComplete()  →  parent's refetch()  (ANOTHER refetch)
   → setTimeout(() => { onClose() }, 1500)  is scheduled

4. The refetch causes parent's `loading` to become `true`
   (notifyOnNetworkStatusChange: true)

5. Parent renders: if (loading) return <CircularProgress />
   → ENTIRE PAGE replaced with spinner
   → Modal is UNMOUNTED (user sees modal disappear — CLOSE #1)

6. Network response arrives (~100-500ms later)
   → loading becomes false
   → Parent renders full page again
   → openMultiAssignModal is still `true` (nobody set it to false yet)
   → Modal REMOUNTS and appears again (REOPEN)

7. 1.5 seconds after step 3, setTimeout fires
   → onClose() → handleCloseMultiAssignModal()
   → setOpenMultiAssignModal(false)
   → Modal closes for real (CLOSE #2)
```

**Result: close → reopen → close = the flicker the user sees.**

---

## Modal Architecture (for reference)

All three modals are **controlled** — the `open` prop comes from the parent:

| Modal Component           | `open` prop source                                     | `onClose` calls                      |
| ------------------------- | ------------------------------------------------------ | ------------------------------------ |
| `MultiParAssignmentModal` | `openMultiAssignModal` state in `issueanceParPage.tsx` | `handleCloseMultiAssignModal` (L158) |
| `MultiIcsAssignmentModal` | `openMultiAssignModal` state in `issuanceIcsPage.tsx`  | `handleCloseMultiAssignModal` (L192) |
| `MultiRisAssignmentModal` | `openMultiAssignModal` state in `issuanceRisPage.tsx`  | `handleCloseMultiAssignModal` (L438) |

The `onClose` functions in all parents follow the same pattern — set the open state to `false` and clear the passed-in data:

```js
const handleCloseMultiAssignModal = () => {
  setOpenMultiAssignModal(false);
  setMultiAssignPOItems([]);
  setMultiAssignPreSelected([]);
  setMultiAssignExistingXXXItems([]);
};
```

---

## Recommended Fix

### Fix 1 (Primary — Required): Change loading guard in all 3 parent pages

**Don't replace the page with a spinner during refetches — only on initial load when there's no data.**

Change:

```js
if (loading) return <CircularProgress />;
```

To:

```js
if (loading && !data) return <CircularProgress />;
```

**Files to change:**

| File                                 | Line |
| ------------------------------------ | ---- |
| `app/src/pages/issueanceParPage.tsx` | L194 |
| `app/src/pages/issuanceIcsPage.tsx`  | L250 |
| `app/src/pages/issuanceRisPage.tsx`  | L570 |

**Why this works:** On initial load, `data` is `undefined` and `loading` is `true` → spinner shows. On refetch, `data` already exists (from cache) so `loading && !data` is `false` → page stays rendered → modal stays mounted → no flicker.

### Fix 2 (Cleanup — Recommended): Remove redundant double-refetch

Each mutation already has `refetchQueries` configured, so the parent's `onAssignmentComplete` callback calling `refetch()` is redundant. Pick ONE approach:

**Option A: Remove `refetchQueries` from mutations, keep parent `refetch()`**

```js
// In each modal — remove refetchQueries
const [createMultiPAR] = useMutation(CREATE_MULTI_ITEM_PAR_ASSIGNMENT);
// Parent onAssignmentComplete still calls refetch()
```

**Option B (Preferred): Keep `refetchQueries`, remove manual `refetch()` from parent**

```js
// In each parent page
const handleMultiAssignmentComplete = () => {
  // refetch() removed — mutation's refetchQueries handles it
};
```

Option B is preferred because `refetchQueries` is cleaner and guarantees the refetch happens even if the callback isn't called.

### Fix 3 (Optional): Remove setTimeout delay for onClose

The 1.5-second delay to show the success message before closing is what creates the window for the flicker. If the modal closed immediately, the flicker window shrinks. Consider using a Snackbar/toast notification instead of an in-modal success message:

```js
// Instead of:
onAssignmentComplete();
setTimeout(() => {
  setSuccessMessage('');
  onClose();
}, 1500);

// Use:
onAssignmentComplete();
onClose();
// Show success via a Snackbar in the parent
```

---

## Affected Files Summary

### Modal components (submit handlers — lines with onAssignmentComplete + setTimeout + onClose):

| File                                             | "New" handler | "Add to Existing" handler | "Split" handler |
| ------------------------------------------------ | ------------- | ------------------------- | --------------- |
| `app/src/components/MultiParAssignmentModal.tsx` | L341–346      | L395–400                  | L503–508        |
| `app/src/components/MultiIcsAssignmentModal.tsx` | L341–346      | L395–400                  | L503–508        |
| `app/src/components/MultiRisAssignmentModal.tsx` | L332–337      | L386–391                  | L494–499        |

### Parent pages (loading guard + onAssignmentComplete):

| File                                 | Loading guard | onAssignmentComplete |
| ------------------------------------ | ------------- | -------------------- |
| `app/src/pages/issueanceParPage.tsx` | L194          | L165–167             |
| `app/src/pages/issuanceIcsPage.tsx`  | L250          | L199–201             |
| `app/src/pages/issuanceRisPage.tsx`  | L570          | L451–453             |

---

## Why This Pattern Is Dangerous (Learning Note)

This is a common React + Apollo anti-pattern. The rule of thumb:

> **Never use `if (loading) return <Spinner />` if your query can be refetched while dialogs/modals are open.**

`loading` is `true` for BOTH initial loads and refetches. Replacing the entire tree during a refetch unmounts any open dialogs, popovers, tooltips, etc. Always guard with `if (loading && !data)` to only show a full-page spinner when there's genuinely nothing to show yet.

The `notifyOnNetworkStatusChange: true` option amplifies this because it causes `loading` to be `true` even during background refetches that would otherwise be silent.
