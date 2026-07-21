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
      'A safe first-time walkthrough for new users of the supply management system. Follow this sequence in order to understand the basics before creating real documents.',
    keywords: ['welcome', 'quick start', 'first time', 'overview'],
    steps: [
      { number: 1, text: 'Sign in with the email and password supplied by an administrator.' },
      { number: 2, text: 'Open Help & User Guide from the sidebar and read the data-flow diagram.' },
      { number: 3, text: 'Open PO Monitoring to find the purchase order and inspect item quantities and status.' },
      { number: 4, text: 'Generate an IAR only for actual received quantity.' },
      { number: 5, text: 'Open the appropriate issuance section only after the IAR item is categorized and available.' },
      { number: 6, text: 'Preview every document before choosing Print Report; allow browser print dialogs and pop-ups.' },
      { number: 7, text: 'Use Histories (admin navigation) and the PO item history action to review recorded changes, not as a way to undo them.' },
    ],
    warnings: [
      'Do not create dummy purchase orders, fabricate receipt quantities, or reuse a document ID from another record to "test" the system.',
    ],
  },
  {
    id: 'data-flow',
    title: 'How information moves through the system',
    summary: 'Understand the main data chain from purchase order through to issuance documents.',
    keywords: ['data flow', 'diagram', 'chain', 'purchase order', 'iar', 'issuance'],
    steps: [
      { number: 1, text: 'A Purchase Order (PO) is created with one or more line items.' },
      { number: 2, text: 'When goods arrive, the PO item is received through Generate IAR, which creates an Inspection Acceptance Report (IAR) row with the received quantity.' },
      { number: 3, text: 'IAR rows with a category (PAR, ICS, RIS) become available for issuance assignment.' },
      { number: 4, text: 'Issuance creates document IDs (PAR, ICS, RIS, or No Category) and links back to the source IAR row.' },
    ],
    warnings: [
      'Issuance is not an unrelated inventory list — every issuance record traces back to a received IAR row and ultimately to a purchase order item.',
    ],
    links: [
      { label: 'PO Monitoring', to: '/purchaseorder' },
      { label: 'Generate IAR', to: '/inventory' },
    ],
  },
  {
    id: 'glossary',
    title: 'Glossary and IDs',
    summary: 'Common terms and document identifier formats used throughout the system.',
    keywords: ['glossary', 'terms', 'definitions', 'iar', 'par', 'ics', 'ris', 'nc', 'id format'],
    steps: [
      { number: 1, text: 'PO — Purchase Order: the source order, supplier data, and planned item quantities.' },
      { number: 2, text: 'PO item — One line in a PO, with quantity, unit, cost, amount, category, and receipt/delivery state.' },
      { number: 3, text: 'IAR — Inspection Acceptance Report: received PO-item quantities grouped under one IAR ID.' },
      { number: 4, text: 'PAR — Property Acknowledgement Receipt issuance document and ID.' },
      { number: 5, text: 'ICS — Inventory Custodian Slip issuance document and ID. ICS source items require a Low or High tag.' },
      { number: 6, text: 'RIS — Requisition and Issue Slip issuance document and ID.' },
      { number: 7, text: 'NC / No Category — A received IAR item with no PAR/ICS/RIS category. Assigning creates an NC ticket ID.' },
      { number: 8, text: 'Available quantity — Current actualQuantityReceived on the relevant source IAR row. It limits how much can be assigned.' },
      { number: 9, text: 'Issuance clone — The record created when an assigned or split issuance quantity is made; it retains traceability to the source IAR row.' },
      { number: 10, text: 'Department / Division — Destination data collected by issuance flows.' },
      { number: 11, text: 'Signatory selection — Names chosen on a page for a print form, stored in the browser.' },
    ],
  },
  {
    id: 'access-and-roles',
    title: 'Access, roles, and sign-in',
    summary: 'How authentication, roles, and permissions work.',
    keywords: ['sign in', 'sign out', 'role', 'admin', 'user', 'access', 'permission'],
    steps: [
      { number: 1, text: 'Sign in with the email and password provided by an administrator.' },
      { number: 2, text: 'The sidebar and available pages depend on your role. Admin users see additional pages such as Signatories, Department, Roles, Users, and Histories.' },
      { number: 3, text: 'Sign out returns to the sign-in page and clears the browser session.' },
      { number: 4, text: 'If a menu item is missing, your role may not have access. Contact an administrator rather than using another account.' },
    ],
    warnings: [
      'Hiding a sidebar item is not security — the server still enforces authorization. Do not share accounts.',
    ],
  },
];

export default userGuideSections;
