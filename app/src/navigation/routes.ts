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
    title: "Inspection Acceptance Report",
    icon: React.createElement(BusinessCenterIcon),
  },
  {
    segment: "inventory",
    title: " Inventory",
    icon: React.createElement(ShowChartIcon),
  },
  {
    segment: "signatories",
    title: "Signatories",
    icon: React.createElement(DrawIcon),
  },
  {
    segment: "tests",
    title: "Test",
    icon: React.createElement(AddBusinessIcon) ,
  },
];
