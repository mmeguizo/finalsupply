# In-app user guide execution plan

**Prepared:** 2026-07-21  
**Scope:** Implement a beginner-friendly, authenticated in-app manual for the existing supply-management application. This is an execution specification, not application code.

## Read this before coding

1. Read this document's **Progress ledger** first, then run `git status --short` from `C:\Users\markm\Desktop\FINAL SUPPLY`.
2. Work on exactly one `UG-*` task in a short session. Do not combine workflow chapters with route/sidebar work.
3. Preserve unrelated user work. At preparation time these files were already modified and are outside this plan: `app/src/components/printReportModal.tsx`, `printReportModalForICS.tsx`, `printReportModalForNC.tsx`, `printReportModalForPAR.tsx`, `printReportModalForRIS.tsx`, and `printingForReports.tsx`.
4. Before changing a file, re-read it and compare it with the scope below. Do not overwrite another agent's changes; integrate or stop and record a conflict in the ledger.
5. Immediately update the same ledger row when a task finishes, before ending the session. Include the date, executor/session ID, files, exact validation result, and next task.
6. Do not claim business rules that are not implemented. Use **Confirm with supply administrator** callouts for every item listed in “Business decisions to confirm.”

### Safe timeout/new-session resume

After a timeout, begin with the ledger and `git diff -- <task files>`. If a task is `IN_PROGRESS`, inspect its partial changes, run its listed validation, and either finish it or revert **only your identifiable partial changes** after recording why. Never reset, clean, stash, or reformat the repository to recover. Mark a task `BLOCKED` rather than guessing about an ambiguous conflict or business rule.

## Verified architecture and product inventory

The frontend is a React 19/TypeScript/Vite SPA using React Router, Toolpad `ReactRouterAppProvider`, MUI, Apollo Client, and Zustand (`app/package.json:5-40`). The API is Node/Express/Apollo/Sequelize/MySQL (`api/package.json:5-42`). Apollo uses cookie credentials (`app/src/apollo/client.ts:5-15`).

The current application shell is authenticated `DashboardLayout` plus `PageContainer` (`app/src/layouts/dashboard.tsx:7-25`). Toolpad receives the role-filtered navigation from `AppContent` (`app/src/auth/components/AppContent.tsx:11-36`). The current sidebar contains Dashboard, PO Monitoring, Generate IAR, Issuance children, Signatories, Department, Users/Roles, and Histories (`app/src/navigation/routes.ts:27-125`). Existing routes are declared centrally in `app/src/router/routes.tsx:28-179`; access is checked in `app/src/auth/protected.tsx:12-28` against `app/src/auth/config/role.ts:2-19`.

The primary persistent chain is:

```text
PurchaseOrder 1 ──> many PurchaseOrderItems
                         │
                         └──> IAR rows (inspection_acceptance_report)
                                  ├── PAR issuance clones / parId
                                  ├── ICS issuance clones / icsId
                                  ├── RIS issuance clones / risId
                                  └── no-category issuance clones / ncId
```

IAR rows retain foreign keys to the source PO and PO item (`api/models/inspectionacceptancereport.js:28-48`), and the ORM associations confirm those two links (`api/models/associations.js:6-23`). Assignment/split metadata is stored on IAR rows (`recordType`, `splitGroupId`, `splitFromItemId`, and `splitIndex`; `api/models/inspectionacceptancereport.js:281-310`). This is the data flow to explain; do not describe issuance as an unrelated inventory list.

## Placement recommendation

### Implement a dedicated, authenticated sidebar entry: **Help & User Guide**

Add a bottom-level sidebar entry (after `Histories`, preferably under a `Help` header) with segment `guide`, title **Help & User Guide**, and `HelpOutline`/equivalent existing MUI icon. Add a `/guide` protected child route and `guide: ['admin', 'user']` to the authoritative `app/src/auth/config/role.ts` map.

**Why this is the best fit**

* The app already uses Toolpad navigation as the durable way to move between operational pages (`ALL_NAVIGATION`), and the shell remains visible through all authenticated routes. A guide route therefore stays discoverable during PO, IAR, and issuance work.
* Both current UI roles can reach the operational routes, while admin-only administration is already represented by role filtering. Making the guide available to both roles is compatible with the existing mapping rather than hiding critical instructions from a `user`.
* It keeps the manual in the same authenticated SPA and avoids a new external hosting/permission model. It also lets documentation deep-link to verified paths such as `/purchaseorder`, `/inventory`, and `/issuance/issuance-ris`.

**Rejected alternatives**

1. **A static README, external wiki, or `docs/`-only manual:** not accessible from app navigation and not available at the point of work. Keep this execution document in `docs/`, but it is not the end-user guide.
2. **A dashboard card only:** helpful as a secondary shortcut later, but it is not persistent once the user leaves Dashboard and duplicates navigation.
3. **A floating “?” button/modal:** difficult to give durable URLs, search, headings, browser back behavior, printable procedures, and keyboard navigation; it also competes with the app's many dialogs.
4. **Help nested under Users or Issuance:** wrongly implies administration or only issuance users need it. The guide covers PO through printing.
5. **Public `/guide` beside `/sign-in`:** procedures expose operational process details and must not be more broadly available than the app. The existing shell already redirects unauthenticated users.

### Route and navigation acceptance shape

The future implementation must add, not replace, the current sidebar:

