import { GridColDef } from '@mui/x-data-grid';
import { formatCategory } from '../../utils/generalUtils';
import { Button } from "@mui/material";

// Define columns for purchase orders
export const createPoColumns = (handleOpenEditModal : (po : any) => void) : GridColDef[] => [
    {
        field: "poNumber",
        headerName: "Purchase Order #",
        width: 150,
    },
    {
        field: "supplier",
        headerName: "Supplier",
        width: 200,
        flex: 1,
    },
    {
        field: "placeOfDelivery", // Use the pre-formatted field
        headerName: "Place of Delivery",
        width: 150,
        // No formatter needed!
    },
    {
        field: "dateOfPayment", // Use the pre-formatted field
        headerName: "P.O Date",
        width: 150,
        // No formatter needed!
    },
    {
        field: "formatAmount",
        headerName: "Amount",
        type: "number",
        width: 150,
        align: "right",
        headerAlign: "right",
    },

    {
        field: "status",
        headerName: "Status",
        width: 100,
        align: "right",
        headerAlign: "right",
        valueFormatter: (params: string) => {
            if (!params) return "";
            return params.charAt(0).toUpperCase() + params.slice(1).toLowerCase();
        },
    },
    {
        field: "update",
        headerName: "UPDATE",
        width: 100,
        renderCell: (params) => (
            <Button
                size="small"
                onClick={(e: any) => {
                    e.stopPropagation(); // Prevent row selection
                    // @ts-ignore
                    handleOpenEditModal(params.row);
                }}
            >
                UPDATE
            </Button>
        ),
    },

    /*
    {
      field: "delete",
      headerName: "Delete",
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row selection
            handleOpenEditModal(params.row);
          }}
        >
          Edit
        </Button>
      ),
    },
    */
];

// Define columns for items
export const itemColumns: GridColDef[] = [
    {
        field: "category",
        headerName: "Category",
        width: 150,
        valueFormatter: (params) => formatCategory(params),
    },
    { field: "itemName", headerName: "Item", width: 150 },
    { field: "description", headerName: "Description", width: 300, flex: 1 },
    { field: "unit", headerName: "Unit", width: 100 },
    {
        field: "actualQuantityReceived",
        headerName: "Actual Recieved",
        type: "number",
        width: 100,
    },
    { field: "quantity", headerName: "Quantity", type: "number", width: 100 },
    {
        field: "formatUnitCost",
        headerName: "Unit Cost",
        type: "number",
        width: 120,
    },
    {
        field: "formatAmount",
        headerName: "Amount",
        type: "number",
        width: 120,
    },
];
