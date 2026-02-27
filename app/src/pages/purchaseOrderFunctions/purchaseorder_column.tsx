import { GridColDef } from "@mui/x-data-grid";
import { formatCategory } from "../../utils/generalUtils";
import { Button, Chip } from "@mui/material";
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
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PendingIcon from "@mui/icons-material/Pending";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";

/**
 * Check if an item is fully delivered and complete (not editable).
 */
export const isItemDeliveredAndComplete = (row: any): boolean => {
  const qty = Number(row.quantity ?? 0);
  const received = Number(row.actualQuantityReceived ?? 0);
  const deliveryStatus = row.deliveryStatus || "pending";
  return deliveryStatus === "delivered" && qty > 0 && received >= qty;
};
// Define columns for purchase orders
export const createPoColumns = (
  handleOpenEditModal: (po: any) => void,
  handleOpenHistoryModal: (po: any) => void,
  handleOpenPrintModal: (po: any) => void,
  handleOpenOverview?: (po: any) => void,
): GridColDef[] => [
  {
    field: "poNumber",
    headerName: "Purchase Order #",
    width: 150,
  },
  {
    field: "supplier",
    headerName: "Supplier",
    width: 100,
    flex: 1,
  },
  {
    field: "campus",
    headerName: "Campus",
    width: 120,
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
    type: "string",
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
      // Move hook outside StatusButton to prevent recreation
      const [updatePurchaseOrder, { loading }] = useMutation(
        UPDATE_PURCHASEORDER,
        {
          awaitRefetchQueries: true,
          refetchQueries: ["GET_PURCHASEORDERS", "GET_ALL_PURCHASEORDER_ITEMS"],
        },
      );

      const StatusButton = () => {
        const allItemsComplete = params.row.items.length
          ? params.row.items.every(
              (item: any) =>
                item.quantity === item.actualQuantityReceived &&
                item.quantity > 0,
            )
          : false;

        const handleMarkComplete = async (e: React.MouseEvent) => {
          console.log("🎯 Handler called!");
          e.stopPropagation();
          e.preventDefault();

          try {
            console.log("🟡 Sending mutation for PO:", params.row.id);

            await updatePurchaseOrder({
              variables: {
                input: {
                  id: parseInt(params.row.id),
                  status: "completed",
                  completed_status_date: new Date().toISOString(),
                  markingComplete: true,
                },
              },
            });

            console.log("✅ Status updated successfully");
          } catch (error) {
            console.error("❌ Error:", error);
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
              onMouseDown={(e) => {
                // Use onMouseDown instead of onClick to capture event before re-render
                console.log("🎯 Mouse down - calling handler");
                e.stopPropagation();
                e.preventDefault();
                handleMarkComplete(e);
              }}
              disabled={loading}
              sx={{
                fontSize: "0.5rem",
                whiteSpace: "nowrap",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Updating..." : "Mark Complete"}
            </Button>
          );
        }

        return params.value
          ? params.value.charAt(0).toUpperCase() +
              params.value.slice(1).toLowerCase()
          : "";
      };

      return <StatusButton />;
    },
  },
  {
    field: "update",
    headerName: "Views Item",
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
    headerName: "Item History",
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
    field: "overview",
    headerName: "Overview",
    width: 80,
    renderCell: (params) => (
      <Tooltip title="View PO Overview" placement="top">
        <IconButton
          size="small"
          color="info"
          onClick={(e: any) => {
            e.stopPropagation();
            handleOpenOverview?.(params.row);
          }}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
  },
  // {
  //   field: "print",
  //   headerName: "Print",
  //   width: 100,
  //   renderCell: (params) => (
  //     <Tooltip title="Print" placement="right">
  //       <Button
  //         size="small"
  //         onClick={(e: any) => {
  //           e.stopPropagation(); // Prevent row selection
  //           // @ts-ignore
  //           handleOpenPrintModal(params.row);
  //         }}
  //       >
  //         <PreviewIcon fontSize="large" />
  //       </Button>
  //     </Tooltip>
  //   ),
  // },
];

// Define columns for items (factory function to support delivery status toggle)
export const createItemColumns = (
  onDeliveryStatusChange?: (itemId: string, newStatus: string) => void,
): GridColDef[] => [
  {
    field: "itemNumber",
    headerName: "#",
    width: 50,
    sortable: false,
    filterable: false,
  },
  {
    field: "deliveryStatus",
    headerName: "Delivery",
    width: 120,
    renderCell: (params) => {
      const status = params.value || "pending";
      const itemComplete = isItemDeliveredAndComplete(params.row);
      const colorMap: Record<string, "default" | "success" | "warning"> = {
        pending: "default",
        delivered: "success",
        partial: "warning",
      };
      const iconMap: Record<string, any> = {
        pending: <PendingIcon sx={{ fontSize: 16 }} />,
        delivered: <LocalShippingIcon sx={{ fontSize: 16 }} />,
        partial: <PendingIcon sx={{ fontSize: 16 }} />,
      };
      const nextStatus: Record<string, string> = {
        pending: "delivered",
        delivered: "pending",
        partial: "delivered",
      };
      const hasReceived = Number(params.row.actualQuantityReceived ?? 0) > 0;

      if (itemComplete) {
        return (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            label="Complete"
            color="success"
            size="small"
            variant="filled"
            sx={{ fontWeight: 500 }}
          />
        );
      }

      return (
        <Chip
          icon={iconMap[status]}
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          color={colorMap[status]}
          size="small"
          variant={status === "pending" ? "outlined" : "filled"}
          onClick={
            hasReceived
              ? (e) => {
                  e.stopPropagation();
                  onDeliveryStatusChange?.(
                    String(params.row.id),
                    nextStatus[status],
                  );
                }
              : undefined
          }
          sx={{
            cursor: hasReceived ? "pointer" : "default",
            fontWeight: 500,
            opacity: hasReceived ? 1 : 0.6,
          }}
        />
      );
    },
  },
  {
    field: "category",
    headerName: "Category",
    width: 150,
    valueFormatter: (params) => formatCategory(params),
  },
  { field: "itemName", headerName: "Item", width: 150 },
  {
    field: "description",
    headerName: "Description",
    width: 300,
    flex: 1,
    editable: true,
  },
  { field: "unit", headerName: "Unit", width: 100, editable: true },
  {
    field: "actualQuantityReceived",
    headerName: "Actual Received",
    type: "number",
    width: 100,
  },
  { field: "quantity", headerName: "Quantity", type: "number", width: 100 },
  {
    field: "formatUnitCost",
    headerName: "Unit Cost",
    type: "string",
    width: 120,
  },
  {
    field: "formatAmount",
    headerName: "Amount",
    type: "string",
    width: 120,
  },
  {
    field: "deliveredDate",
    headerName: "Delivered Date",
    width: 120,
    valueFormatter: (params) => {
      if (!params) return "";
      return new Date(params).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
];

// Backward compatible static columns (without delivery toggle)
export const itemColumns: GridColDef[] = createItemColumns();