```ts
// navigation/routes.ts — new final section
{ kind: 'divider' },
{ kind: 'header', title: 'Help' },
{ segment: 'guide', title: 'Help & User Guide', icon: React.createElement(HelpOutlineIcon) }

// auth/config/role.ts
guide: ['admin', 'user']

// router/routes.tsx beneath the authenticated Layout children
{ path: '/guide', Component: UserGuidePage, element: <ProtectedRoute routePath="guide" /> }
```

Re-check Toolpad's installed navigation type before using a divider; if the version does not accept it, omit only the divider and retain the Help header/entry. Do not add an unprotected duplicate route.

## Guide information architecture and content contract

The guide page must be written for a new user and use plain language: define a term before abbreviating it, use short numbered actions, put irreversible actions in warnings, and use exact current labels in bold. Content must remain truthful when a role lacks the relevant page: explain that the menu may be unavailable and instruct the user to contact an administrator.

### Page-level navigation

1. **Welcome / Quick start**
2. **How information moves through the system**
3. **Glossary and IDs**
4. **Access, roles, and sign-in**
5. **Purchase orders, item management, and receiving**
6. **Inspection Acceptance Reports (IAR)**
7. **Issuance: PAR**
8. **Issuance: ICS**
9. **Issuance: RIS**
10. **Issuance: No Category ticket**
11. **Printing, exports, and browser setup**
12. **Administration, histories, and dashboard**
13. **Troubleshooting and support**

Provide a search input that filters section titles, keywords, and steps; a keyboard-operable table of contents with fragment links; a visible “no matches” result; and `aria-live="polite"` feedback for filter status. Search is navigation only: it must not query GraphQL or change operational data.

### Quick start

Explain this safe first-time sequence:

1. Sign in with the email and password supplied by an administrator.
2. Open **Help & User Guide** from the sidebar and read the data-flow diagram.
3. Open **PO Monitoring** to find the purchase order and inspect item quantities/status.
4. Generate an IAR only for actual received quantity.
5. Open the appropriate issuance section only after the IAR item is categorized and available.
6. Preview every document before choosing **Print Report**; allow browser print dialogs/pop-ups/iframes.
7. Use **Histories** (admin navigation) and the PO item history action to review recorded changes, not as a way to undo them.

Include a first-time warning: do not create dummy POs, fabricate receipt quantities, or use a document ID from another record to “test” the system.

### Glossary

Define only implemented concepts:

| Term | Beginner definition |
|---|---|
| PO | Purchase Order: the source order, supplier data, and planned item quantities. |
| PO item | One line in a PO, with quantity, unit, cost, amount, category, and receipt/delivery state. |
| IAR | Inspection Acceptance Report: received PO-item quantities grouped under one IAR ID. |
| PAR | Property Acknowledgement Receipt issuance document/ID. |
| ICS | Inventory Custodian Slip issuance document/ID. ICS source items require a Low/High tag before IAR generation. |
| RIS | Requisition and Issue Slip issuance document/ID. |
| NC / No Category | A received IAR item with no PAR/ICS/RIS category. Assigning creates an NC ticket ID. |
| Available quantity | Current `actualQuantityReceived` available on the relevant source IAR row. It limits assignments. |
| Issuance clone | The record made for an assigned/split issuance quantity; it keeps traceability to the source IAR row. |
| Department / division | Destination data collected by issuance flows. RIS has a division field; current choices are shown by the app. |
| Signatory selection | Names chosen on a page for a print form. These selections are stored in the browser's persisted Zustand state (`app/src/stores/signatoryStore.tsx:7-106`). |

### Access, roles, and sign-in

Document the observed behavior, not an aspirational permission model:

* Credentials are submitted through the sign-in page and server login mutation (`app/src/pages/signIn.tsx:16-37`, `app/src/auth/LoginService.ts:6-36`); browser session UI is persisted locally and requests include the server session cookie.
* The sidebar and frontend route map show Dashboard/PO/IAR/Issuance to `admin` and `user`, while Signatories, Department, Roles, Users, and Histories are listed as `admin` only (`app/src/auth/config/role.ts:2-19`).
* Server authorization remains the authority. The API has `requireAuthenticated`/`requireRole`, ownership checks, and an admin bypass (`api/auth/authorization.js:4-80`). Do not tell users that hiding a sidebar item is security.
* Sign out returns to `/sign-in` and clears the browser session (`app/src/auth/hooks/useAuth.tsx:14-18`).

**Confirm with supply administrator:** which real people are permitted to create POs, receive goods, assign PAR/ICS/RIS/NC, print official copies, change document details, and administer users. Current application roles alone do not express those job-specific duties.

### Workflow chapters

Each workflow chapter must have these subheads: **Use when**, **Before you start**, **Steps**, **What changes in the data**, **Corrections and limits**, **Print/export**, **Common mistakes**, and **Troubleshooting**.

#### Purchase order creation, item management, and delivery tracking

**Verified interface:** PO Monitoring is `/purchaseorder`; it lists POs, exposes quick filter, add/export/print toolbar actions, an item grid, row actions for edit/history/print/overview, and a Generate IAR button for POs with remaining quantity (`app/src/pages/purchaseorder.tsx:71-172,273-560`). PO model fields include supplier, dates, delivery/payment terms, campus, fund source, invoice, and items (`api/models/purchaseorder.js:13-112`). The toolbar's **Add Purchase Order** action opens the add modal and calls the add mutation (`app/src/pages/purchaseorder.tsx:102-111,292-295,395-420`).

**Steps**

