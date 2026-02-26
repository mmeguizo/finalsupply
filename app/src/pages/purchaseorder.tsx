import * as React from "react";
// @ts-ignore
import { GET_PURCHASEORDERS } from "../graphql/queries/purchaseorder.query";
// @ts-ignore
import { GET_ALL_PURCHASEORDER_ITEMS } from "../graphql/queries/purchaseorder.query";
// @ts-ignore
import { GET_ALL_DASHBOARD_DATA } from "../graphql/queries/purchaseorder.query";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
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
// @ts-ignore
import AddIcon from "@mui/icons-material/Add";
import PurchaseOrderModal from "./purchaseOrderFunctions/purchaseordermodel";
import PurchaseOrderHistoryModal from "../components/purchaseorderhistorymodel";

import {
  ADD_PURCHASEORDER,
  UPDATE_PURCHASEORDER,
  DELETE_PURCHASEORDER,
  UPDATE_ITEM_DELIVERY_STATUS,
} from "../graphql/mutations/purchaseorder.mutation";
import ConfirmDialog from "../components/confirmationdialog";
import NotificationDialog from "../components/notifications";
import { formatCategory, currencyFormat } from "../utils/generalUtils";
import { exportPurchaseOrdersWithItems } from "../utils/exportCsvpurchaseorderwithItems";
import { printPurchaseOrdersWithItems } from "../utils/printPurchaseOrderWithItems";
import { printSelectedPurchaseOrdersWithItems } from "../utils/printSelectedPurchaseOrder";
import { Menu, MenuItem } from "@mui/material"; // Add this import at the top
import { CustomToolbarForTable } from "../layouts/ui/customtoolbarfortable";
import {
  createPoColumns,
  itemColumns,
  createItemColumns,
} from "./purchaseOrderFunctions/purchaseorder_column";
import { handleSavePurchaseOrder } from "./purchaseOrderFunctions/purchaseOrderOperations";
import PurchaseOrderPrintModal from "../components/printReportModal";
import PrintReportDialog from "../components/printReportModal";
import GenerateIarModal from "../components/GenerateIarModal";
// @ts-ignore
import { GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY } from "../graphql/queries/propertyacknowledgementreport";
// @ts-ignore
import { GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY } from "../graphql/queries/requisitionIssueslip";
// @ts-ignore Add IAR list so inventory can refresh after PO updates
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT } from "../graphql/queries/inspectionacceptancereport.query";
import { GENERATE_IAR_FROM_PO } from "../graphql/mutations/inventoryIAR.mutation";

