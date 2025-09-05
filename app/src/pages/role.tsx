import * as React from "react";
import { useState } from "react";
import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Typography,
  Paper,
  Box,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
//@ts-ignore
import DeleteIcon from "@mui/icons-material/Delete";
//@ts-ignore
import AddIcon from "@mui/icons-material/Add";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ROLES } from "../graphql/queries/role.query";
import { ADD_ROLE, UPDATE_ROLE, DELETE_ROLE } from "../graphql/mutations/role.mutation";
import ConfirmDialog from "../components/confirmationdialog"; // Add this import if not present
//@ts-ignore
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DrawIcon from "@mui/icons-material/Draw";
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter, GridToolbarExport, GridToolbarColumnsButton, GridToolbarDensitySelector } from "@mui/x-data-grid";


export default function RolePage() {
  const { data, loading, error } = useQuery(GET_ROLES);
  const [addRole] = useMutation(ADD_ROLE, { refetchQueries: [{ query: GET_ROLES }] });
  const [updateRole] = useMutation(UPDATE_ROLE, { refetchQueries: [{ query: GET_ROLES }] });
  const [deleteRole] = useMutation(DELETE_ROLE, { refetchQueries: [{ query: GET_ROLES }] });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

  const openNew = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setOpen(true);
  };

  const openEdit = (role: any) => {
    setEditing(role);
    setName(role.name || "");
    setDescription(role.description || "");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateRole({ variables: { input: { id: editing.id, name: name.trim(), description } } });
      } else {
        await addRole({ variables: { input: { name: name.trim(), description } } });
      }
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingRoleId(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = async (confirmed: boolean) => {
    if (confirmed && deletingRoleId !== null) {
      try {
        await deleteRole({ variables: { id: deletingRoleId } });
      } catch (err) {
        console.error(err);
      }
    }
    setConfirmDialogOpen(false);
    setDeletingRoleId(null);
  };

  // Enhanced Table Toolbar
  function EnhancedRoleToolbar({ onAddRole }: { onAddRole: () => void }) {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          sx={{ mx: 1 }}
          onClick={onAddRole}
        >
          Add Role
        </Button>
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }

  // Table columns
  const roleColumns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => openEdit(params.row)} aria-label="edit">
            <DrawIcon color="warning" sx={{ cursor: "pointer" }} fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="delete">
            <DeleteForeverIcon color="error" sx={{ cursor: "pointer" }} fontSize="small" onClick={() => handleDelete(params.row.id)} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // Prepare rows for DataGrid
  const roleRows = (data?.roles || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
  }));

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Roles</h1>
      </header>

      {loading ? (
        <Stack alignItems="center">
          <CircularProgress />
        </Stack>
      ) : error ? (
        <Typography color="error">Error loading roles: {error.message}</Typography>
      ) : (
        (data?.roles && data.roles.length > 0) ? (
          <Box>
            <Paper>
              <DataGrid
                rows={roleRows}
                columns={roleColumns}
                autoHeight
                pageSizeOptions={[5, 10, 25, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                slots={{
                  toolbar: () => <EnhancedRoleToolbar onAddRole={openNew} />,
                }}
                sx={{ minHeight: 400 }}
              />
            </Paper>
          </Box>
        ) : (
          <Typography color="textSecondary" align="center" sx={{ mt: 4 }}>
            No roles found.
          </Typography>
        )
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Role" : "Add Role"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDialogOpen}
        message="Are you sure you want to delete this role?"
        onClose={handleConfirmDialogClose}
      />
    </div>
  );
}
