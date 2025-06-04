import { GridColDef } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import PreviewIcon from "@mui/icons-material/Preview";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import PrintDisabledIcon from "@mui/icons-material/PrintDisabled";
import { GridRenderCellParams, GridCellParams } from "@mui/x-data-grid";
// Define columns for inventory items
export const createItemColumns = (
  handleOpenPrintModal: (item: any) => void
): GridColDef[] => [
  {
    field: "risId",
    headerName: "RIS ID",
    width: 100,
    // valueGetter: (params: any) => params.poNumber,
  },
  {
    field: "PurchaseOrder",
    headerName: "P.O. #",
    width: 150,
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
    headerName: "Printed",
    width: 100,
    renderCell: (params: GridRenderCellParams) => {
      return (
        <div
          style={{
            paddingTop: "8px",
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {params.row.risId ? (
            <PrintDisabledIcon color="disabled" />
          ) : (
            <LocalPrintshopIcon color="success" />
          )}
        </div>
      );
    },
  },
];
