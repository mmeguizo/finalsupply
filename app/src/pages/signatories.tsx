import * as React from "react";
import { create } from "zustand";
// @ts-ignore
import { GET_SIGNATORIES } from "../graphql/queries/signatory.query";
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
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core/PageContainer";
//@ts-ignore
import AddIcon from "@mui/icons-material/Add";
//@ts-ignore
import SignatoryModal from "../components/signatorymodel";
import {
  ADD_SIGNATORY,
  UPDATE_SIGNATORY,
  DELETE_SIGNATORY,
  REACTIVATE_SIGNATORY,
} from "../graphql/mutations/signatory.mutation";
import ConfirmDialog from "../components/confirmationdialog";
import NotificationDialog from "../components/notifications";
// import { CustomToolbarForTable } from "../layouts/ui/customtoolbarfortable";
// Add this import
//@ts-ignore
import { SignatoryToolbar } from "../layouts/ui/SignatoryToolbar";
import DrawIcon from "@mui/icons-material/Draw";
//@ts-ignore
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { SignatoryTypes } from "../types/signatory/signatoryTypes";
// Add this interface at the top of your file
import useSignatoryStore from "../stores/signatoryStore";

export default function Signatory() {
  // State management
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data, loading, error } = useQuery(GET_SIGNATORIES);
  const [openSignatoryModal, setOpenSignatoryModal] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  const [selectedSignatory, setSelectedSignatory] =
    React.useState<SignatoryTypes | null>(null);
  const [editingSignatory, setEditingSignatory] =
    React.useState<SignatoryTypes | null>(null);
  const [deletingSignatory, setDeletingSignatory] =
    React.useState<SignatoryTypes | null>(null);

  const fetchSignatories = useSignatoryStore((state) => state.fetchSignatories);

  // Notifications state
  const [showNotification, setShowNotification] = React.useState(false);
  const [notificationMessage, setNotificationMessage] = React.useState("");
  const [notificationSeverity, setNotificationSeverity] = React.useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const client = useApolloClient();

  // Mutations
  const [addSignatory] = useMutation(ADD_SIGNATORY, {
    refetchQueries: [{ query: GET_SIGNATORIES }],
    onCompleted: () => {
      client.cache.evict({ id: "ROOT_QUERY", fieldName: "signatories" });
      client.cache.gc();
    },
  });

  const [updateSignatory] = useMutation(UPDATE_SIGNATORY, {
    refetchQueries: [{ query: GET_SIGNATORIES }],
    onCompleted: () => {
      client.cache.evict({ id: "ROOT_QUERY", fieldName: "signatories" });
      client.cache.gc();
    },
  });

  const [deleteSignatory] = useMutation(DELETE_SIGNATORY, {
    refetchQueries: [{ query: GET_SIGNATORIES }],
  });

  // Format signatories for DataGrid
  const signatoryRows = React.useMemo(() => {
    if (!data?.signatories) return [];
    return data.signatories.map((signatory: any) => ({
      id: signatory.id,
      ...signatory,
    }));
  }, [data]);

  // Handle row click to show details
  const handleRowClick = (params: GridRowParams) => {
    const clickedSignatory = data?.signatories.find(
      (signatory: any) => signatory.id === params.id
    );
    setSelectedSignatory(clickedSignatory || null);
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingSignatory(null);
    setOpenSignatoryModal(true);
  };

  const handleOpenEditModal = (signatory: any) => {
    setEditingSignatory(signatory);
    setOpenSignatoryModal(true);
  };

  const handleCloseModal = () => {
    setOpenSignatoryModal(false);
  };

  const handleDeleteModal = (signatory: any) => {
    setDeletingSignatory(signatory);
    setConfirmDialogOpen(true);
  };

  // Handle save signatory
  const handleSaveSignatory = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Clean the formData to remove __typename
      const { __typename, ...cleanFormData } = formData;

      let updatedSignatory: any;

      if (editingSignatory) {
        const results = await updateSignatory({
          variables: {
            input: {
              id: parseInt(editingSignatory.id),
              ...cleanFormData,
            },
          },
        });
        updatedSignatory = results.data.updateSignatory;
        // After success, refresh the store
        fetchSignatories();
      } else {
        const results = await addSignatory({
          variables: { input: cleanFormData },
        });
        updatedSignatory = results.data.addSignatory;
      }

      // Update selectedSignatory state
      setSelectedSignatory(updatedSignatory);
      handleCloseModal();

      // Show success notification
      setNotificationMessage(
        `Signatory ${editingSignatory ? "updated" : "added"} successfully`
      );
      setNotificationSeverity("success");
      setShowNotification(true);
    } catch (err) {
      console.error("Error saving signatory:", err);

      // Show error notification
      setNotificationMessage(
        `Error ${editingSignatory ? "updating" : "adding"} signatory`
      );
      setNotificationSeverity("error");
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirm dialog close
  const handleConfirmDialogClose = async (confirmed: boolean) => {
    if (confirmed && deletingSignatory) {
      try {
        const { data } = await deleteSignatory({
          variables: { id: deletingSignatory.id },
        });

        if (data?.deleteSignatory) {
          setNotificationMessage(
            `Signatory ${deletingSignatory.name} deleted successfully`
          );
          setNotificationSeverity("success");
          setShowNotification(true);

          // Clear selectedSignatory if it was the deleted one
          if (selectedSignatory?.id === deletingSignatory?.id) {
            setSelectedSignatory(null);
          }
        }
      } catch (error) {
        console.error("Error deleting signatory:", error);

        setNotificationMessage("Error deleting signatory");
        setNotificationSeverity("error");
        setShowNotification(true);
      }
    }

    // Reset state regardless of result
    setConfirmDialogOpen(false);
    setDeletingSignatory(null);
  };

  // Auto-hide notifications after a delay
  React.useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Define signatory columns for DataGrid
  const signatoryColumns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" sx={{ marginTop: "6%" }} spacing={1}>
          <Tooltip title="Edit">
            {/* <Button
              size="small"
              onClick={() => handleOpenEditModal(params.row)}
              variant="outlined"
            >
              Edit
            </Button> */}
            <DrawIcon
              color="warning"
              sx={{ cursor: "pointer" }}
              onClick={() => handleOpenEditModal(params.row)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            {/* <Button
              size="small"
              onClick={() => handleDeleteModal(params.row)}
              variant="outlined"
              color="error"
            >
              Delete
            </Button> */}
            <DeleteForeverIcon
              color="error"
              sx={{ cursor: "pointer" }}
              onClick={() => handleDeleteModal(params.row)}
            />
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: "hidden" }}>
      {loading && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      )}

      {showNotification && (
        <NotificationDialog
          open={showNotification}
          message={notificationMessage}
          severity={notificationSeverity}
          onClose={() => setShowNotification(false)}
        />
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading signatories: {error.message}
        </Alert>
      )}

      {data && (
        <Box>
          <Paper>
            {/* <Typography variant="h6" gutterBottom>
              Signatories
            </Typography> */}
            <DataGrid
              rows={signatoryRows}
              columns={signatoryColumns}
              autoHeight
              density="standard"
              disableRowSelectionOnClick={false}
              pageSizeOptions={[5, 10, 25, 100]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              // slots={{
              //   toolbar: (props) =>
              //     CustomToolbarForTable({
              //       props: { ...props, data: data },
              //       onAddSignatory: handleOpenAddModal,
              //     }),
              // }}
              slots={{
                toolbar: (props) =>
                  SignatoryToolbar({
                    props: { ...props, data: data },
                    onAddSignatory: handleOpenAddModal,
                    // Add onExportData if you need export functionality
                    // onExportData: exportSignatories,
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

          {selectedSignatory && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Signatory Details
              </Typography>
              <Box>
                <Typography>
                  <strong>Name:</strong> {selectedSignatory.name}
                </Typography>
                <Typography>
                  <strong>Role:</strong> {selectedSignatory.role}
                </Typography>
                {selectedSignatory.purchaseOrderId && (
                  <Typography>
                    <strong>Purchase Order ID:</strong>{" "}
                    {selectedSignatory.purchaseOrderId}
                  </Typography>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {openSignatoryModal && (
        <SignatoryModal
          open={openSignatoryModal}
          onClose={handleCloseModal}
          onSave={handleSaveSignatory}
          signatory={editingSignatory}
        />
      )}

      <ConfirmDialog
        open={confirmDialogOpen}
        message={`Are you sure you want to delete the signatory "${deletingSignatory?.name}"?`}
        onClose={handleConfirmDialogClose}
      />

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </PageContainer>
  );
}
