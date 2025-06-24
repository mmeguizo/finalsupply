import * as React from "react";
//@ts-ignore
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
//@ts-ignore
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import DrawIcon from "@mui/icons-material/Draw";
//@ts-ignore
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import type { Navigation } from "@toolpad/core/AppProvider";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
//@ts-ignore
import CabinIcon from '@mui/icons-material/Cabin';
import SummarizeIcon from '@mui/icons-material/Summarize';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
//@ts-ignore
import CorporateFareIcon from '@mui/icons-material/CorporateFare';


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
    segment: "ics-lv-hv",
    title: "Inventory Custodian Slip",
    icon: React.createElement(AddBusinessIcon),
  },
  {
    segment: "requisition",
    title: "Requisition Issue Slip",
    icon: React.createElement(DocumentScannerIcon),
  },
  {
    segment: "property",
    title: "Property Acknowledgement Reciept",
    icon: React.createElement(CabinIcon),
  },
  {
    segment: "signatories",
    title: "Signatories",
    icon: React.createElement(DrawIcon),
  },
  {
    segment: "reports",
    title: "Reports",
    icon: React.createElement(SummarizeIcon),
  },
  {
    segment: "users",
    title: "Users",
    icon: React.createElement(PeopleAltIcon),
    children: [
      {
        segment: 'users',
        title: 'Users',
        icon: React.createElement(FingerprintIcon),
      },
      {
        segment: 'role',
        title: 'Role',
       icon: React.createElement(EngineeringIcon),
      },
      {
        segment: 'department',
        title: 'Department',
       icon: React.createElement(CorporateFareIcon),
      },
    ],
  },
];
