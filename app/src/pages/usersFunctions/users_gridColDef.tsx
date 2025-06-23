import { Stack, Tooltip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import DrawIcon from "@mui/icons-material/Draw";
//@ts-ignore
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
// Define columns for inventory items
export const createItemColumns = (
  handleOpenEditModal: (item: any) => void,
  handleDeleteModal: (item: any) => void
): GridColDef[] => [
  {
    field: "id",
    headerName: " ID",
    width: 100,
  },
  {
    field: "email",
    headerName: "Email",
    width: 150,
  },
  {
    field: "name",
    headerName: "Full Name",
    width: 150,
  },
  {
    field: "employee_id",
    headerName: "Employee ID",
    width: 150,
  },
  {
    field: "department",
    headerName: "Department",
    width: 150,
  },
  {
    field: "position",
    headerName: "Position",
    width: 150,
  },
  {
    field: "role",
    headerName: "Role",
    width: 150,
  },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" sx={{ marginTop: "3%" }} spacing={1}>
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