1. Open **PO Monitoring** and use the grid filter or select a PO row.
2. To create a PO, choose **Add Purchase Order** only when the supply administrator has confirmed the current form is usable for your role. The add action is wired, but the inspected modal currently disables PO number, supplier, address, place of delivery, and payment date even in add mode (`app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx:264-322`); do **not** publish field-by-field creation instructions until a real authorized test verifies the current path.
3. Open the overview to inspect supplier, dates, status, delivery progress, category breakdown, and item totals. The overview is informational (`app/src/components/PurchaseOrderOverview.tsx:60-405`).
4. For a permitted correction, choose the PO edit action. For a completed PO, acknowledge the confirmation; the current UI resets the edited PO to pending (`app/src/pages/purchaseorder.tsx:297-315,395-404`).
5. In the item grid, edit only description/unit where allowed. Completed POs and fully delivered/received items are blocked (`app/src/pages/purchaseorder.tsx:209-254,530-555`).
6. Use the delivery-status control only to record the actual delivery state. Delivery tracking is separate from IAR receipt quantity (`api/models/purchaseorderitems.js:100-114`).
7. Use the PO history action to inspect changes by item, change type, previous/new quantities, actor, reason, and time (`app/src/components/purchaseorderhistorymodel.tsx:31-209`).
8. Use the toolbar export/print only after checking the intended selected PO vs all POs.

**Data and correction rules**

* A PO owns many PO items; PO item receipt quantities feed IAR generation.
* Item amount is calculated from quantity × unit cost in the edit form (`app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx:179-205`).
* Existing populated basic PO fields are disabled in the current edit form; the invoice and receiving/item workflow are the normal editable path (`app/src/pages/purchaseOrderFunctions/purchaseordermodel.tsx:71-76,264-322`).
* Do not state that delete permanently erases data: the model has `isDeleted`, but retention and user-facing delete semantics must be confirmed.

**Warnings/common mistakes**

* Do not mark delivery, enter receipt quantity, and generate an IAR as though they are the same action.
* Do not receive more than the PO item's remaining quantity.
* Do not edit a completed PO merely to make a cosmetic correction without approval, because the UI changes it back to pending.

#### Generate, edit, print, and revert IAR

**Verified interface:** `/inventory` is labelled **Generate IAR** in navigation. It groups rows by IAR ID, supports search and pagination, lets users choose an eligible PO, and opens `GenerateIarModal` (`app/src/pages/inventory.tsx:831-1170,1175-1331`).

**Steps**

1. Open **Generate IAR**. Either select a PO in **PO Monitoring** then choose **Generate IAR**, or choose **Generate IAR** on the IAR page and select an eligible PO.
2. In the modal, select each delivered item and enter its receipt quantity. The UI clamps the quantity to the remaining amount; fully received lines are disabled (`app/src/components/GenerateIarModal.tsx:66-193,294-390`).
3. Set the category for each selected received item: PAR, ICS, RIS, or no category. For ICS, choose **Low** or **High**; the form rejects an ICS item without a tag (`app/src/components/GenerateIarModal.tsx:102-120,155-186`).
4. Review the optional invoice number and click **Generate IAR**. At least one selected line with received quantity greater than zero is required.
5. On the IAR list, expand the row to review source items. Enter IAR invoice, invoice date, income, MDS, and details using the visible save behavior: Enter for invoice/income/MDS, change for date, and Shift+Enter for Details (`app/src/pages/inventory.tsx:263-461`).
6. Choose the preview/print icon, select the IAR signatories, optionally enter End User and PO Details, review the preview, then choose **Print Report** (`app/src/components/printReportModalForIAR.tsx:31-180`).
7. Use **Revert** only after checking the IAR ID. The confirmation says it rolls back received quantities and hides IAR entries; it is disabled for completed POs (`app/src/pages/inventory.tsx:476-490,1266-1269`).

**Data and correction rules**

* `generateIARFromPO` creates IAR rows linked to PO and PO item, receives selected quantities, and returns a shared IAR ID (`api/typeDefs/inspectionacceptancereport.typeDef.js:248-261`; resolver `api/resolvers/inspectionacceptancereport.resolver.js:527`).
* IAR-specific invoice/invoice date/income/MDS/details are different from PO fields (`api/models/inspectionacceptancereport.js:116-145`).
* The Add Line control creates a distinct receipt line from an existing source item with the same logical item group and clamps it to remaining quantity (`app/src/pages/inventory.tsx:534-665`). Explain it only as a receipt-line correction; do not call it a general new-item creator.
* IAR PO Details in the print dialog persist in browser local storage per item-ID set, not the server (`app/src/components/printReportModalForIAR.tsx:44-63,153-170`). Clearing browser data/device changes can lose them.

**Confirm with supply administrator:** when an IAR may be reverted after an official document is printed; required evidence for partial receipt; intended meaning of IAR status; and who approves details/income/MDS values.

#### PAR issuance

**Verified interface:** `/issuance/issuance-par` groups PAR-eligible IAR data by PO and supports new, existing-ID, and split assignments (`app/src/pages/issueanceParPage.tsx:32-280`; `app/src/components/MultiParAssignmentModal.tsx:85-348`).

**Steps**

