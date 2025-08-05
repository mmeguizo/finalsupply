import React from "react";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { Button, Box } from "@mui/material";
//@ts-ignore
import AddIcon from "@mui/icons-material/Add";

interface DepartmentToolbarProps {
  props: any;
  onAddDepartment: (item: any) => void;
}

export const DepartmentToolbar = ({
  props,
  onAddDepartment,
}: DepartmentToolbarProps) => {
  return (
    <GridToolbarContainer>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Box>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />
        </Box>
        <Box>
          <Button
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => onAddDepartment(null)}
            variant="contained"
            size="small"
          >
            Add Department
          </Button>
        </Box>
      </Box>
    </GridToolbarContainer>
  );
};