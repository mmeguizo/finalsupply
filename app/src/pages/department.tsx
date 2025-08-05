import React, { useState } from "react";
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
  Grid,
} from "@mui/material";
import {
  DataGrid,
  GridRowParams,
  GridToolbar,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core/PageContainer";
import { GET_ALL_DEPARTMENTS, GET_DEPARTMENT } from "../graphql/queries/department.query";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import NotificationDialog from "../components/notifications";
import { createDepartmentColumns } from "./departmentFunctions/department_gridColDef";
import { DepartmentToolbar } from "../layouts/ui/departmentToolbar";
import ConfirmDialog from "../components/confirmationdialog";
import { capitalizeFirstLetter } from "../utils/generalUtils";
import DepartmentModal from "../components/departmentModal";
import {
  CREATE_DEPARTMENT,
  UPDATE_DEPARTMENT,
  DELETE_DEPARTMENT,
} from "../graphql/mutations/department.mutation";

interface DepartmentType {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export default function DepartmentPage() {
  const client = useApolloClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data, loading, error } = useQuery(GET_ALL_DEPARTMENTS);
  const [openDepartmentModal, setOpenDepartmentModal] = React.useState(false);
  const [showNotification, setShowNotification] = React.useState(false);
  const [notificationMessage, setNotificationMessage] = React.useState("");
  const [notificationSeverity, setNotificationSeverity] = React.useState<
    "success" | "error" | "info" | "warning"
  >("success");
  
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [selectedDepartment, setSelectedDepartment] = React.useState<DepartmentType | null>(
    null
  );
  const [editingDepartment, setEditingDepartment] = React.useState<DepartmentType | null>(null);
  const [deletingDepartment, setDeletingDepartment] = React.useState<DepartmentType | null>(
    null
  );

  const [deleteDepartment] = useMutation(DELETE_DEPARTMENT, {
    refetchQueries: [{ query: GET_ALL_DEPARTMENTS }],
    onCompleted: () => {
      client.cache.evict({ id: "ROOT_QUERY", fieldName: "departments" });
      client.cache.gc();
    },
  });
  
  const [updateDepartment] = useMutation(UPDATE_DEPARTMENT, {
    refetchQueries: [{ query: GET_ALL_DEPARTMENTS }],
    onCompleted: () => {
      client.cache.evict({ id: "ROOT_QUERY", fieldName: "departments" });
      client.cache.gc();
    },
  });
  
  const [createDepartment] = useMutation(CREATE_DEPARTMENT, {
    refetchQueries: [{ query: GET_ALL_DEPARTMENTS }],
    onCompleted: () => {
      client.cache.evict({ id: "ROOT_QUERY", fieldName: "departments" });
      client.cache.gc();
    },
  });

  const handleOpenAddModal = () => {
    setEditingDepartment(null);
    setOpenDepartmentModal(true);
  };

  const handleOpenEditModal = (department: DepartmentType) => {
    setEditingDepartment(department);
    setOpenDepartmentModal(true);
  };
  
  const handleDeleteModal = (department: DepartmentType) => {
    setDeletingDepartment(department);
    setConfirmDialogOpen(true);
  };

  const departmentColumns = React.useMemo(
    () => createDepartmentColumns(handleOpenEditModal, handleDeleteModal),
    [handleOpenEditModal, handleDeleteModal]
  );

  const departmentsRows = React.useMemo(() => {
    if (!data?.departments) return [];
    return data.departments;
  }, [data]);

  const handleRowClick = (params: GridRowParams) => {
    const clickedDepartment = data?.departments.find((dept: any) => dept.id === params.id);
    setSelectedDepartment(clickedDepartment || null);
  };

  const handleConfirmDialogClose = async (confirmed: boolean) => {
    if (confirmed && deletingDepartment) {
      try {
        const results = await deleteDepartment({
          variables: {
            id: deletingDepartment.id,
          },
        });
        setNotificationMessage(
          `Department "${results.data.deleteDepartment.name}" deleted successfully.`
        );
        setNotificationSeverity("success");
        setShowNotification(true);
        setDeletingDepartment(null);
      } catch (error: any) {
        setNotificationMessage(`Error deleting department: ${error.message}`);
        setNotificationSeverity("error");
        setShowNotification(true);
      }
    }
    setConfirmDialogOpen(false);
  };

  const handleSaveDepartment = async (department: any) => {
    setIsSubmitting(true);
    try {
      let updatedDepartmentData: any;
      
      if (editingDepartment) {
        // Update existing department
        const results = await updateDepartment({
          variables: {
            input: {
              id: editingDepartment.id,
              name: department.name,
              description: department.description,
            },
          },
        });
        updatedDepartmentData = results.data.updateDepartment;
        setNotificationMessage(`Department "${department.name}" updated successfully.`);
      } else {
        // Create new department
        const results = await createDepartment({
          variables: {
            input: {
              name: department.name,
              description: department.description,
            },
          },
        });
        updatedDepartmentData = results.data.createDepartment;
        setNotificationMessage(`Department "${department.name}" created successfully.`);
      }
      
      setNotificationSeverity("success");
      setShowNotification(true);
      setSelectedDepartment(updatedDepartmentData);
      setEditingDepartment(null);
      handleCloseModal();
    } catch (error: any) {
      setNotificationMessage(`Error saving department: ${error.message}`);
      setNotificationSeverity("error");
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setOpenDepartmentModal(false);
  };

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
          Error loading departments: {error.message}
        </Alert>
      )}

      {data && (
        <Box>
          <Paper>
            <DataGrid
              rows={departmentsRows}
              columns={departmentColumns}
              density="standard"
              disableRowSelectionOnClick={false}
              pageSizeOptions={[5, 10, 25, 100]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              slots={{
                toolbar: (props) =>
                  DepartmentToolbar({
                    props: { ...props, data: data },
                    onAddDepartment: handleOpenAddModal,
                  }),
              }}
              onRowClick={handleRowClick}
              sx={{ minHeight: 400 }}
            />
          </Paper>

          {selectedDepartment && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Department Details
              </Typography>
              <Box>
                <Typography>
                  <strong>Name:</strong>{" "}
                  {capitalizeFirstLetter(selectedDepartment.name)}
                </Typography>
                <Typography>
                  <strong>Description:</strong>{" "}
                  {selectedDepartment.description || "No description provided"}
                </Typography>
                <Typography>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: selectedDepartment.is_active ? 'green' : 'red' }}>
                    {selectedDepartment.is_active ? "Active" : "Inactive"}
                  </span>
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {openDepartmentModal && (
        <DepartmentModal
          open={openDepartmentModal}
          onClose={handleCloseModal}
          onSave={handleSaveDepartment}
          department={editingDepartment}
        />
      )}

      <ConfirmDialog
        open={confirmDialogOpen}
        message={`Are you sure you want to delete the department "${deletingDepartment?.name}"?`}
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