1. Open **Issuance → Issuance Par** and find the PO. Expand it to find an item without a PAR ID and positive available quantity.
2. Use **Assign PAR** for the PO or click an individual assignment chip. Enter/select item quantities and a department.
3. On **New PAR**, create one PAR ID for selected items. Quantity must be greater than zero and no greater than the available quantity.
4. On **Add to Existing**, select the existing PAR ID, source item, and quantity. This adds a clone to that ID; it does not merely relabel the source.
5. On **Split & Assign**, define each destination/department quantity so the total exactly matches the source quantity. Review the confirmation before submitting.
6. Select the page signatories, preview the PAR, add remarks/PO Details as appropriate, and choose **Print Report**.

**Data, corrections, and print**

* The multi-assignment modal calls create/add/split mutations and refreshes PAR data (`app/src/components/MultiParAssignmentModal.tsx:97-110,233-348`); server handlers are in `api/resolvers/propertyacknowledgementrepoert.resolver.js:253,517,646,805`.
* The current multi-PAR UI requires department; received-from/received-by mutation values are intentionally passed as empty strings (`app/src/components/MultiParAssignmentModal.tsx:258-275`). Do not instruct users to look for removed assignment-modal signatory fields.
* PAR remarks are persisted to the selected server IAR rows only when nonblank at print time. PAR PO Details are local-storage-only (`app/src/components/printReportModalForPAR.tsx:32-55,71-115,126-163`).
* Editing an already assigned PAR item opens the multi-assignment flow so the user can re-split, add, or create; call out that it changes quantities and needs careful review (`app/src/pages/issueanceParPage.tsx:115-166`).

#### ICS issuance

**Verified interface:** `/issuance/issuance-ics` groups ICS IAR rows by PO, supports assignment, print, multi-select, and individual edit behavior (`app/src/pages/issuanceIcsPage.tsx:40-334`).

**Steps**

1. Confirm the IAR item was generated as ICS and has the intended **Low** or **High** tag before issuance.
2. Open **Issuance → Issuance ICS**, expand the PO, then choose **Assign ICS** or click an item.
3. Create a new ICS using selected items/quantities and a department, add a line to an existing ICS ID, or split the available quantity among new ICS assignments. Do not exceed available quantity.
4. Choose signatories on the page, then preview/print the assigned item(s).
5. Enter Purpose and ICS Details before printing. Print a single item when Details must be saved for future use.

**Data, corrections, and print**

* The same new/add/split pattern uses ICS mutations (`app/src/components/MultiIcsAssignmentModal.tsx:92-105,235-348`; resolver `api/resolvers/inspectionacceptancereport.resolver.js:891,1173,1312`).
* Current multi-ICS creation requires department and validates quantity; tag comes from the IAR source, not from the assignment form (`app/src/components/MultiIcsAssignmentModal.tsx:219-230,237-277`).
* Purpose saves for printed selected items. ICS Details save to the database only for a single-item print; multi-select details are explicitly temporary (`app/src/components/printReportModalForICS.tsx:50-86,123-199`).
* The guide must say **Print individually to save ICS Details**, not suggest a multi-print will save the text.

#### RIS issuance

**Verified interface:** `/issuance/issuance-ris` supports grouped PO assignment, individual/selected printing, and RIS-ID search (`app/src/pages/issuanceRisPage.tsx:47-329,333-420`).

**Steps**

1. Open **Issuance → Issuance RIS**, find/expand a PO, and identify a positive-quantity item with no RIS ID.
2. Choose **Assign RIS**. For a new RIS, choose source items and valid quantities, enter department, and choose a division from the interface.
3. Use **Add to Existing** only after verifying the selected RIS ID and source item. Use **Split & Assign** only when every split quantity and recipient data is correct.
4. Search by RIS ID to find issued lines; select only issued (RIS-ID) lines for **Print Selected**.
5. Select page signatories, preview, enter Purpose/PO Details, and choose **Print Report**.

**Data, corrections, and print**

* Multi-RIS obtains active departments and uses a fixed current division list: Talisay Main, Alijis, Binalbagan, and Fortune Town (`app/src/components/MultiRisAssignmentModal.tsx:72-110,176-199`).
* It validates positive quantity, available quantity, and department before creating a new RIS (`app/src/components/MultiRisAssignmentModal.tsx:237-297`). The resolver handlers are `api/resolvers/requisitionissueslip.resolver.js:108,368,494,643`.
* Purpose saves to selected server items only when nonblank at print time. RIS PO Details are browser-local only (`app/src/components/printReportModalForRIS.tsx:31-59,61-105,114-150`).

#### No Category (NC) issuance ticket

**Verified interface:** `/issuance/issuance-nocat` lists IAR items whose category is null, groups them by PO, assigns an NC ID, and prints an NC document (`app/src/pages/issuanceNoCategoryPage.tsx:30-43,44-290`).

**Steps**

1. Use this section only for IAR items intentionally generated without PAR/ICS/RIS category.
2. Expand the PO and click the item’s NC assignment control.
3. Enter a quantity greater than zero and no greater than available; Purpose is optional.
4. Submit and record/review the returned NC ID. The UI auto-closes after success.
5. Select signatories, preview, enter a print purpose if needed, and print.

**Data, corrections, and print**

* The server creates an `issuance_clone`, assigns an NC ID, and reduces the source row quantity (`app/src/components/NcAssignmentModal.tsx:23-43,93-131`; resolver `api/resolvers/inspectionacceptancereport.resolver.js:1632`).
* The assignment modal does not permit editing an already assigned NC item (`app/src/components/NcAssignmentModal.tsx:188-237`).
* Current NC print purpose is preview/print input; its print dialog has no mutation to save that purpose (`app/src/components/printReportModalForNC.tsx:45-98,100-137`). State this clearly.

