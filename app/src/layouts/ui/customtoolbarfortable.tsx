import * as React from "react";
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
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Menu, MenuItem } from "@mui/material"; // Add this import at the top
//@ts-ignore
import AddIcon from "@mui/icons-material/Add";
export function CustomToolbarForTable({
  props,
  onExportWithItems,
  onPrintWithItems,
  onPrintSelectedWithItems,
  onAddPO,
}: any) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handlePrintClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => onAddPO()}
        sx={{ ml: 1 }}
      >
        Add PO
      </Button>
      <Tooltip title="Export">
        <Button
          startIcon={<FileDownloadIcon />}
          onClick={() => onExportWithItems(props.data)}
          sx={{ ml: 1 }}
        >
          Export
        </Button>
      </Tooltip>

      <Button
        startIcon={<PrintIcon />}
        onClick={() => onPrintSelectedWithItems(props.data)}
        sx={{ ml: 1 }}
      >
        Print
      </Button>
      {/* <Button
        startIcon={<PrintIcon />}
        onClick={handlePrintClick}
        sx={{ ml: 1 }}
      >
        Print
      </Button> */}

      {/* <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            onPrintSelectedWithItems(props.data);
            handleClose();
          }}
        >
          Print Selected
        </MenuItem>
        <MenuItem
          onClick={() => {
            onPrintWithItems(props.data);
            handleClose();
          }}
        >
          Print All
        </MenuItem>
      </Menu> */}

      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}
/* 
old menu do not delete
<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            onPrintSelectedWithItems(props.data);
            handleClose();
          }}
        >
          Print Selected
        </MenuItem>
        <MenuItem
          onClick={() => {
            onPrintWithItems(props.data);
            handleClose();
          }}
        >
          Print All
        </MenuItem>
      </Menu>

*/