export default function PurchaseOrder() {
  //for submit loading
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data, loading, error } = useQuery(GET_PURCHASEORDERS);
  const [selectedPO, setSelectedPO] = React.useState<any>(null);
  const [openPOModal, setOpenPOModal] = React.useState(false);
  const [openHistoryModal, setOpenHistoryModal] = React.useState(false);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [printPO, setPrintPO] = React.useState<any>(null);
  const [editingPO, setEditingPO] = React.useState<any>(null);
  const [historyPO, setHistoryPO] = React.useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [deletingPO, setDeletingPO] = React.useState<any>(null);
  // Generate IAR modal state
  const [openGenerateIarModal, setOpenGenerateIarModal] = React.useState(false);
  const [generateIarPO, setGenerateIarPO] = React.useState<any>(null);
  const [isGeneratingIar, setIsGeneratingIar] = React.useState(false);
  // Notifications state
  const [showNotification, setShowNotification] = React.useState(false);
  const [notificationMessage, setNotificationMessage] = React.useState("");
  const [notificationSeverity, setNotificationSeverity] = React.useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const client = useApolloClient(); // ADD THIS LINE!
  const [addPurchaseOrder] = useMutation(ADD_PURCHASEORDER, {
    awaitRefetchQueries: true,
    refetchQueries: [
      // Refresh the main list and dashboard aggregates
      { query: GET_PURCHASEORDERS },
      { query: GET_ALL_DASHBOARD_DATA },
      // Also refresh inventory IAR list because PO fields show up there
      { query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT },
    ],
  });
  // const [addPurchaseOrder] = useMutation(ADD_PURCHASEORDER, {
  //   refetchQueries: [{ query: GET_PURCHASEORDERS  },
  //     {query : GET_ALL_PURCHASEORDER_ITEMS}],
  // });
  const [deletePurchaseOrder] = useMutation(DELETE_PURCHASEORDER, {
    awaitRefetchQueries: true,
    refetchQueries: [
      { query: GET_PURCHASEORDERS },
      { query: GET_ALL_DASHBOARD_DATA },
      { query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT },
    ],
  });
  const [updatePurchaseOrder] = useMutation(UPDATE_PURCHASEORDER, {
    awaitRefetchQueries: true,
    refetchQueries: [
      // Refresh the main list and dashboard aggregates
      { query: GET_PURCHASEORDERS },
      { query: GET_ALL_DASHBOARD_DATA },
      // Keep inventory in sync without manual reload
      { query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT },
    ],
  });
  const [updateDeliveryStatus] = useMutation(UPDATE_ITEM_DELIVERY_STATUS, {
    refetchQueries: [{ query: GET_PURCHASEORDERS }],
  });

  const [generateIARFromPOMutation] = useMutation(GENERATE_IAR_FROM_PO, {
    awaitRefetchQueries: true,
    refetchQueries: [
      { query: GET_PURCHASEORDERS },
      { query: GET_ALL_DASHBOARD_DATA },
      { query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT },
    ],
  });

  // Handler for delivery status toggle
  const handleDeliveryStatusChange = React.useCallback(
    async (itemId: string, newStatus: string) => {
      try {
        const { data: result } = await updateDeliveryStatus({
          variables: { itemId, deliveryStatus: newStatus },
        });
        if (result?.updateItemDeliveryStatus?.success) {
          setNotificationMessage(`Item marked as ${newStatus}`);
          setNotificationSeverity("success");
          setShowNotification(true);
        }
      } catch (err) {
        console.error("Delivery status update failed:", err);
        setNotificationMessage("Failed to update delivery status");
        setNotificationSeverity("error");
        setShowNotification(true);
      }
    },
    [updateDeliveryStatus],
  );

  // Create item columns with delivery toggle
  const deliveryItemColumns = React.useMemo(
    () => createItemColumns(handleDeliveryStatusChange),
    [handleDeliveryStatusChange],
  );
  // const [updatePurchaseOrder] = useMutation(UPDATE_PURCHASEORDER, {
  //   refetchQueries: [{ query: GET_PURCHASEORDERS }],
  // });

  // Format purchase orders for DataGrid
  const poRows = React.useMemo(() => {
    if (!data?.purchaseOrders) return [];

    return data.purchaseOrders.map((po: any) => {
      // const formatAmount = po.amount ? `₱${po.amount.toFixed(2)}` : "0.00";
      return {
        // Use the GraphQL id for consistency with cache normalization
        id: po.id,
        ...po,
        campus: po.campus,
        // formattedDeliveryDate,
        // formattedPaymentDate,
        formatAmount: currencyFormat(po.amount),
      };
    });
  }, [data]);

  // Format items for the selected purchase order
  const itemRows = React.useMemo(() => {
    if (!selectedPO?.items) return [];

    return selectedPO.items.map((item: any) => ({
      id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      formatUnitCost: currencyFormat(item.unitCost),
      formatAmount: currencyFormat(item.amount),
    }));
  }, [selectedPO]);

  // Inline edit handler for item details (description, unit)
  const processItemRowUpdate = React.useCallback(
    async (newRow: any, oldRow: any) => {
      // If nothing relevant changed, return early
      const changedDescription = newRow.description !== oldRow.description;
      const changedUnit = newRow.unit !== oldRow.unit;
      if (!changedDescription && !changedUnit) return newRow;

      try {
        const resp = await updatePurchaseOrder({
          variables: {
            input: {
              id: parseInt(selectedPO.id),
              items: [
                {
                  id: newRow.id,
                  description: newRow.description,
                  unit: newRow.unit,
                  changeReason: "Edited item details",
                },
              ],
            },
          },
        });

        // Update local selectedPO with server response to keep items in sync
        const updated = resp?.data?.updatePurchaseOrder;
        if (updated) {
          setSelectedPO(updated);
        }

        setNotificationMessage("Item details updated");
        setNotificationSeverity("success");
        setShowNotification(true);
        return newRow;
      } catch (err: any) {
        console.error("Failed to update item details", err);
        setNotificationMessage(err?.message || "Failed to update item details");
        setNotificationSeverity("error");
        setShowNotification(true);
        // Revert to old row
        return oldRow;
      }
    },
    [selectedPO, updatePurchaseOrder],
  );

  // Handle row click to show items
  const handleRowClick = (params: GridRowParams) => {
    const clickedPO = data?.purchaseOrders.find(
      (po: any) => po.id === params.id,
    );
    setSelectedPO(clickedPO || null);
  };

  // Keep selectedPO in sync when data refreshes (e.g., after generating IAR)
  React.useEffect(() => {
    if (selectedPO && data?.purchaseOrders) {
      const refreshed = data.purchaseOrders.find(
        (po: any) => po.id === selectedPO.id,
      );
      if (refreshed) {
        setSelectedPO(refreshed);
      }
    }
  }, [data]);

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

  const handleOpenHistoryModal = (po: any) => {
    if (!po.items || po.items.length === 0) {
      setNotificationMessage("There are no items yet for this Purchase Order.");
      setNotificationSeverity("warning"); // or 'warning' if preferred
      setShowNotification(true);
      return;
    }
    setHistoryPO(po);
    setOpenHistoryModal(true);
  };
  const handleOpenPrintModal = (po: any) => {
    setPrintPO(po);
    setOpenPrintModal(true);
  };

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
    setHistoryPO(null);
  };
  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintPO(null);
  };

  // Generate IAR handlers
  const handleOpenGenerateIarModal = (po: any) => {
    setGenerateIarPO(po);
    setOpenGenerateIarModal(true);
  };

  const handleCloseGenerateIarModal = () => {
    setOpenGenerateIarModal(false);
    setGenerateIarPO(null);
  };

  const handleGenerateIAR = async (purchaseOrderId: number, items: any[]) => {
    setIsGeneratingIar(true);
    try {
      const { data: result } = await generateIARFromPOMutation({
        variables: { purchaseOrderId, items },
      });
      if (result?.generateIARFromPO?.success) {
        setNotificationMessage(result.generateIARFromPO.message);
        setNotificationSeverity("success");
        setShowNotification(true);
        handleCloseGenerateIarModal();
        // The PO data refreshes via refetchQueries; update selectedPO when data refreshes
      }
    } catch (err: any) {
      setNotificationMessage(err.message || "Failed to generate IAR");
      setNotificationSeverity("error");
      setShowNotification(true);
    } finally {
      setIsGeneratingIar(false);
    }
  };

  const handleCloseModal = () => {
    setOpenPOModal(false);
  };

  //not used delete function
  const handleDeleteModal = (po: any) => {
    setDeletingPO(po);
    setConfirmDialogOpen(true);
  };

  //for saving the po or submitting
  const handleSavePO = async (formData: any) => {
    console.log({ handleSavePO: formData });

    const result = await handleSavePurchaseOrder(
      formData,
      editingPO,
      updatePurchaseOrder,
      addPurchaseOrder,
      handleRowClick,
      setSelectedPO,
      handleCloseModal,
      setIsSubmitting,
    );

    // Display notification based on the result
    setNotificationMessage(result.message);
    setNotificationSeverity(result.success ? "success" : "error");
    setShowNotification(true);
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

  const poColumns = React.useMemo(
    () =>
      createPoColumns(
        handleOpenEditModal,
        handleOpenHistoryModal,
        handleOpenPrintModal,
      ),
    [handleOpenEditModal, handleOpenHistoryModal, handleOpenPrintModal],
  );

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: "hidden" }}>
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

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error loading purchase orders: {error.message}
        </Alert>
      )}
      {data && data.purchaseOrders && (
        <Stack
          spacing={3}
          sx={{
            width: "100%",
            overflow: "auto",
            maxHeight: "calc(100vh - 100px)",
          }}
        >
          <Paper sx={{ width: "100%" }}>
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
                    onAddPO: handleOpenAddModal,
                  }),
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              onRowClick={handleRowClick}
              sx={{ minHeight: 400 }}
            />
          </Paper>

          {selectedPO && (
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <Box
                p={2}
                pb={0}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Items for Purchase Order #{selectedPO.poNumber} -{" "}
                  {selectedPO.supplier}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleOpenGenerateIarModal(selectedPO)}
                  disabled={
                    selectedPO.status?.toLowerCase() === "completed" ||
                    !selectedPO.items?.some(
                      (item: any) =>
                        !item.isDeleted &&
                        Number(item.quantity ?? 0) -
                          Number(item.actualQuantityReceived ?? 0) >
                          0,
                    )
                  }
                >
                  Generate IAR
                </Button>
              </Box>
              <Box sx={{ width: "100%", overflow: "hidden" }}>
                <DataGrid
                  rows={itemRows}
                  columns={deliveryItemColumns}
                  hideFooter={itemRows.length <= 10}
                  disableRowSelectionOnClick
                  isCellEditable={() => selectedPO?.status !== "completed"}
                  processRowUpdate={processItemRowUpdate}
                  onProcessRowUpdateError={(error) => {
                    console.error(error);
                  }}
                  density="compact"
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  sx={{ minHeight: 300 }}
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
      <PurchaseOrderHistoryModal
        open={openHistoryModal}
        handleClose={handleCloseHistoryModal}
        purchaseOrder={historyPO}
      />
      <PrintReportDialog
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printPO}
        reportType="inspection"
      />
      <GenerateIarModal
        open={openGenerateIarModal}
        handleClose={handleCloseGenerateIarModal}
        purchaseOrder={generateIarPO}
        onGenerate={handleGenerateIAR}
        isSubmitting={isGeneratingIar}
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
