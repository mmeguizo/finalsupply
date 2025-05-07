import { GridColDef } from "@mui/x-data-grid";
import { formatCategory } from "../../utils/generalUtils";
import { Button } from "@mui/material";
//@ts-ignore
import EditNoteIcon from "@mui/icons-material/EditNote";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import PrintIcon from "@mui/icons-material/Print";
import Tooltip from "@mui/material/Tooltip";
import PreviewIcon from "@mui/icons-material/Preview";
import IconButton from "@mui/material/IconButton";
import { useMutation } from "@apollo/client";
import { UPDATE_PURCHASEORDER } from "../../graphql/mutations/purchaseorder.mutation";
//@ts-ignore
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// Define columns for purchase orders
export const createPoColumns = (
  handleOpenEditModal: (po: any) => void,
  handleOpenHistoryModal: (po: any) => void,
  handleOpenPrintModal: (po: any) => void
): GridColDef[] => [
  {
    field: "poNumber",
    headerName: "Purchase Order #",
    width: 150,
  },
  {
    field: "supplier",
    headerName: "Supplier",
    width: 250,
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
    width: 100,
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
    renderCell: (params) => {
      const StatusButton = () => {
        const [updatePurchaseOrder] = useMutation(UPDATE_PURCHASEORDER, {
          refetchQueries: ["GET_PURCHASEORDERS", "GET_ALL_PURCHASEORDER_ITEMS"],
        });

        // Check if all items have received quantities equal to their total quantities
        const allItemsComplete = params.row.items?.every(
          (item: any) => item.quantity === item.actualQuantityReceived && item.quantity > 0
        );

        const handleMarkComplete = async (e: React.MouseEvent) => {
          e.stopPropagation(); // Prevent row selection
          
          try {
            await updatePurchaseOrder({
              variables: {
                input: {
                  id: parseInt(params.row.id),
                  status: "completed",
                  completed_status_date: new Date().toISOString(),
                  markingComplete : true,
                },
              },
            });
          } catch (error) {
            console.error("Error updating status:", error);
          }
        };

        if (params.row.status === "completed") {
          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <CheckCircleIcon color="success" style={{ marginRight: "4px" }} />
              <span>Completed</span>
            </div>
          );
        }

        if (allItemsComplete) {
          return (
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={handleMarkComplete}
              sx={{ fontSize: "0.5rem", whiteSpace: "nowrap" }}
            >
              Mark Complete
            </Button>
          );
        }

        return params.value
          ? params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase()
          : "";
      };

      return <StatusButton />;
    },
  },
  {
    field: "update",
    headerName: "Update",
    width: 100,
    renderCell: (params) => (
        <Tooltip title="Edit" placement="top">
      <Button
        size="small"
        onClick={(e: any) => {
          e.stopPropagation(); // Prevent row selection
          // @ts-ignore
          handleOpenEditModal(params.row);
        }}
      >
        <EditNoteIcon fontSize="large" />
      </Button>
      </Tooltip>
    ),
  },
  {
    field: "viewHistory",
    headerName: "History",
    width: 100,
    renderCell: (params) => (
        <Tooltip title="Item History" placement="top">
      <Button
        sx={{ whiteSpace: "normal" }}
        size="small"
        onClick={(e: any) => {
          e.stopPropagation(); // Prevent row selection
          // @ts-ignore
          handleOpenHistoryModal(params.row);
        }}
      >
        <ManageHistoryIcon fontSize="large" />
      </Button>
      </Tooltip>
    ),
  },
  {
    field: "print",
    headerName: "Print Preview",
    width: 100,
    renderCell: (params) => (
      <Tooltip title="Print Preview" placement="right">
        <Button
          size="small"
          onClick={(e: any) => {
            e.stopPropagation(); // Prevent row selection
            // @ts-ignore
            handleOpenPrintModal(params.row);
          }}
        >
          <PreviewIcon fontSize="large" />
        </Button>
      </Tooltip>
    ),
  },
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
