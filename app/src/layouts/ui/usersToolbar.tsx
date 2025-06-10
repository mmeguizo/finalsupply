import * as React from "react";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  GridToolbarExport, 
} from "@mui/x-data-grid";
import { Button, Tooltip } from "@mui/material";
//@ts-ignore
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export function UserToolbar({
  props,
  onAddUser,
}: any) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport  />
      
      <Tooltip title="Add User">
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => onAddUser()}
          sx={{ ml: 1 }}
        >
          Add User
        </Button>
      </Tooltip>
       <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}
