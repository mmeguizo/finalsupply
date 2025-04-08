import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
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
import { DataGrid } from "@mui/x-data-grid";
import { useDemoData } from "@mui/x-data-grid-generator";
import { useQuery } from "@apollo/client";
import  {GET_ALL_PURCHASEORDER_ITEMS}  from "../graphql/queries/purchaseorder.query.js";
export default function InventoryPage() {
  const { data, loading, error } = useQuery(GET_ALL_PURCHASEORDER_ITEMS);

  console.log("INVENTORY", {
    data,
    loading,
    error,
  });

  const [nbRows, setNbRows] = React.useState(3);
  const removeRow = () => setNbRows((x) => Math.max(0, x - 1));
  const addRow = () => setNbRows((x) => Math.min(100, x + 1));

  const { data: data2, loading: loading2 } = useDemoData({
    dataSet: "Commodity",
    rowLength: 100,
    maxColumns: 6,
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Button size="small" onClick={removeRow}>
          Remove a row
        </Button>
        <Button size="small" onClick={addRow}>
          Add a row
        </Button>
      </Stack>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DataGrid
          {...data2}
          rows={data2.rows.slice(0, nbRows)}
          loading={loading2}
        />
      </div>
    </Box>
  );
}
