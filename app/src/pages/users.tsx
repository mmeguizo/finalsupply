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
import { GET_ALL_USERS } from "../graphql/queries/user.query";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import NotificationDialog from "../components/notifications";
import { createItemColumns } from "./usersFunctions/users_gridColDef";
import { UserToolbar } from "../layouts/ui/usersToolbar";
import ConfirmDialog from "../components/confirmationdialog";
import { UserTypes } from "../types/user/userType";
import { capitalizeFirstLetter } from "../utils/generalUtils";
import UserModal from "../components/userModal";
import {
  EDIT_USER,
  CREATE_USER,
  DELETE_USER,
} from "../graphql/mutations/user.mutation";
import { Edit } from "@mui/icons-material";
export const UsersPage = () => {
  const client = useApolloClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data, loading, error } = useQuery(GET_ALL_USERS);
  const [openUserModal, setOpenUserModal] = React.useState(false);
  const [showNotification, setShowNotification] = React.useState(false);
  const [notificationMessage, setNotificationMessage] = React.useState("");
  const [notificationSeverity, setNotificationSeverity] = React.useState<
    "success" | "error" | "info" | "warning"
  >("success");
  console.log("Users data:", data, loading, error);

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  const [selectedUser, setselectedUser] = React.useState<UserTypes | null>(
    null
  );
  const [editingUser, setEditingUser] = React.useState<UserTypes | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<UserTypes | null>(
    null
  );

  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_ALL_USERS }],
    onCompleted: () => {
      client.cache.evict({ id: "ROOT_QUERY", fieldName: "users" });
      client.cache.gc();
    },
  });
  const [editUser] = useMutation(EDIT_USER, {
    refetchQueries: [{ query: GET_ALL_USERS }],
    onCompleted: () => {
      client.cache.evict({ id: "ROOT_QUERY", fieldName: "users" });
      client.cache.gc();
    },
  });
  // const [createUser] = useMutation(CREATE_USER, {
  //   refetchQueries: [{ query: GET_ALL_USERS }],
  //   onCompleted: () => {
  //     client.cache.evict({ id: "ROOT_QUERY", fieldName: "users" });
  //     client.cache.gc();
  //   },
  // });
  const [createUser] = useMutation(CREATE_USER, {
  refetchQueries: [{ query: GET_ALL_USERS }],
  awaitRefetchQueries: true,
});

  const handleOpenAddModal = (item: any) => {
    // Implement your logic to open the print modal
    console.log("Open print modal for item:", item);
    setEditingUser(null);
    setOpenUserModal(true);
  };

  const handleOpenEditModal = (user: any) => {
    console.log("Open edit modal for user:", user);
    setEditingUser(user);
    setOpenUserModal(true);
  };
  const handleDeleteModal = async (user: any) => {
    setDeletingUser(user);
    setConfirmDialogOpen(true);
  };

  const userColumns = React.useMemo(
    () => createItemColumns(handleOpenEditModal, handleDeleteModal),
    [handleOpenEditModal, handleDeleteModal]
  );

  const usersRows = React.useMemo(() => {
    if (!data?.users) return [];
    return data.users;
  }, [data]);

  const handleRowClick = (params: GridRowParams) => {
    const clickedUser = data?.users.find((user: any) => user.id === params.id);
    setselectedUser(clickedUser || null);
  };

  const handleConfirmDialogClose = async (confirmed: boolean) => {
    console.log("Confirm dialog closed with:", confirmed, deletingUser?.id);

    if (confirmed && deletingUser) {
      const results = await deleteUser({
        variables: {
          id: deletingUser.id,
        },
      });
      setNotificationMessage(
        `User "${results.data.deleteUser.name}" deleted successfully.`
      );
      setNotificationSeverity("success");
      setShowNotification(true);
      console.log("User deleted successfully:", results.data.deleteUser);
      setDeletingUser(null);
      setConfirmDialogOpen(false);
    } else {
      setConfirmDialogOpen(false);
    }
  };

  const handleSaveSignatory = async (user: UserTypes) => {
    console.log("Saving user:", user);
    setIsSubmitting(true);
    try {
      let updateUserData: any;
      if (editingUser) {
        const results = await editUser({
          variables: {
            input: {
              id: parseInt(editingUser.id),
              name: user.name,
              last_name: user.last_name,
              employee_id: user.employee_id,
              department: user.department,
              position: user.position,
              role: user.role,
              email: user.email,
              gender: user.gender,
              password: user.password,
              confirm_password: user.confirm_password,
              location: user.location,
            },
          },
        });
        setNotificationMessage(results.data.message);
        setNotificationSeverity("success");
        setShowNotification(true);
        updateUserData = results.data.editUser;
        console.log("User updated successfully:", updateUserData);
      } else {
        //adding new user
        console.log("Adding new user:", user);
        const results = await createUser({
          variables: {
            input: {
              name: user.name,
              last_name: user.last_name,
              employee_id: user.employee_id,
              department: user.department,
              position: user.position,
              role: user.role,
              email: user.email,
              gender: user.gender,
              password: user.password,
              confirm_password: user.confirm_password,
               location: user.location,
            },
          },
        });
        updateUserData = results.data.createUser;
        console.log("User created successfully:", updateUserData);
      }
      setselectedUser(updateUserData);
      setEditingUser(null);
      handleCloseModal();
    } catch (error : any) {
      console.error("Error saving user:", error);
      setNotificationMessage("Error saving user " + error?.message);
      setNotificationSeverity("error");
      setShowNotification(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setOpenUserModal(false);
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
          Error loading Users: {error.message}
        </Alert>
      )}

      {data && (
        <Box>
          <Paper>
            <DataGrid
              rows={usersRows}
              columns={userColumns}
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
                  UserToolbar({
                    props: { ...props, data: data },
                    onAddUser: handleOpenAddModal,
                  }),
              }}
              //   slotProps={{
              //     toolbar: {
              //       showQuickFilter: true,
              //     },
              //   }}
              onRowClick={handleRowClick}
              sx={{ minHeight: 400 }}
            />
          </Paper>

          {selectedUser && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                User Details
              </Typography>
              <Box>
                <Typography>
                  <strong>Name:</strong>{" "}
                  {capitalizeFirstLetter(selectedUser.name)}
                </Typography>
                <Typography>
                  <strong>Role:</strong> {selectedUser.email}
                </Typography>
                <Typography>
                  <strong>Employee ID:</strong> {selectedUser.employee_id}
                </Typography>
                <Typography>
                  <strong>Department:</strong>{" "}
                  {capitalizeFirstLetter(selectedUser.department)}
                </Typography>
                <Typography>
                  <strong>Position:</strong> {selectedUser.position}
                </Typography>
                <Typography>
                  <strong>Role:</strong>{" "}
                  {capitalizeFirstLetter(selectedUser.role)}
                </Typography>
                <Typography>
                  <strong>Location:</strong>{" "}
                  {capitalizeFirstLetter(selectedUser.location)}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {openUserModal && (
        <UserModal
          open={openUserModal}
          onClose={handleCloseModal}
          onSave={handleSaveSignatory}
          user={editingUser}
        />
      )}

      <ConfirmDialog
        open={confirmDialogOpen}
        message={`Are you sure you want to delete the signatory "${deletingUser?.name}"?`}
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
};