#### Printing, export, dashboard, history, and administration

* PO toolbar export produces a CSV and PO printing opens a browser window. Pop-up blocking prevents the print window (`app/src/utils/exportCsvpurchaseorderwithItems.ts:1`; `app/src/utils/printPurchaseOrderWithItems.ts:1-4`).
* IAR/PAR/RIS/ICS/NC document print uses a hidden iframe and `window.print()`, then closes the dialog. Explain that **Print Report** opens the browser print dialog; it does not prove a physical copy was printed (`app/src/components/printReportModalForIAR.tsx:81-118`, `printReportModalForPAR.tsx:71-112`, `printReportModalForRIS.tsx:61-102`, `printReportModalForICS.tsx:72-117`).
* Dashboard cards/charts summarize users, POs, items, amounts, monthly POs, and category distribution (`app/src/pages/index.tsx:20-191`). They are informational, not a receiving/issuance action.
* Admin pages manage departments, signatories, users, and roles. Department CRUD is at `app/src/pages/department.tsx:37-280`; Signatory CRUD is at `app/src/pages/signatories.tsx:42-371`; User CRUD is at `app/src/pages/users.tsx:27-305`; Role CRUD is at `app/src/pages/role.tsx:38-241`.
* The **Histories** screen lets users search and inspect recorded PO-item history including IAR/PAR/RIS/ICS IDs, actor, reason, quantities, and time; it is an audit viewer, not an undo function (`app/src/pages/histories.tsx:52-233`).

### Troubleshooting and support placeholders

Add a final guide section with these concrete first checks:

| Symptom | Safe first action |
|---|---|
| I cannot see a menu item | Check role/access; do not use another user's account. Contact the administrator. |
| A PO is absent from IAR selector | Check it is not completed, has a non-deleted item, and has remaining quantity; the selector deliberately filters otherwise (`app/src/pages/inventory.tsx:950-962`). |
| Quantity is rejected | Compare entered value to displayed available/remaining value; do not split across documents until totals are confirmed. |
| Assignment ID is not shown | Refresh only after waiting for the success/error message; capture PO/IAR/item ID and error text for support. |
| Print dialog does not open | Allow pop-ups/print dialogs for the app, then retry from the preview. Do not submit the assignment again merely because printing failed. |
| Details disappeared | IAR/PAR/RIS PO Details are browser-local; use the same browser/device or re-enter them. ICS details persist only for individual print. |
| Need to correct an official document | Stop and follow local approval policy; use the documented correction/revert path only if authorized. |

Use placeholders, not invented contacts:

```text
Supply-system owner: [name / email / phone]
Functional approver for corrections: [role / contact]
Technical support: [service desk / email]
Include in a ticket: user email, URL/page, PO number, IAR/PAR/ICS/RIS/NC ID, item ID,
time/time zone, exact error, and screenshot with confidential values redacted.
```

## Business decisions to confirm before publishing wording

1. Official definitions, retention rules, approval authority, and allowed correction path for PO, IAR, PAR, ICS, RIS, and NC documents.
2. Whether category selection is controlled by policy and when an item may intentionally remain no category.
3. Official Low/High ICS classification rule; the code requires a tag but does not define the business threshold.
4. Who may use revert, reassign, split, and add-to-existing-document operations after a form is printed.
5. Whether the department text in PAR/ICS is free text by policy and whether RIS's fixed division options remain authoritative.
6. Whether current user names/signatories are sufficient on official forms and the required print/copy distribution.
7. Whether PO/IAR print “PO Details” must become server-persisted; today IAR/PAR/RIS use browser local storage.
8. The actual support contacts and escalation service levels.

## Maintainable implementation pattern

Use **typed structured content plus small React rendering components**, not MDX and not a giant page of JSX:

* Add `app/src/content/userGuideContent.ts` for typed `GuideSection`/`GuideStep` data, glossary records, warnings, support placeholders, and workflow metadata.
* Add `app/src/pages/userGuide.tsx` as a thin page composition shell. If necessary, add narrowly scoped presentational components under `app/src/components/userGuide/` (for example `GuideSearch`, `GuideToc`, `GuideSection`, and `GuideCallout`).
* Keep executable links as route constants/strings in the structured content and render them with React Router links. Validate every internal href against `router/routes.tsx`.
* Do not put workflow facts in comments, duplicate them in navigation, or fetch manual text from GraphQL. Version-controlled static content is searchable, reviewable, and matches this app's existing TypeScript/MUI architecture. The project has no MDX dependency or content pipeline (`app/package.json:10-40`).
* Keep one source of truth for repeated caveats (e.g., local-storage print details and no extra server-side document state).

### Responsive and accessibility requirements

* Use semantic `main`, `nav`, headings in one unbroken hierarchy, ordered lists for procedures, real MUI `Button`/`Link` components for actions, and visible keyboard focus. Never make a `div` clickable.
* Give the guide search an explicit label; give TOC navigation an `aria-label`; mark the active section with `aria-current`; use programmatic heading focus after TOC navigation only if needed.
* The sidebar must remain usable in Toolpad's collapsed/mobile drawer. The guide itself must be single-column on small screens, use `maxWidth`, wrap long identifiers, and avoid tables wider than the viewport. Convert dense data relationships into cards/list patterns on narrow screens.
* Do not rely on color alone for warnings, completed state, or search matching. Use icons/text and MUI alert semantics.
* Test keyboard tab/shift-tab/Enter/Space/Escape, 200% zoom, narrow 320px viewport, and a screen-reader heading/landmark pass.

