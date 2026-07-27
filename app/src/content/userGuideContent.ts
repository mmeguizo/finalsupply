import type { ReactNode } from 'react';

export type GuideCalloutType = 'info' | 'warning' | 'tip' | 'caution';

export interface GuideCallout {
  type: GuideCalloutType;
  message: string;
}

export interface GuideLink {
  label: string;
  to: string;
}

export interface GuideStep {
  number: number;
  text: string;
  callouts?: GuideCallout[];
}

export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  steps: GuideStep[];
  warnings?: string[];
  links?: GuideLink[];
  content?: ReactNode;
}

const userGuideSections: GuideSection[] = [
  {
    id: 'welcome',
    title: 'Welcome / Quick start',
    summary:
      'A safe first-time walkthrough for new users. Follow this sequence in order to understand the basics before creating real documents.',
    keywords: ['welcome', 'quick start', 'first time', 'overview', 'getting started'],
    steps: [
      {
        number: 1,
        text: 'Sign in with the email and password supplied by an administrator. If you do not have credentials, contact the supply-system owner listed in the Troubleshooting section.',
      },
      {
        number: 2,
        text: 'Open Help & User Guide from the sidebar and read this guide to understand how data flows through the system before taking any action.',
      },
      {
        number: 3,
        text: 'Open PO Monitoring from the sidebar to browse purchase orders and inspect item quantities, status, and delivery progress.',
      },
      {
        number: 4,
        text: 'Generate an IAR only for goods that have actually been received. Do not generate an IAR for planned or expected quantities.',
      },
      {
        number: 5,
        text: 'Open the appropriate issuance section (Issuance PAR, ICS, RIS, or No Category) only after the IAR item has a category assigned and has available quantity.',
      },
      {
        number: 6,
        text: 'Preview every document before choosing Print Report. Your browser may ask for permission to print or show a pop-up; allow it. The print button opens your browser\'s print dialog — it does not automatically print a physical copy.',
        callouts: [
          { type: 'tip', message: 'If the print dialog does not open, check for a blocked pop-up notification in your browser\'s address bar and allow pop-ups for this site.' },
        ],
      },
      {
        number: 7,
        text: 'Use Histories (visible to admin role) and the PO item history action to review recorded changes. Histories is an audit viewer, not a way to undo changes.',
      },
    ],
    warnings: [
      'Do not create dummy purchase orders, fabricate receipt quantities, or reuse a document ID from another record to "test" the system. Every record is tracked and audited.',
    ],
  },
  {
    id: 'data-flow',
    title: 'How information moves through the system',
    summary:
      'Understand the main data chain from purchase order through to issuance documents. All issuance records trace back to a received IAR row and ultimately to a purchase order item.',
    keywords: ['data flow', 'diagram', 'chain', 'purchase order', 'iar', 'issuance', 'flow'],
    steps: [
      {
        number: 1,
        text: 'A Purchase Order (PO) is created with supplier data and one or more line items (item name, quantity, unit cost, amount). The PO is the source document for everything that follows.',
      },
      {
        number: 2,
        text: 'When goods arrive, open Generate IAR, select the PO, choose the received items, enter the received quantity, and set a category (PAR, ICS, RIS, or No Category). The system creates one or more Inspection Acceptance Report (IAR) rows with the received quantity and assigns a shared IAR ID.',
      },
      {
        number: 3,
        text: 'IAR rows that have a category and positive available quantity appear in the corresponding issuance section (Issuance PAR for PAR-categorized items, Issuance ICS for ICS items, etc.). Items without a category are handled through No Category issuance.',
      },
      {
        number: 4,
        text: 'Issuance creates document IDs (PAR, ICS, RIS, or NC ID) and links each issuance record back to the source IAR row through foreign keys. This means every issued item can be traced back to the original PO.',
      },
    ],
    warnings: [
      'Issuance is not a separate inventory list. Every issuance record traces back to a received IAR row and ultimately to a purchase order item. You cannot issue items that were not first received through an IAR.',
    ],
    links: [
      { label: 'PO Monitoring', to: '/purchaseorder' },
      { label: 'Generate IAR', to: '/inventory' },
    ],
  },
  {
    id: 'glossary',
    title: 'Glossary and IDs',
    summary:
      'Common terms and document identifier formats used throughout the system. Each term is defined for a beginner audience.',
    keywords: ['glossary', 'terms', 'definitions', 'iar', 'par', 'ics', 'ris', 'nc', 'id format'],
    steps: [
      {
        number: 1,
        text: 'PO — Purchase Order: the source order containing supplier information, dates, delivery terms, and planned item quantities.',
      },
      {
        number: 2,
        text: 'PO item — One line in a PO, with a description, quantity, unit, unit cost, calculated amount, category assignment, and delivery/receipt tracking fields.',
      },
      {
        number: 3,
        text: 'IAR — Inspection Acceptance Report: records received PO-item quantities grouped under one shared IAR ID. An IAR can have multiple rows (line items) under the same ID.',
      },
      {
        number: 4,
        text: 'PAR — Property Acknowledgement Receipt: an issuance document and its identifier. Created when assigning PAR-categorized IAR items.',
      },
      {
        number: 5,
        text: 'ICS — Inventory Custodian Slip: an issuance document and its identifier. ICS source items require a Low or High tag, which is set during IAR generation.',
      },
      {
        number: 6,
        text: 'RIS — Requisition and Issue Slip: an issuance document and its identifier. RIS assignments include a division field.',
      },
      {
        number: 7,
        text: 'NC / No Category — A received IAR item that has no PAR, ICS, or RIS category. Assigning an NC item creates an NC ticket ID.',
      },
      {
        number: 8,
        text: 'Available quantity — The current actualQuantityReceived value on a source IAR row. This is the maximum amount that can be assigned or split for issuance.',
      },
      {
        number: 9,
        text: 'Issuance clone — A new record created when an issuance assignment or split is made. The clone retains foreign keys to the source IAR row so the chain of custody is preserved.',
      },
      {
        number: 10,
        text: 'Department / Division — Destination information collected during issuance flows. PAR and ICS use a department field; RIS uses a fixed division list.',
      },
      {
        number: 11,
        text: 'MDS — A field on IAR records. The exact meaning should be confirmed with your supply administrator.',
      },
      {
        number: 12,
        text: 'Signatory selection — Names chosen on an issuance page for the printed document. These selections are stored in the browser (Zustand persisted state), not on the server.',
      },
    ],
  },
  {
    id: 'access-and-roles',
    title: 'Access, roles, and sign-in',
    summary:
      'How authentication, roles, and permissions work. The sidebar reflects your assigned role, but the server is the ultimate authority for authorization.',
    keywords: ['sign in', 'sign out', 'role', 'admin', 'user', 'access', 'permission', 'login'],
    steps: [
      {
        number: 1,
        text: 'Sign in with the email and password provided by an administrator. Credentials are submitted to the server; the server maintains your session with a secure cookie.',
      },
      {
        number: 2,
        text: 'The sidebar and available pages depend on your role. Both admin and user roles can access Dashboard, PO Monitoring, Generate IAR, and Issuance sections. Admin users additionally see Signatories, Department, Users & Roles, and Histories.',
      },
      {
        number: 3,
        text: 'Sign out using the sidebar sign-out option. This returns you to the sign-in page and clears the browser session. Your session also expires after a period of inactivity.',
        callouts: [
          { type: 'tip', message: 'Closing the browser tab does not sign you out immediately. Use the sign-out button to end your session securely.' },
        ],
      },
      {
        number: 4,
        text: 'If a menu item is missing from your sidebar, your role may not have access to that page. Contact an administrator rather than using another account. The sidebar only controls what you see — the server enforces authorization for every action.',
      },
    ],
    warnings: [
      'Hiding a sidebar item is not security — the server enforces all authorization rules. Do not share accounts or credentials.',
      'Confirm with supply administrator: which real people are permitted to create POs, receive goods, assign PAR/ICS/RIS/NC, print official copies, change document details, and administer users. Current application roles ("admin" and "user") do not alone express those job-specific duties.',
    ],
  },
  {
    id: 'purchase-order',
    title: 'Purchase orders, item management, and delivery tracking',
    summary:
      'How to view, create, edit, and track purchase orders and their line items. PO Monitoring is the starting point for the entire supply workflow.',
    keywords: ['purchase order', 'po', 'monitoring', 'items', 'delivery', 'edit', 'history', 'export', 'print'],
    steps: [
      {
        number: 1,
        text: 'Open PO Monitoring from the sidebar. Use the quick filter or browse the grid to find a purchase order. Select a row to view its details and item grid.',
      },
      {
        number: 2,
        text: 'To create a new PO, choose Add Purchase Order from the toolbar. Note: only some fields are currently editable in the form. Confirm with your supply administrator that your role is permitted to create POs before using this feature.',
        callouts: [
          { type: 'caution', message: 'The add form currently disables some basic fields such as PO number, supplier, address, place of delivery, and payment date even in add mode. Verify the current form is usable for your role with your administrator before attempting creation.' },
        ],
      },
      {
        number: 3,
        text: 'Open the overview panel to inspect supplier information, dates, status, delivery progress, category breakdown, and item totals. The overview is informational only — no actions can be taken from it.',
      },
      {
        number: 4,
        text: 'For a permitted correction, choose the edit action on a PO row. If the PO was completed, a confirmation appears: editing a completed PO resets its status to pending.',
        callouts: [
          { type: 'warning', message: 'Editing a completed PO changes it back to pending status. Do not edit a completed PO for a cosmetic correction without approval.' },
        ],
      },
      {
        number: 5,
        text: 'In the item grid, you can edit fields such as description and unit where allowed. Completed POs and fully delivered or received items are blocked from editing.',
      },
      {
        number: 6,
        text: 'Use the delivery-status control to record the actual delivery state of each item. Delivery tracking is separate from IAR receipt quantity — marking an item as delivered does not automatically generate an IAR.',
        callouts: [
          { type: 'warning', message: 'Do not treat marking delivery, entering receipt quantity, and generating an IAR as the same action. Delivery status and IAR receipt are separate steps.' },
        ],
      },
      {
        number: 7,
        text: 'Use the PO history action (clock icon on a row) to inspect changes by item, change type, previous and new quantities, the person who made the change, the reason, and the timestamp. This is a read-only audit view.',
      },
      {
        number: 8,
        text: 'Use the toolbar export or print actions. Check whether the action applies to the selected PO or all POs before proceeding. Pop-up blocking can prevent the print window from opening.',
      },
    ],
    warnings: [
      'Do not receive more than a PO item remaining quantity. The available quantity for IAR generation is the item quantity minus what has already been received.',
      'The system uses soft deletion (isDeleted flag). The current user-facing behavior for delete must be confirmed with your administrator.',
    ],
    links: [
      { label: 'PO Monitoring', to: '/purchaseorder' },
    ],
  },
  {
    id: 'iar',
    title: 'Inspection Acceptance Reports (IAR)',
    summary:
      'How to generate, view, edit, print, and revert IARs. IAR records received PO-item quantities and is the gateway to issuance.',
    keywords: ['iar', 'inspection', 'acceptance', 'report', 'generate', 'receive', 'revert', 'print', 'add line'],
    steps: [
      {
        number: 1,
        text: 'Open Generate IAR from the sidebar. You can also select a PO in PO Monitoring and choose Generate IAR to go directly to that PO.',
      },
      {
        number: 2,
        text: 'Select an eligible PO from the list. A PO is eligible if it is not completed, has at least one non-deleted item, and has remaining quantity to receive.',
      },
      {
        number: 3,
        text: 'In the Generate IAR modal, select each delivered item and enter the received quantity. The UI limits the quantity to the remaining amount; fully received lines are disabled and cannot be selected.',
      },
      {
        number: 4,
        text: 'Set a category for each selected item: PAR, ICS, RIS, or leave blank for No Category. For ICS items, you must also choose Low or High tag — the form will reject an ICS item without a tag.',
        callouts: [
          { type: 'tip', message: 'Only items with a category will appear in the corresponding issuance section. Items without a category go through No Category issuance.' },
        ],
      },
      {
        number: 5,
        text: 'Optionally enter an invoice number, then click Generate IAR. At least one selected line with a received quantity greater than zero is required.',
      },
      {
        number: 6,
        text: 'After generation, the IAR list shows your new entries grouped by IAR ID. Expand a row to review the source items. You can edit IAR-level fields: press Enter to save invoice, invoice date, income, and MDS; use the date picker for dates; press Shift+Enter to save Details.',
        callouts: [
          { type: 'info', message: 'IAR invoice, invoice date, income, MDS, and details are separate from PO-level fields. Enter them directly on the IAR row.' },
        ],
      },
      {
        number: 7,
        text: 'To print an IAR, click the preview or print icon on a row. Select the IAR signatories, optionally enter an End User name and PO Details, review the preview, then choose Print Report.',
        callouts: [
          { type: 'warning', message: 'IAR PO Details entered in the print dialog are stored in browser local storage, not on the server. They are keyed to the set of item IDs being printed. Clearing your browser data or using a different device will lose them.' },
        ],
      },
      {
        number: 8,
        text: 'To add a receipt line to an existing IAR, use the Add Line control. This creates an additional receipt line from an existing source item within the same logical item group. This is a receipt-line correction, not a general new-item creator.',
      },
      {
        number: 9,
        text: 'Use Revert only after verifying the IAR ID. The confirmation dialog explains that reverting rolls back received quantities and hides the IAR entries. Revert is disabled for items belonging to a completed PO.',
        callouts: [
          { type: 'caution', message: 'Confirm with supply administrator: when an IAR may be reverted after an official document has been printed; what evidence is required for partial receipt; the intended meaning of IAR status values; and who approves IAR details, income, and MDS values.' },
        ],
      },
    ],
    warnings: [
      'The IAR represents actual goods received. Do not generate IARs for planned or expected quantities.',
      'Reverting an IAR changes quantities and hides records. Ensure you have authorization before reverting.',
    ],
    links: [
      { label: 'Generate IAR', to: '/inventory' },
    ],
  },
  {
    id: 'par',
    title: 'Property Acknowledgement Receipt (PAR) issuance',
    summary:
      'How to assign PARs to IAR items, manage assignments, and print PAR documents. PAR is the issuance document for accountable property.',
    keywords: ['par', 'property', 'acknowledgement', 'receipt', 'issuance', 'assign', 'split', 'print'],
    steps: [
      {
        number: 1,
        text: 'Open Issuance → Issuance Par from the sidebar. Find the PO that contains your IAR item and expand it. Look for an item without a PAR ID that has positive available quantity.',
      },
      {
        number: 2,
        text: 'Use Assign PAR for the entire PO or click an individual assignment chip. You will enter or select item quantities and a department.',
        callouts: [
          { type: 'info', message: 'The current assignment modal does not contain signatory fields. Signatories are selected at print time on the page.' },
        ],
      },
      {
        number: 3,
        text: 'On the New PAR tab, create one PAR ID for the selected items. Quantity must be greater than zero and no greater than the available quantity.',
      },
      {
        number: 4,
        text: 'On the Add to Existing tab, select an existing PAR ID, a source item, and a quantity. This adds a clone of the item to that ID — it does not merely relabel the source. Verify you are not creating an unintended duplicate.',
        callouts: [
          { type: 'warning', message: 'Add to Existing copies the item into the selected PAR ID. It does not transfer or rename the source line. Review the result before confirming.' },
        ],
      },
      {
        number: 5,
        text: 'On the Split & Assign tab, define each destination with a department and quantity so the total exactly matches the source quantity. Review the confirmation summary before submitting.',
      },
      {
        number: 6,
        text: 'Select the page signatories, preview the PAR, add remarks and PO Details as appropriate, then choose Print Report.',
        callouts: [
          { type: 'info', message: 'PAR remarks are saved to the server but only for the selected IAR rows and only when they are nonblank at print time. PAR PO Details are browser local storage only.' },
        ],
      },
      {
        number: 7,
        text: 'To edit an already assigned PAR item, click on the existing assignment. This reopens the multi-assignment flow so you can re-split, add, or create. Changes affect quantities, so review carefully before submitting.',
      },
    ],
    warnings: [
      'Issuance is a consumption record. The quantity deducted from available stock is permanent after confirmation.',
      'Do not exceed the available quantity. The UI validates that the assigned total does not exceed what remains.',
    ],
    links: [
      { label: 'Issuance PAR', to: '/issuance/issuance-par' },
    ],
  },
  {
    id: 'ics',
    title: 'ICS issuance and printing',
    summary:
      'How to assign, print, and manage Inventory Custodian Slips (ICS) for ICS-classified IAR items.',
    keywords: ['ics', 'inventory', 'custodian', 'slip', 'issuance', 'low', 'high', 'tag', 'print'],
    steps: [
      {
        number: 1,
        text: 'Before issuing, confirm the IAR item was generated with the ICS category and has the intended Low or High tag. The tag is set during IAR generation and cannot be changed during issuance.',
      },
      {
        number: 2,
        text: 'Open Issuance → Issuance ICS from the sidebar. Expand the PO row, then choose Assign ICS or click an individual item.',
      },
      {
        number: 3,
        text: 'In the assignment modal, choose one of three options: create a new ICS with selected items, quantities, and a department; add a line to an existing ICS ID; or split the available quantity among new ICS assignments. Do not exceed the available quantity.',
        callouts: [
          { type: 'tip', message: 'The ICS tag (Low or High) comes from the original IAR source, not from the assignment form. You cannot change it here.' },
        ],
      },
      {
        number: 4,
        text: 'Select the page signatories, then preview or print the assigned items. You can select individual items or multiple items for printing.',
      },
      {
        number: 5,
        text: 'Enter Purpose and ICS Details before printing. Print a single item when you need the ICS Details to be saved for future use.',
        callouts: [
          { type: 'warning', message: 'ICS Details are saved to the database only when printing a single item. Multi-select printing saves Details temporarily in the browser — they will be lost when the browser data is cleared or you use a different device. Print individually to save ICS Details permanently.' },
          { type: 'info', message: 'Purpose is saved for the printed selected items regardless of single or multi-select.' },
        ],
      },
    ],
    warnings: [
      'The ICS tag (Low or High) is set during IAR generation and cannot be changed in the issuance step. Verify the tag is correct before generating the IAR.',
      'Printing multiple ICS items together does not save ICS Details to the database. Only single-item print persists ICS Details.',
    ],
    links: [
      { label: 'Issuance ICS', to: '/issuance/issuance-ics' },
    ],
  },
  {
    id: 'ris',
    title: 'Requisition Issue Slip (RIS) issuance',
    summary:
      'How to assign, print, and manage RIS documents for IAR items. RIS covers items issued on requisition.',
    keywords: ['ris', 'requisition', 'issue', 'slip', 'issuance', 'assign', 'split', 'division', 'print'],
    steps: [
      {
        number: 1,
        text: 'Open Issuance → Issuance RIS from the sidebar. Find and expand the PO that contains your item. Look for a row with positive available quantity and no RIS ID.',
      },
      {
        number: 2,
        text: 'Choose Assign RIS. For a new RIS, select source items, enter valid quantities and a department, then choose a division from the list.',
        callouts: [
          { type: 'info', message: 'Current division options are: Talisay Main, Alijis, Binalbagan, and Fortune Town. Confirm with your administrator if other divisions should be available.' },
        ],
      },
      {
        number: 3,
        text: 'Use Add to Existing only after verifying the selected RIS ID and source item. This clones the item into the existing RIS — it does not relabel the source.',
      },
      {
        number: 4,
        text: 'Use Split & Assign only when every split quantity and recipient department is correct. The total split quantities must exactly match the source quantity.',
      },
      {
        number: 5,
        text: 'Search by RIS ID to find issued lines. Select only rows that already have an RIS ID for Print Selected — unassigned rows cannot be printed.',
        callouts: [
          { type: 'tip', message: 'Use the search field to filter by RIS ID. This helps locate specific issued lines quickly.' },
        ],
      },
      {
        number: 6,
        text: 'Select page signatories, preview the RIS, enter Purpose and PO Details as needed, then choose Print Report.',
        callouts: [
          { type: 'info', message: 'RIS Purpose is saved to the server for the selected items only when nonblank at print time. RIS PO Details are browser local storage only.' },
        ],
      },
    ],
    warnings: [
      'Only items with an assigned RIS ID can be printed. Unassigned IAR lines cannot be selected for printing.',
      'Add to Existing clones the item into the target RIS ID. Verify the source and target before confirming.',
    ],
    links: [
      { label: 'Issuance RIS', to: '/issuance/issuance-ris' },
    ],
  },
  {
    id: 'nc',
    title: 'No Category (NC) issuance',
    summary:
      'How to assign and print NC documents for IAR items generated without a PAR, ICS, or RIS category.',
    keywords: ['nc', 'no category', 'issuance', 'nocat'],
    steps: [
      {
        number: 1,
        text: 'Use this section only for IAR items that were intentionally generated without a PAR, ICS, or RIS category. Open Issuance → No Category from the sidebar.',
      },
      {
        number: 2,
        text: 'Expand the PO and click the item NC assignment control. Enter a quantity greater than zero and no greater than the available quantity. Purpose is optional.',
      },
      {
        number: 3,
        text: 'Submit the assignment. The UI auto-closes after a successful assignment. Note the returned NC ID for your records.',
        callouts: [
          { type: 'info', message: 'The assignment modal does not support editing an already assigned NC item. If you need to change an existing NC, contact your administrator.' },
        ],
      },
      {
        number: 4,
        text: 'Select signatories, preview the NC document, enter a print purpose if needed, and choose Print Report.',
        callouts: [
          { type: 'warning', message: 'The NC print dialog currently does not save the print purpose to the server. Enter it fresh each time you print.' },
        ],
      },
    ],
    warnings: [
      'Once an NC ID is assigned, the assignment cannot be edited through the UI. Verify quantities and items before submitting.',
    ],
    links: [
      { label: 'No Category', to: '/issuance/issuance-nocat' },
    ],
  },
  {
    id: 'printing',
    title: 'Printing, export, and data persistence',
    summary:
      'How printing and exporting work across the application, including pop-up behavior, hidden iframe printing, and where data is stored.',
    keywords: ['print', 'export', 'csv', 'popup', 'iframe', 'browser', 'local storage', 'persistence'],
    steps: [
      {
        number: 1,
        text: 'For PO documents, use the toolbar print or export action. Export produces a CSV file. Printing opens a browser print dialog. Pop-up blocking can prevent the print window from opening.',
        callouts: [
          { type: 'tip', message: 'If the print dialog does not appear, allow pop-ups and print dialogs for the application, then retry from the preview. Do not submit the assignment again merely because printing failed.' },
        ],
      },
      {
        number: 2,
        text: 'For IAR, PAR, RIS, ICS, and NC documents, choose Print Report from the document page. The application uses a hidden iframe to open the browser print dialog.',
        callouts: [
          { type: 'info', message: 'Print Report opens the browser print dialog. It does not prove a physical copy was printed or saved. Ensure you have actually printed or saved the document before closing.' },
        ],
      },
      {
        number: 3,
        text: 'Understand data persistence by document type. IAR, PAR, and RIS PO Details entered in print dialogs are stored in browser local storage, not on the server. They are keyed to the set of item IDs being printed.',
        callouts: [
          { type: 'warning', message: 'IAR, PAR, and RIS PO Details are browser-local only. Clearing your browser data, switching devices, or using a different browser will lose them. Re-enter them when needed.' },
        ],
      },
      {
        number: 4,
        text: 'ICS Details are saved to the database only when printing a single item. Multi-select ICS print saves Details temporarily in the browser. Print individually to persist ICS Details.',
      },
      {
        number: 5,
        text: 'PAR remarks are saved to the server for selected IAR rows only when nonblank at print time. RIS Purpose is saved to the server for selected items only when nonblank at print time.',
      },
    ],
    warnings: [
      'Pop-up blockers can silently prevent print windows. Configure your browser to allow pop-ups for this application.',
      'Browser local storage data is device-specific and not backed up. Do not rely on it for permanent record keeping.',
    ],
  },
  {
    id: 'dashboard-admin',
    title: 'Dashboard, administration, and history',
    summary:
      'An overview of the dashboard, admin navigation pages, and the histories audit viewer.',
    keywords: ['dashboard', 'admin', 'administration', 'users', 'roles', 'departments', 'signatories', 'history', 'histories'],
    steps: [
      {
        number: 1,
        text: 'The dashboard is the default landing page. It displays summary cards for users, POs, items, and amounts, plus monthly PO trends and a category distribution chart. All dashboard data is informational only.',
      },
      {
        number: 2,
        text: 'Admin navigation pages manage departments, signatories, users, and roles. Access these only if your role includes admin privileges. Department CRUD, signatory CRUD, user CRUD, and role CRUD are each in their own page.',
        callouts: [
          { type: 'caution', message: 'Confirm with supply administrator: which real people are permitted to administer users, departments, signatories, and roles. Application-level permissions may not express job-specific duties.' },
        ],
      },
      {
        number: 3,
        text: 'The Histories screen lets you search and inspect recorded PO-item history, including IAR, PAR, RIS, and ICS IDs. It shows the person who made the change, the reason, previous and new quantities, and a timestamp.',
        callouts: [
          { type: 'info', message: 'Histories is a read-only audit viewer. It cannot undo changes or revert documents.' },
        ],
      },
    ],
    warnings: [
      'Admin pages modify live data. Changes to departments, signatories, users, and roles take effect immediately.',
      'The dashboard is not an action center. Use the respective issuance menus to create documents.',
    ],
    links: [
      { label: 'Dashboard', to: '/' },
      { label: 'Histories', to: '/histories' },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting and support',
    summary:
      'Common issues, first checks, and how to get help.',
    keywords: ['troubleshooting', 'support', 'help', 'issue', 'error', 'popup', 'quantity', 'missing'],
    steps: [
      {
        number: 1,
        text: 'If you cannot see a menu item, check your role and access. Do not use another user account. Contact your administrator.',
      },
      {
        number: 2,
        text: 'If a PO is absent from the IAR selector, verify the PO is not completed, has at least one non-deleted item, and has remaining quantity. The selector deliberately filters out ineligible POs.',
      },
      {
        number: 3,
        text: 'If a quantity is rejected, compare the entered value to the displayed available or remaining quantity. Do not split across documents until the totals are confirmed.',
      },
      {
        number: 4,
        text: 'If an assignment ID is not shown after submission, wait for the success or error message before refreshing. Capture the PO, IAR, or item ID and the exact error text for support.',
      },
      {
        number: 5,
        text: 'If the print dialog does not open, allow pop-ups and print dialogs for the application, then retry from the preview. Do not submit the assignment again just because printing failed.',
      },
      {
        number: 6,
        text: 'If details disappeared, IAR, PAR, and RIS PO Details are browser-local. Use the same browser and device, or re-enter them. ICS Details persist only for individual prints.',
      },
      {
        number: 7,
        text: 'If you need to correct an official document, stop and follow your local approval policy. Use the documented correction or revert path only if authorized.',
        callouts: [
          { type: 'info', message: 'Supply-system owner: [name / email / phone]. Functional approver for corrections: [role / contact]. Technical support: [service desk / email]. When submitting a ticket include: user email, URL or page name, PO number, IAR / PAR / ICS / RIS / NC ID, item ID, time and time zone, exact error message, and a screenshot with confidential values redacted.' },
        ],
      },
    ],
    warnings: [
      'Do not share accounts or credentials to work around access restrictions.',
      'Document corrections must follow official policy, not application shortcuts.',
    ],
  },
];

export default userGuideSections;
