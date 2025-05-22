import * as React from "react";
//@ts-ignore
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
//@ts-ignore
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import DrawIcon from '@mui/icons-material/Draw';
//@ts-ignore
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import type { Navigation } from "@toolpad/core/AppProvider";
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
export const ALL_NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    title: "Dashboard",
    icon: React.createElement(DashboardCustomizeIcon),
  },
  {
    segment: "purchaseorder",
    title: "Purchase Order",
    icon: React.createElement(BusinessCenterIcon),
  },
  {
    segment: "inventory",
    title: "Inspection Acceptance Report ",
    icon: React.createElement(ShowChartIcon),
  },
  {
    segment: "signatories",
    title: "Signatories",
    icon: React.createElement(DrawIcon),
  },
  {
    segment: "ics-lv-hv",
    title: "Inventory Custodian Slip",
    icon: React.createElement(AddBusinessIcon) ,
  },
  {
    segment: "requisition",
    title: "Requisition Issue Slip",
    icon: React.createElement(DocumentScannerIcon) ,
  },
];
