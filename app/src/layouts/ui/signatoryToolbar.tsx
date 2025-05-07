import * as React from "react";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Button, Tooltip } from "@mui/material";
//@ts-ignore
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export function SignatoryToolbar({
  props,
  onAddSignatory,
  onExportData,
}: any) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      
      <Tooltip title="Add Signatory">
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => onAddSignatory()}
          sx={{ ml: 1 }}
        >
          Add Signatory
        </Button>
      </Tooltip>
     
      {onExportData && (
        <Tooltip title="Export">
          <Button
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={() => onExportData(props.data)}
            sx={{ ml: 1 }}
          >
            Export
          </Button>
        </Tooltip>
      )}
       <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}