### Screenshots and images

Do not use screenshots in the first implementation. Repository inspection found only `app/public/vite.svg` and `app/public/chmsu-logo.png`; neither is a workflow screenshot. Do not create fake images, borrow production data, or add empty image frames. A later approved screenshot task may add sanitized, versioned assets with descriptive alt text, source/date, and a review process; it must not block text-first guidance.

## Progress ledger

**Mandatory update rule:** every executor updates this exact table immediately after completing, blocking, or handing off a task. `Status` begins as `NOT_STARTED`; permitted values are `NOT_STARTED`, `IN_PROGRESS`, `DONE`, and `BLOCKED`.

| Task | Status | Date | Executor/session | Files changed | Validation result | Notes / next task |
|---|---|---|---|---|---|---|
| UG-01 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts`, `app/src/pages/userGuide.tsx` | `npm run build` succeeds with no errors. Page renders 4 guide sections (welcome, data-flow, glossary, access-and-roles). GuideSection/GuideStep/GuideCallout types exported. | Route/sidebar integration in UG-02 |
| UG-02 | DONE | 2026-07-21 | opencode | `app/src/navigation/routes.ts`, `app/src/auth/config/role.ts`, `app/src/router/routes.tsx` | `npm run build` succeeds. Sidebar shows Help & User Guide for both roles; route protected. | Search/TOC/responsiveness in UG-03 |
| UG-03 | DONE | 2026-07-21 | opencode | `app/src/pages/userGuide.tsx` | `npm run build` succeeds. Search filters by title/keyword/step text; TOC with fragment links; no-match state; mobile-responsive layout; keyboard and aria attributes. | Content sections in UG-04 |
| UG-04 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. Welcome, data-flow, glossary, access-and-roles sections enriched with full plan content, acronym expansions, confirm callout, route links. | PO workflow content in UG-05 |
| UG-05 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. PO section with creation caveat, item editing, delivery tracking separation, history audit, export/print, completed-PO reset warning. | IAR workflow content in UG-06 |
| UG-06 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. IAR section with PO selection, category/tag prerequisites, save-key behavior, Add Line as correction, browser-local PO Details warning, revert caution. | Inventory issuance content in UG-07 |
| UG-02 | NOT_STARTED | — | — | — | — | Route/sidebar integration; depends UG-01 |
| UG-03 | NOT_STARTED | — | — | — | — | Responsive/a11y TOC/search; depends UG-01, UG-02 |
| UG-04 | NOT_STARTED | — | — | — | — | Welcome, glossary, data-flow, auth/roles; depends UG-01 |
| UG-05 | NOT_STARTED | — | — | — | — | PO workflow content; depends UG-01 |
| UG-06 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. | Inventory issuance content in UG-07 |
| UG-07 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. PAR section with New/Add to Existing/Split & Assign tabs, clone caveat, page-signatory note, remarks persistence note. | ICS workflow content in UG-08 |
| UG-08 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. ICS section with Low/High tag prerequisite, assignment tabs, single-print Details persistence warning. | RIS workflow content in UG-09 |
| UG-09 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. RIS section with division list, New/Add/Split flows, print-selected requirement, Purpose/PO Details persistence. | NC, printing, admin, history, support in UG-10 |
| UG-10 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. NC, printing/export, dashboard/admin/history, and troubleshooting sections added. | Editorial review in UG-11 |
| UG-11 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. Fixed NC sidebar label to "No Category", added MDS glossary entry, verified all route links and persistence warnings against source. | Build + a11y/mobile smoke test in UG-12 |
| UG-12 | DONE | 2026-07-21 | opencode | `app/src/content/userGuideContent.ts` | `npm run build` succeeds. `git diff --check` clean (CRLF warnings only). Route protection correct: `/guide` protected, both admin+user roles authorized, logged-out redirects to `/sign-in`. All 6 files are intended guide-only changes. | — |

## Ordered short-session implementation backlog

### UG-01 — Create guide content foundation

* **Status:** DONE
* **Scope/files/symbols:** Add `app/src/content/userGuideContent.ts`; add `app/src/pages/userGuide.tsx`; introduce exported `GuideSection`, `GuideStep`, `GuideCallout` types and a minimal `UserGuidePage`.
* **Exact steps:**
  1. Re-read this plan and current route/navigation files; check the ledger and git status.
  2. Create a typed content shape with section id, title, summary, keywords, ordered steps, warnings, and optional internal links.
  3. Add only a renderable page shell with page title, introductory text, and an empty/placeholder-safe content array. Do not add the route/sidebar yet.
  4. Use MUI and React Router already installed; add no dependencies.
* **Acceptance criteria:** TypeScript compiles; page is importable; guide prose has one structured source; no operational behavior changes.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** none.
* **Estimated effort:** 20–35 minutes.
* **Handoff/rollback:** Record new files in ledger. If blocked, delete only newly created guide files; do not touch existing navigation.

### UG-02 — Add protected sidebar guide entry and route

* **Status:** DONE
* **Scope/files/symbols:** `app/src/navigation/routes.ts` (`ALL_NAVIGATION`), `app/src/auth/config/role.ts` (`ROUTE_ROLES`), `app/src/router/routes.tsx` (authenticated `Layout` children), and guide-page import.
* **Exact steps:**
  1. Confirm UG-01 is DONE and inspect current route syntax.
  2. Import one existing MUI Help icon, add `Help`/`Help & User Guide` after Histories without changing existing item order or access.
  3. Add `guide: ['admin', 'user']`; add exactly one protected `/guide` route under `Layout`.
  4. Verify direct `/guide` is redirected to sign-in when logged out and appears for both permitted roles when logged in.
* **Acceptance criteria:** sidebar entry is visible to both configured roles; unauthenticated direct access follows existing protection; no existing routes regress.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-01.
* **Estimated effort:** 15–25 minutes.
* **Handoff/rollback:** Revert only three route/navigation edits if needed; retain UG-01 files.

### UG-03 — Implement guide search, TOC, responsiveness, and accessibility

* **Status:** DONE
* **Scope/files/symbols:** `app/src/pages/userGuide.tsx`; optionally new files in `app/src/components/userGuide/` only.
* **Exact steps:**
  1. Build client-only filtering from structured title/keyword/step text; do not fetch data.
  2. Render semantic TOC links to section IDs and an accessible no-match state.
  3. Add mobile-safe single-column layout, non-overflowing callouts, keyboard-visible focus, and responsive heading/TOC styles.
  4. Manually test 320px width, 200% zoom, and keyboard navigation.
* **Acceptance criteria:** every published section can be reached by TOC/fragment; keyboard-only search/navigation works; no horizontal guide overflow at 320px.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-01, UG-02.
* **Estimated effort:** 30–45 minutes.
* **Handoff/rollback:** Keep content model intact; revert only renderer/component changes if behavior fails.

### UG-04 — Add onboarding, glossary, flow, and access content

* **Status:** DONE
* **Scope/files/symbols:** `app/src/content/userGuideContent.ts` sections `quick-start`, `data-flow`, `glossary`, `access-and-roles`.
* **Exact steps:**
  1. Copy the verified content contract above into structured, beginner-friendly sections; preserve explicit confirm callouts.
  2. Add route links only for current verified routes.
  3. Explain browser-local signatory selection and authenticated access without exposing implementation-only credentials/session detail.
  4. Check every acronym is expanded on first use.
* **Acceptance criteria:** new users can identify the PO → IAR → issuance flow and know that missing menus require authorized access; no unverified role duty is asserted.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-01.
* **Estimated effort:** 25–40 minutes.
* **Handoff/rollback:** Content-only change; revert only these section records if factual review rejects them.

### UG-05 — Add purchase-order workflow content

* **Status:** DONE
* **Scope/files/symbols:** `app/src/content/userGuideContent.ts` PO section only; validate against `pages/purchaseorder.tsx`, `components/PurchaseOrderOverview.tsx`, `components/purchaseorderhistorymodel.tsx`.
* **Exact steps:**
  1. Add prerequisites, the verification-gated manual PO-creation note, and numbered PO monitoring/item-edit/delivery/history/export/print steps from this plan.
  2. Include relation to PO items and IAR eligibility, correction restrictions, and completed-PO warning.
  3. Add troubleshooting for unavailable item edits and print/export selection.
  4. Do not document unsupported creation fields or delete retention claims.
* **Acceptance criteria:** content separates delivery status from receipt/IAR actions and warns about completed-PO reset behavior.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-01.
* **Estimated effort:** 25–35 minutes.
* **Handoff/rollback:** Change only PO content records; no page/router changes.

### UG-06 — Add IAR and inventory workflow content

* **Status:** DONE
* **Scope/files/symbols:** `app/src/content/userGuideContent.ts` IAR section only; validate against `pages/inventory.tsx`, `components/GenerateIarModal.tsx`, `components/printReportModalForIAR.tsx`.
* **Exact steps:**
  1. Add PO selection, selected-line/category/tag/quantity steps and exact save-key behavior.
  2. Add IAR data relationships, print effects, browser-local PO Details warning, and revert warning.
  3. Include Add Line narrowly as a receipt-line correction and retain unknown-policy callouts.
  4. Verify every button/key label against current components.
* **Acceptance criteria:** guide explains partial receipts, ICS tag prerequisite, print behavior, and no speculative IAR policy.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-01.
* **Estimated effort:** 30–45 minutes.
* **Handoff/rollback:** Content-only. Do not alter the currently modified print modal files.

### UG-07 — Add PAR workflow content

* **Status:** DONE
* **Scope/files/symbols:** `app/src/content/userGuideContent.ts` PAR section only; validate against `pages/issueanceParPage.tsx`, `components/MultiParAssignmentModal.tsx`, `components/printReportModalForPAR.tsx`.
* **Exact steps:**
  1. Add New PAR, Add to Existing, Split & Assign, department, correction, and print instructions.
  2. Explain available quantity, clone behavior, quantity validation, server-persisted remarks, and local-only PO Details.
  3. Explicitly state that signatory fields are not in current assignment modal; page signatories are used for printing.
* **Acceptance criteria:** a reader can choose the correct assignment tab without believing IDs are simple labels.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-01.
* **Estimated effort:** 25–40 minutes.
* **Handoff/rollback:** Content-only; do not change PAR behavior.

### UG-08 — Add ICS workflow content

* **Status:** DONE
* **Scope/files/symbols:** `app/src/content/userGuideContent.ts` ICS section only; validate against `pages/issuanceIcsPage.tsx`, `components/MultiIcsAssignmentModal.tsx`, `components/printReportModalForICS.tsx`.
* **Exact steps:**
  1. Add prerequisite Low/High tag, assignment tabs, quantity/department rules, and individual vs multi-print steps.
  2. State the exact persistence distinction for Purpose and ICS Details.
  3. Add common-mistake and print troubleshooting callouts.
* **Acceptance criteria:** content accurately tells users that only individual ICS print saves ICS Details and does not invent a tag threshold.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-01.
* **Estimated effort:** 25–40 minutes.
* **Handoff/rollback:** Content-only; retain user changes in ICS print modal.

### UG-09 — Add RIS workflow content

* **Status:** DONE
* **Scope/files/symbols:** `app/src/content/userGuideContent.ts` RIS section only; validate against `pages/issuanceRisPage.tsx`, `components/MultiRisAssignmentModal.tsx`, `components/printReportModalForRIS.tsx`.
* **Exact steps:**
  1. Add preconditions, New/Add Existing/Split flows, department/division input, selected printing, and ID search.
  2. Describe quantity validation, clones, and current persistence behavior of Purpose vs PO Details.
  3. Include exact division options only if still present in code at execution time.
* **Acceptance criteria:** guide separates unassigned versus RIS-ID rows and gives a safe print-selected procedure.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-01.
* **Estimated effort:** 25–40 minutes.
* **Handoff/rollback:** Content-only; do not change RIS business logic.

### UG-10 — Add NC, printing, administration, history, and support content

* **Status:** DONE
* **Scope/files/symbols:** `app/src/content/userGuideContent.ts` NC/print/admin/history/support sections only; validate against `issuanceNoCategoryPage.tsx`, `NcAssignmentModal.tsx`, `printReportModalForNC.tsx`, dashboard/admin/history pages.
* **Exact steps:**
  1. Add NC steps and the no-edit/already-assigned limitation.
  2. Add one consolidated browser print/export section including popup/iframe behavior and data persistence distinctions.
  3. Add dashboard/admin/history descriptions with “admin navigation” wording, then add the support placeholders and troubleshooting table.
  4. Do not add screenshots or contact guesses.
* **Acceptance criteria:** every verified remaining in-app process is discoverable in the guide; support section contains placeholders, not fabricated contacts.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-01.
* **Estimated effort:** 30–45 minutes.
* **Handoff/rollback:** Content-only; no API, image, or print-template changes.

### UG-11 — Perform editorial, link, and factual consistency review

* **Status:** DONE
* **Scope/files/symbols:** all `app/src/content/userGuideContent.ts` guide records; `app/src/pages/userGuide.tsx` only if anchors/link rendering need correction.
* **Exact steps:**
  1. Re-read each guide section against current source files and this plan's verified references.
  2. Verify route links, heading/TOC IDs, duplicate glossary definitions, category spelling as used by UI, and every warning about persistence.
  3. Replace any assertion not backed by code with an explicit confirmation placeholder.
  4. Confirm no screenshots/fake assets/dependencies were introduced.
* **Acceptance criteria:** no dead internal guide links, all acronyms expand once, and no unverified business rule is written as fact.
* **Targeted validation:** `Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build`
* **Dependencies:** UG-04, UG-05, UG-06, UG-07, UG-08, UG-09, UG-10.
* **Estimated effort:** 25–40 minutes.
* **Handoff/rollback:** Record factual corrections in ledger; rollback only erroneous content records.

### UG-12 — Run focused release validation and manual smoke test

* **Status:** DONE
* **Scope/files/symbols:** no planned code changes; current guide route/sidebar/content.
* **Exact steps:**
  1. Run the existing frontend build.
  2. In a safe local/staging environment, test logged-out `/guide`, `admin` guide visibility, and `user` guide visibility.
  3. Test TOC/search/no-match with keyboard, 320px viewport, 200% zoom, and print/popup troubleshooting copy.
  4. Open every guide route link; confirm no link causes a mutation or data fetch beyond normal navigation.
  5. Check `git diff --check` and `git status --short`; confirm only intended guide files plus known pre-existing changes exist.
* **Acceptance criteria:** build succeeds; authenticated sidebar/route behavior is correct; guide is readable and operable on mobile/keyboard; no unrelated change is introduced.
* **Targeted validation:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY'; git diff --check; git status --short
  ```
