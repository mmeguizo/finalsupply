import * as React from "react";
import { GET_PURCHASEORDERS } from "../graphql/queries/purchaseorder.query";
import { useQuery, useMutation } from "@apollo/client";
import {
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Tooltip,
  Backdrop,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core/PageContainer";
import PrintIcon from "@mui/icons-material/Print";
import AddIcon from "@mui/icons-material/Add";
import PurchaseOrderModal from "../components/purchaseordermodel";
import {
  ADD_PURCHASEORDER,
  UPDATE_PURCHASEORDER,
  DELETE_PURCHASEORDER,
} from "../graphql/mutations/purchaseorder.mutation";
import ConfirmDialog from "../components/confirmationdialog";
import NotificationDialog from "../components/notifications";
import { formatCategory } from "../utils/generalUtils";
import { exportPurchaseOrdersWithItems } from "../utils/exportCsvpurchaseorderwithItems";
import { printPurchaseOrdersWithItems } from "../utils/printPurchaseOrderWithItems";
import { printSelectedPurchaseOrdersWithItems } from "../utils/printSelectedPurchaseOrder";
import { Menu, MenuItem } from "@mui/material"; // Add this import at the top
import { CustomToolbarForTable } from "../layouts/ui/customtoolbarfortable";

export default function PurchaseOrder() {
  //for submit loading
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data, loading, error } = useQuery(GET_PURCHASEORDERS);
  const [selectedPO, setSelectedPO] = React.useState<any>(null);
  const [openPOModal, setOpenPOModal] = React.useState(false);
  const [editingPO, setEditingPO] = React.useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [deletingPO, setDeletingPO] = React.useState<any>(null);

  // Notifications state
  const [showNotification, setShowNotification] = React.useState(false);
  const [notificationMessage, setNotificationMessage] = React.useState("");
  const [notificationSeverity, setNotificationSeverity] = React.useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const [addPurchaseOrder] = useMutation(ADD_PURCHASEORDER, {
    refetchQueries: [{ query: GET_PURCHASEORDERS }],
  });
  const [deletePurchaseOrder] = useMutation(DELETE_PURCHASEORDER, {
    refetchQueries: [{ query: GET_PURCHASEORDERS }],
  });
  const [updatePurchaseOrder] = useMutation(UPDATE_PURCHASEORDER, {
    refetchQueries: [{ query: GET_PURCHASEORDERS }],
  });

  //custom toolbar

  // Define columns for purchase orders
  const poColumns: GridColDef[] = [
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
  const itemColumns: GridColDef[] = [
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

  // Format purchase orders for DataGrid
  const poRows = React.useMemo(() => {
    if (!data?.purchaseOrders) return [];

    return data.purchaseOrders.map((po: any) => {
      const formatAmount = po.amount ? `₱${po.amount.toFixed(2)}` : "0.00";

      // const formattedDeliveryDate = po.dateofdelivery
      //   ? new Date(Number(po.dateofdelivery)).toLocaleDateString()
      //   : "Not specified";

      // const formattedPaymentDate = po.dateOfPayment
      //   ? new Date(Number(po.dateOfPayment)).toLocaleDateString()
      //   : "Not specified";

      return {
        id: po._id,
        ...po,
        // formattedDeliveryDate,
        // formattedPaymentDate,
        formatAmount,
      };
    });
  }, [data]);

  // Format items for the selected purchase order
  const itemRows = React.useMemo(() => {
    if (!selectedPO?.items) return [];

    return selectedPO.items.map((item: any) => ({
      formatUnitCost: item.unitCost ? `₱${item.unitCost.toFixed(2)}` : "0.00",
      formatAmount: item.amount ? `₱${item.amount.toFixed(2)}` : "0.00",
      id: item._id || `item-${Math.random().toString(36).substr(2, 9)}`,
      ...item,
    }));
  }, [selectedPO]);

  // Handle row click to show items
  const handleRowClick = (params: GridRowParams) => {
    const clickedPO = data?.purchaseOrders.find(
      (po: any) => po.id === params.id
    );
    setSelectedPO(clickedPO || null);
  };

  // Function to export PO with items
  const exportPurchaseOrdersWithItemsFunctions = () => {
    if (selectedPO) {
      exportPurchaseOrdersWithItems(selectedPO);
    } else {
      exportPurchaseOrdersWithItems(data);
    }

    // exportPurchaseOrdersWithItems(selectedPO ?? data);
  };

  // Function to print PO with items
  const printPurchaseOrdersWithItemsFunc = () => {
    printPurchaseOrdersWithItems(data);
  };

  const printSelectedPurchaseOrdersWithItemsFunc = () => {
    printSelectedPurchaseOrdersWithItems(selectedPO);
  };

  const handleOpenAddModal = () => {
    setEditingPO(null);
    setOpenPOModal(true);
  };

  const handleOpenEditModal = (po: any) => {
    setEditingPO(po);
    setOpenPOModal(true);
  };

  const handleCloseModal = () => {
    setOpenPOModal(false);
  };

  //not used delete function
  const handleDeleteModal = (po: any) => {
    setDeletingPO(po);
    setConfirmDialogOpen(true);
  };

  const handleSavePO = async (formData: any) => {
    setIsSubmitting(true); // Start loading
    try {
      // Clean items - remove __typename and handle _id appropriately
      const cleanedItems = formData.items.map((item: any) => {
        const { __typename, ...cleanItem } = item;
        return cleanItem;
      });

      // Clean the formData to remove __typename
      const { __typename, ...cleanFormData } = formData;
      cleanFormData.items = cleanedItems;
      let updatedPO: any;
      if (editingPO) {
        const results = await updatePurchaseOrder({
          variables: {
            input: {
              id: parseInt(editingPO.id),
              ...cleanFormData,
            },
          },
        });
        console.log(results.data);
        let data = results.data.updatePurchaseOrder;

        handleRowClick(data.id);
        console.log(
          "Returned after Updated PO:",
          results.data.updatePurchaseorder
        );
        updatedPO = data;
        // updatedPO = results.data.updatePurchaseorder;
      } else {
        const results = await addPurchaseOrder({
          variables: { input: formData },
        });
        updatedPO = results.data.addPurchaseorder;
      }
      // Update selectedPO state
      setSelectedPO(updatedPO);
      handleCloseModal();
    } catch (err) {
      console.error("Error saving purchase order:", err);
    } finally {
      setIsSubmitting(false); // End loading regardless of outcome
    }
  };

  // Show notification when purchase order is deleted
  React.useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  return (
    <PageContainer title="" breadcrumbs={[]}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {showNotification && (
        <NotificationDialog
          message={notificationMessage}
          severity={notificationSeverity}
          duration={2000}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* <ConfirmDialog
        open={confirmDialogOpen}
        message={`Are you sure you want to delete Purchase Order #${deletingPO?.ponumber || ""}?
        \n all items will be deleted as well.`}
        onClose={handleConfirmDialogClose}
      /> */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error loading purchase orders: {error.message}
        </Alert>
      )}
      {data && data.purchaseOrders && (
        <Stack spacing={3}>
          <Paper sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={poRows}
              columns={poColumns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              slots={{
                toolbar: (props) =>
                  CustomToolbarForTable({
                    props: { ...props, data: selectedPO ?? data },
                    onExportWithItems: exportPurchaseOrdersWithItems,
                    onPrintWithItems: printPurchaseOrdersWithItems,
                    onPrintSelectedWithItems:
                      printSelectedPurchaseOrdersWithItems,
                  }),
                // <CustomToolbar
                //   {...props}
                //   onExportWithItems={exportPurchaseOrdersWithItemsFunctions}
                //   onPrintWithItems={printPurchaseOrdersWithItemsFunc}
                //   onPrintSelectedWithItems={
                //     printSelectedPurchaseOrdersWithItemsFunc
                //   }
                //   // onAddPO={handleOpenAddModal}
                // />
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              onRowClick={handleRowClick}
            />
          </Paper>

          {selectedPO && (
            <Paper sx={{ width: "100%" }}>
              <Box p={2} pb={0}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Items for Purchase Order #{selectedPO.poNumber} -{" "}
                  {selectedPO.supplier}
                </Typography>
              </Box>
              <Box sx={{ height: 300, width: "100%" }}>
                <DataGrid
                  rows={itemRows}
                  columns={itemColumns}
                  hideFooter={itemRows.length <= 10}
                  disableRowSelectionOnClick
                  density="compact"
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                />
              </Box>
            </Paper>
          )}
        </Stack>
      )}
      <PurchaseOrderModal
        open={openPOModal}
        handleClose={handleCloseModal}
        purchaseOrder={editingPO}
        handleSave={handleSavePO}
        isSubmitting={isSubmitting}
      />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </PageContainer>
  );
}

//not used delete functions
// const handleConfirmDialogClose = async (confirmed: boolean) => {
//   if (confirmed && deletingPO) {
//     try {
//       const { data } = await deletePurchaseOrder({
//         variables: { id: deletingPO._id },
//       });
//       // Maybe show success message
//       if (data?.deletePurchaseorder) {
//         setNotificationMessage(
//           `Purchase Order #${deletingPO.ponumber} deleted successfully`
//         );
//         setNotificationSeverity("success");
//         setShowNotification(true);

//         // Clear selectedPO if it was the deleted one
//         if (selectedPO?._id === deletingPO._id) {
//           setSelectedPO(null);
//         }
//       }
//     } catch (error) {
//       console.error("Error deleting purchase order:", error);
//       // Maybe show error message
//       setNotificationMessage("Error deleting purchase order");
//       setNotificationSeverity("error");
//       setShowNotification(true);
//     }
//   }
//   // Reset state regardless of result
//   setConfirmDialogOpen(false);
//   setDeletingPO(null);
// };

/*
 <Tooltip title="Print Selected">
        <Button
          startIcon={<PrintIcon />}
          onClick={onPrintSelectedWithItems}
          sx={{ ml: 1 }}
        >
          Print Selected
        </Button>
      </Tooltip>

      <Tooltip title="Print All">
        <Button
          startIcon={<PrintIcon />}
          onClick={onPrintWithItems}
          sx={{ ml: 1 }}
        >
          Print All
        </Button>
      </Tooltip> 
*/

// Custom toolbar with export button for PO with items
// function CustomToolbar({
//   onExportWithItems,
//   onPrintWithItems,
//   onPrintSelectedWithItems,
//   // onAddPO,
// }: any) {
//   const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
//   const open = Boolean(anchorEl);

//   const handlePrintClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   return (
//     <GridToolbarContainer>
//       <GridToolbarColumnsButton />
//       <GridToolbarFilterButton />
//       <GridToolbarDensitySelector />

//       {/*<Button*/}
//       {/*  color="primary"*/}
//       {/*  startIcon={<AddIcon />}*/}
//       {/*  onClick={onAddPO}*/}
//       {/*  sx={{ ml: 1 }}*/}
//       {/*>*/}
//       {/*  Add PO*/}
//       {/*</Button>*/}
//       <Tooltip title="Export">
//         <Button
//           startIcon={<FileDownloadIcon />}
//           onClick={onExportWithItems}
//           sx={{ ml: 1 }}
//         >
//           Export
//         </Button>
//       </Tooltip>

//       <Button
//         startIcon={<PrintIcon />}
//         onClick={handlePrintClick}
//         sx={{ ml: 1 }}
//       >
//         Print
//       </Button>
//       <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
//         <MenuItem
//           onClick={() => {
//             onPrintSelectedWithItems();
//             handleClose();
//           }}
//         >
//           Print Selected
//         </MenuItem>
//         <MenuItem
//           onClick={() => {
//             onPrintWithItems();
//             handleClose();
//           }}
//         >
//           Print All
//         </MenuItem>
//       </Menu>

//       <GridToolbarQuickFilter />
//     </GridToolbarContainer>
//   );
// }

// Custom toolbar with export button for PO with items
