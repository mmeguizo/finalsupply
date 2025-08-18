# File Tree: FINAL SUPPLY

Generated on: 8/12/2025, 4:52:37 PM
Root path: `c:\Users\markm\OneDrive\Desktop\AIR SUPPLY\FINAL SUPPLY`

```
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 .idea/ 🚫 (auto-hidden)
├── 📁 .vscode/ 🚫 (auto-hidden)
├── 📁 api/
│   ├── 📁 db/
│   │   └── 📄 connectDB.js
│   ├── 📁 migrations/
│   │   └── 📄 20250513053017-add_iar_id_to_purchase_order_items.js
│   ├── 📁 models/
│   │   ├── 📄 department.js
│   │   ├── 📄 inspectionacceptancereport.js
│   │   ├── 📄 purchaseorder.js
│   │   ├── 📄 purchaseorderitems.js
│   │   ├── 📄 purchaseorderitemshistory.js
│   │   ├── 📄 signatory.js
│   │   ├── 📄 transaction.model.js
│   │   └── 📄 user.model.js
│   ├── 📁 node_modules/ 🚫 (auto-hidden)
│   ├── 📁 passport/
│   │   └── 📄 passport.config.js
│   ├── 📁 resolvers/
│   │   ├── 📄 department.resolver.js
│   │   ├── 📄 index.js
│   │   ├── 📄 inspectionacceptancereport.resolver.js
│   │   ├── 📄 propertyacknowledgementrepoert.resolver.js
│   │   ├── 📄 purchaseorder.resolver.js
│   │   ├── 📄 requisitionissueslip.resolver.js
│   │   ├── 📄 role.resolver.js
│   │   ├── 📄 signatory.resolver.js
│   │   └── 📄 user.resolver.js
│   ├── 📁 typeDefs/
│   │   ├── 📄 department.typeDef.js
│   │   ├── 📄 index.js
│   │   ├── 📄 inspectionacceptancereport.typeDef.js
│   │   ├── 📄 propertyacknowledgmentreport.typeDef.js
│   │   ├── 📄 purchaseorder.typeDef.js
│   │   ├── 📄 requisitionissueslip.typeDef.js
│   │   ├── 📄 role.typeDef.js
│   │   ├── 📄 signatory.typeDef.js
│   │   └── 📄 user.typeDef.js
│   ├── 📁 utils/
│   │   ├── 📄 helper.js
│   │   ├── 📄 iarIdGenerator.js
│   │   ├── 📄 icsIdGenerator.js
│   │   ├── 📄 parIdGenerator.js
│   │   └── 📄 risIdGenerator.js
│   ├── 🔒 .env 🚫 (auto-hidden)
│   ├── 🚫 .gitignore
│   ├── ⚙️ graphql.config.yml
│   ├── 📄 index.js
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   └── 📄 tree.txt
├── 📁 app/
│   ├── 📁 dist/ 🚫 (auto-hidden)
│   ├── 📁 node_modules/ 🚫 (auto-hidden)
│   ├── 📁 public/
│   │   ├── 🖼️ chmsu-logo.png
│   │   └── 🖼️ vite.svg
│   ├── 📁 src/
│   │   ├── 📁 apollo/
│   │   │   ├── 📄 cacheConfig.ts
│   │   │   ├── 📄 client.ts
│   │   │   └── 📄 errorHandling.ts
│   │   ├── 📁 assets/
│   │   │   ├── 📁 images/
│   │   │   │   └── 🖼️ chmsu-logo.png
│   │   │   ├── 📄 .gitkeep
│   │   │   └── 🖼️ favicon.ico
│   │   ├── 📁 auth/
│   │   │   ├── 📁 components/
│   │   │   │   └── 📄 AppContent.tsx
│   │   │   ├── 📁 config/
│   │   │   │   └── 📄 role.ts
│   │   │   ├── 📁 hooks/
│   │   │   │   └── 📄 useAuth.tsx
│   │   │   ├── 📄 LoginService.ts
│   │   │   ├── 📄 SessionContext.tsx
│   │   │   ├── 📄 authUtils.ts
│   │   │   └── 📄 protected.tsx
│   │   ├── 📁 components/
│   │   │   ├── 📁 previewDocumentFiles/
│   │   │   │   ├── 📄 InspectionAcceptanceForReporting.tsx
│   │   │   │   ├── 📄 InspectionAcceptanceReport.tsx
│   │   │   │   ├── 📄 InspectionAcceptanceReportForIAR.tsx
│   │   │   │   ├── 📄 inventoryCustodianSlip.tsx
│   │   │   │   ├── 📄 propertyAcknowledgementReceipt.tsx
│   │   │   │   └── 📄 requisitionAndIssueSlip.tsx
│   │   │   ├── 📁 printDocumentFiles/
│   │   │   │   ├── 📄 inspectionAcceptanceForReporting.tsx
│   │   │   │   ├── 📄 inspectionAcceptanceRerport.tsx
│   │   │   │   ├── 📄 inspectionAcceptanceRerportForIAR.tsx
│   │   │   │   ├── 📄 inventoryCustodianslip.tsx
│   │   │   │   ├── 📄 inventoryCustodianslipPrinting.tsx
│   │   │   │   ├── 📄 propertyAcknowledgementReceipt.tsx
│   │   │   │   └── 📄 requisitionAndIssueSlip.tsx
│   │   │   ├── 📁 purchaseOrder/
│   │   │   │   ├── 📄 BasicInfo.tsx
│   │   │   │   ├── 📄 PurchaseOrderItems.tsx
│   │   │   │   ├── 📄 PurchaseOrderModal.tsx
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📄 confirmationdialog.tsx
│   │   │   ├── 📄 departmentModal.tsx
│   │   │   ├── 📄 notifications.tsx
│   │   │   ├── 📄 printReportModal.tsx
│   │   │   ├── 📄 printReportModalForIAR.tsx
│   │   │   ├── 📄 printReportModalForICS.tsx
│   │   │   ├── 📄 printReportModalForPAR.tsx
│   │   │   ├── 📄 printReportModalForRIS.tsx
│   │   │   ├── 📄 printingForReports.tsx
│   │   │   ├── 📄 purchaseorderhistorymodel.tsx
│   │   │   ├── 📄 signatorymodel.tsx
│   │   │   └── 📄 userModal.tsx
│   │   ├── 📁 config/
│   │   │   └── 📄 role.ts
│   │   ├── 📁 globalStyle/
│   │   │   └── 🎨 style.css
│   │   ├── 📁 graphql/
│   │   │   ├── 📁 mutations/
│   │   │   │   ├── 📄 department.mutation.ts
│   │   │   │   ├── 📄 inventoryIAR.mutation.ts
│   │   │   │   ├── 📄 propertyAR.mutation.ts
│   │   │   │   ├── 📄 purchaseorder.mutation.ts
│   │   │   │   ├── 📄 requisitionIS.mutation.ts
│   │   │   │   ├── 📄 signatory.mutation.ts
│   │   │   │   └── 📄 user.mutation.ts
│   │   │   └── 📁 queries/
│   │   │       ├── 📄 department.query.ts
│   │   │       ├── 📄 inspectionacceptancereport.query.ts
│   │   │       ├── 📄 propertyacknowledgementreport.ts
│   │   │       ├── 📄 purchaseorder.query.tsx
│   │   │       ├── 📄 requisitionIssueslip.ts
│   │   │       ├── 📄 signatory.query.tsx
│   │   │       └── 📄 user.query.tsx
│   │   ├── 📁 hooks/
│   │   │   └── 📄 usePurchaseOrderForm.ts
│   │   ├── 📁 layouts/
│   │   │   ├── 📁 ui/
│   │   │   │   ├── 📄 card.tsx
│   │   │   │   ├── 📄 customtoolbarforics.tsx
│   │   │   │   ├── 📄 customtoolbarforpar.tsx
│   │   │   │   ├── 📄 customtoolbarforris.tsx
│   │   │   │   ├── 📄 customtoolbarfortable.tsx
│   │   │   │   ├── 📄 departmentToolbar.tsx
│   │   │   │   ├── 📄 genericCustomToolbar.tsx
│   │   │   │   ├── 📄 signatoryToolbar.tsx
│   │   │   │   └── 📄 usersToolbar.tsx
│   │   │   └── 📄 dashboard.tsx
│   │   ├── 📁 navigation/
│   │   │   └── 📄 routes.ts
│   │   ├── 📁 pages/
│   │   │   ├── 📁 departmentFunctions/
│   │   │   │   └── 📄 department_gridColDef.tsx
│   │   │   ├── 📁 icsHighLowFunctions/
│   │   │   │   └── 📄 icsHighLow_gridColDef.tsx
│   │   │   ├── 📁 inventoryFunctions/
│   │   │   │   ├── 📄 inventory_column.tsx
│   │   │   │   └── 📄 inventory_gridColDef.tsx
│   │   │   ├── 📁 issuanceIcsFunctions/
│   │   │   │   ├── 📄 SignatorySelectionContainer.tsx
│   │   │   │   ├── 📄 enhancedToolbar.tsx
│   │   │   │   ├── 📄 row.tsx
│   │   │   │   └── 📄 tableRow.tsx
│   │   │   ├── 📁 issuanceParFunctions/
│   │   │   │   ├── 📄 SignatorySelectionContainer.tsx
│   │   │   │   ├── 📄 enhancedToolbar.tsx
│   │   │   │   ├── 📄 row.tsx
│   │   │   │   └── 📄 tableRow.tsx
│   │   │   ├── 📁 issuanceRisPageFunctions/
│   │   │   │   └── 📄 SignatorySelectionContainer.tsx
│   │   │   ├── 📁 parFunctions/
│   │   │   │   └── 📄 par_gridColDef.tsx
│   │   │   ├── 📁 purchaseOrderFunctions/
│   │   │   │   ├── 📄 purchaseOrderOperations.tsx
│   │   │   │   ├── 📄 purchaseorder_column.tsx
│   │   │   │   └── 📄 purchaseordermodel.tsx
│   │   │   ├── 📁 reportsFunctions/
│   │   │   │   └── 📄 inventory_gridColDef.tsx
│   │   │   ├── 📁 risFunctions/
│   │   │   │   └── 📄 ris_gridColDef.tsx
│   │   │   ├── 📁 usersFunctions/
│   │   │   │   └── 📄 users_gridColDef.tsx
│   │   │   ├── 📄 department.tsx
│   │   │   ├── 📄 genericPageTemplate.tsx
│   │   │   ├── 📄 icsLowHighVolume.tsx
│   │   │   ├── 📄 index.tsx
│   │   │   ├── 📄 inventory.tsx
│   │   │   ├── 📄 issuance.tsx
│   │   │   ├── 📄 issuanceIcsPage.tsx
│   │   │   ├── 📄 issuanceRisPage.tsx
│   │   │   ├── 📄 issueanceParPage.tsx
│   │   │   ├── 📄 property.tsx
│   │   │   ├── 📄 purchaseorder.tsx
│   │   │   ├── 📄 reports.tsx
│   │   │   ├── 📄 requisition.tsx
│   │   │   ├── 📄 role.tsx
│   │   │   ├── 📄 signIn.tsx
│   │   │   ├── 📄 signatories.tsx
│   │   │   └── 📄 users.tsx
│   │   ├── 📁 router/
│   │   │   └── 📄 routes.tsx
│   │   ├── 📁 stores/
│   │   │   ├── 📄 index.tsx
│   │   │   └── 📄 signatoryStore.tsx
│   │   ├── 📁 trash-file-empty-later/
│   │   │   ├── 📄 purchaseordermodel_notused.tsx
│   │   │   └── 📄 purchaseorderrow_notused.tsx
│   │   ├── 📁 types/
│   │   │   ├── 📁 previewPrintDocument/
│   │   │   │   └── 📄 types.tsx
│   │   │   ├── 📁 printReportModal/
│   │   │   │   └── 📄 types.tsx
│   │   │   ├── 📁 signatory/
│   │   │   │   └── 📄 signatoryTypes.tsx
│   │   │   ├── 📁 user/
│   │   │   │   └── 📄 userType.tsx
│   │   │   ├── 📄 genericTypes.tsx
│   │   │   └── 📄 purchaseOrder.ts
│   │   ├── 📁 utils/
│   │   │   ├── 📄 branding.tsx
│   │   │   ├── 📄 constants.ts
│   │   │   ├── 📄 exportCsvpurchaseorderwithItems.ts
│   │   │   ├── 📄 generalUtils.ts
│   │   │   ├── 📄 printPurchaseOrderWithItems.ts
│   │   │   ├── 📄 printSelectedICS.ts
│   │   │   └── 📄 printSelectedPurchaseOrder.ts
│   │   ├── 📄 App.tsx
│   │   ├── 📄 main.tsx
│   │   └── 📄 vite-env.d.ts
│   ├── 🚫 .gitignore
│   ├── 📖 README.md
│   ├── 🖼️ chmsu-logo.png
│   ├── 🖼️ favicon.ico
│   ├── 🌐 index.html
│   ├── 🖼️ logo.png
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 tsconfig.tsbuildinfo
│   └── 📄 vite.config.ts
├── 📁 mysql script/
│   ├── 📁 mysql-workbench-tokyonight-main/
│   │   ├── 📖 README.md
│   │   ├── 📄 code_editor.xml
│   │   ├── 📄 copy.xml
│   │   └── 🖼️ screenshot.png
│   ├── 🗄️ main query.sql
│   ├── 🗄️ po script.sql
│   └── 🗄️ poitems script.sql
├── 📄 .hintrc
└── 📦 api.zip
```

---
*Generated by FileTree Pro Extension*