import { GridColDef } from "@mui/x-data-grid";
import { formatTimestampToDateTime } from "../../utils/generalUtils";
import { Button } from "@mui/material";
import PreviewIcon from '@mui/icons-material/Preview';
// Define columns for inventory items
export const createItemColumns = (
  handleOpenPrintModal: (item: any) => void
): GridColDef[] => [
  {
    field: "createdAt",
    headerName: "Date",
    width: 250,
    // Use the reusable function directly in renderCell
    renderCell: (params) => formatTimestampToDateTime(params.value as string),
  },
  {
    field: "iarId",
    headerName: "IAR #",
    width: 250,
  },
  // If you later need the print button, uncomment it here:
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