* **Dependencies:** UG-02, UG-03, UG-11.
* **Estimated effort:** 25–40 minutes.
* **Handoff/rollback:** Attach exact manual outcomes in ledger. If route/access fails, return to UG-02; if layout/accessibility fails, return to UG-03; if prose fails, return to its single workflow task.

## Final release checklist

- [ ] Ledger has one final entry for every UG-01 through UG-12 task; no unexplained `IN_PROGRESS` task remains.
- [ ] `/guide` is protected and the sidebar **Help & User Guide** entry appears for both configured `admin` and `user` roles.
- [ ] No existing navigation item, role mapping, route, or uncommitted user change was removed.
- [ ] Guide contains quick start, data flow, glossary, access note, PO, IAR, PAR, ICS, RIS, NC, printing/export, dashboard/admin/history, troubleshooting, and support placeholders.
- [ ] Every workflow has prerequisites, numbered steps, data effect, correction/limit, print/export effect, warning/common mistake, and troubleshooting.
- [ ] All unknown business rules are visibly marked for confirmation.
- [ ] Search, TOC, headings, keyboard behavior, 320px view, and 200% zoom pass manual validation.
- [ ] No screenshots are shipped unless approved, sanitized real assets and alt text exist.
- [ ] `npm run build` and `git diff --check` pass.
- [ ] Final reviewer verifies links against current code and publishes real support contacts only after owner approval.
