import { Stack, Tooltip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import DrawIcon from "@mui/icons-material/Draw";
//@ts-ignore
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

// Define columns for departments
export const createDepartmentColumns = (
  handleOpenEditModal: (item: any) => void,
  handleDeleteModal: (item: any) => void
): GridColDef[] => [
  {
    field: "id",
    headerName: "ID",
    width: 70,
  },
  {
    field: "name",
    headerName: "Department Name",
    width: 200,
  },
  {
    field: "description",
    headerName: "Description",
    width: 300,
    flex: 1,
  },
  {
    field: "is_active",
    headerName: "Status",
    width: 120,
    renderCell: (params) => (
      <span style={{ color: params.value ? 'green' : 'red' }}>
        {params.value ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Stack direction="row" sx={{ marginTop: "3%" }} spacing={1}>
        <Tooltip title="Edit">
          <DrawIcon
            color="warning"
            sx={{ cursor: "pointer" }}
            onClick={() => handleOpenEditModal(params.row)}
          />
        </Tooltip>
        <Tooltip title="Delete">
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