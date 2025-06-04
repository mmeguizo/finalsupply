import { GridColDef } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import PreviewIcon from "@mui/icons-material/Preview";

// Define columns for inventory items
export const createItemColumns = (
  handleOpenPrintModal: (item: any) => void
): GridColDef[] => [
  {
    field: "iarId",
    headerName: "IAR#",
    width: 100, 
  },
  {
    field: "category",
    headerName: "Category",
    width: 200,
    valueFormatter: (params: any) => {
      let category;
      category = params.split(" ");
      return category
        .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
  },
  {
    field: "PurchaseOrder",
    headerName: "P.O. #",
    width: 80,
    valueGetter: (params: any) => params.poNumber,
  },
  { field: "description", headerName: "Description", width: 300, flex: 1 },
  { field: "unit", headerName: "Unit", width: 100 },
  {
    field: "actualQuantityReceived",
    headerName: "Actual Recieved",
    type: "number",
    width: 70,
  },
  { field: "quantity", headerName: "Quantity", type: "number", width: 100 },
  {
    field: "formatUnitCost",
    headerName: "Unit Cost",
    type: "number",
    width: 80,
  },
  {
    field: "formatAmount",
    headerName: "Amount",
    type: "number",
    width: 120,
  },
  {
    field: "print",
    headerName: "Print",
    width: 100,
    renderCell: (params) => (
        <Button
          size="small"
          onClick={(e: any) => {
            e.stopPropagation(); // Prevent row selection
            handleOpenPrintModal(params.row);
          }}
        >
          <PreviewIcon fontSize="large" />
        </Button>
    ),
  },
];