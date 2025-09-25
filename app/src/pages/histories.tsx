import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Box, Paper, TextField, InputAdornment, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, IconButton, Tooltip } from "@mui/material";
//@ts-ignore
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DataGrid, GridRowParams } from "@mui/x-data-grid";
import { useQuery } from "@apollo/client";
import { GET_ALL_HISTORY } from "../graphql/queries/history.query";

export default function HistoriesPage() {
  const formatDate = React.useCallback((value: any) => {
    if (!value) return '—';
    let d: Date | null = null;
    // Support Firestore-like and object shapes
    if (typeof value === 'object') {
      // { seconds, nanoseconds }
      if (typeof value.seconds === 'number') {
        const ms = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6);
        d = new Date(ms);
      } else if (value.$date) {
        d = new Date(value.$date);
      }
    }
    if (!d) {
      // Handle numeric timestamps in seconds or milliseconds and ISO strings
      const n = Number(value);
      if (!Number.isNaN(n) && Number.isFinite(n)) {
        d = new Date(n < 1e12 ? n * 1000 : n);
      } else {
        d = new Date(value);
      }
    }
    if (!d || Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  }, []);
  const { data, loading, error, refetch } = useQuery(GET_ALL_HISTORY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const [search, setSearch] = React.useState("");
  const rows = React.useMemo(() => {
    const list = data?.purchaseOrderItemsHistoryAll || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((r: any) =>
      [
        r.changeType,
        r.changedBy,
        r.changeReason,
        String(r.purchaseOrderItemId),
      ]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(q))
    );
  }, [data, search]);

  // Create a display-ready rows array with a formatted date field so the grid always shows readable dates
  const displayRows = React.useMemo(() => {
    return (rows || []).map((r: any) => ({
      ...r,
      createdAtFormatted: formatDate(r.createdAt || r.updatedAt),
    }));
  }, [rows, formatDate]);

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "purchaseOrderItemId", headerName: "Item ID", width: 120 },
    { field: "purchaseOrderId", headerName: "PO ID", width: 120 },
    // { field: "itemName", headerName: "Item Name", width: 180 },
    { field: "description", headerName: "Description", width: 240 },
    { field: "iarId", headerName: "IAR ID", width: 140 },
    { field: "parId", headerName: "PAR ID", width: 140 },
    { field: "risId", headerName: "RIS ID", width: 140 },
    { field: "icsId", headerName: "ICS ID", width: 140 },
    { field: "changeType", headerName: "Type", width: 150 },
    { field: "changedBy", headerName: "By", width: 160 },
    { field: "changeReason", headerName: "Reason", width: 260 },
    { field: "previousActualQuantityReceived", headerName: "Prev Recv", width: 120 },
    { field: "newActualQuantityReceived", headerName: "New Recv", width: 120 },
    { field: "createdAtFormatted", headerName: "Created", width: 200 },
  ];

  const [selected, setSelected] = React.useState<any | null>(null);
  const [open, setOpen] = React.useState(false);

  const copy = (value?: string | number) => {
    if (value === undefined || value === null) return;
    navigator.clipboard?.writeText(String(value));
  };

  const handleRowClick = (params: GridRowParams) => {
    const row = rows.find((r: any) => r.id === params.id);
    setSelected(row || null);
    setOpen(true);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading history: {error.message}</Alert>;

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: "hidden" }}>
      <Paper sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search type, by, reason or item id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">🔎</InputAdornment> }}
          sx={{ mb: 1 }}
        />
        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={displayRows}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            pageSizeOptions={[5, 10, 25, 100]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            sx={{ minHeight: 500 }}
          />
        </Box>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>History details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={1.5}>
              {[{
                label: 'ID', value: selected.id
              },{
                label: 'Item ID', value: selected.purchaseOrderItemId
              },{
                label: 'PO ID', value: selected.purchaseOrderId
              },{
                label: 'Item Name', value: selected.itemName || '—'
              },{
                label: 'Description', value: selected.description || '—'
              },{
                label: 'IAR ID', value: selected.iarId || '—'
              },{
                label: 'PAR ID', value: selected.parId || '—'
              },{
                label: 'RIS ID', value: selected.risId || '—'
              },{
                label: 'ICS ID', value: selected.icsId || '—'
              },{
                label: 'Type', value: selected.changeType
              },{
                label: 'By', value: selected.changedBy || '—'
              },{
                label: 'Reason', value: selected.changeReason || '—'
              },{
                label: 'Prev Recv', value: selected.previousActualQuantityReceived
              },{
                label: 'New Recv', value: selected.newActualQuantityReceived
              },{
                label: 'Created', value: selected.createdAtFormatted || formatDate(selected.createdAt)
              }].map((row) => (
                <Stack key={row.label} direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ minWidth: 110, color: 'text.secondary' }}>{row.label}</Typography>
                  <Typography variant="body1" sx={{ flex: 1 }}>{row.value}</Typography>
                  <Tooltip title="Copy">
                    <span>
                      <IconButton size="small" onClick={() => copy(row.value)}>
                        <ContentCopyIcon fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
