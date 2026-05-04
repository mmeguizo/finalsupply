import * as React from 'react';
import { useQuery } from '@apollo/client';
import {
  CircularProgress,
  Alert,
  Paper,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Toolbar,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { PageContainer } from '@toolpad/core/PageContainer';
import { GET_ALL_IAR_NO_CATEGORY } from '../graphql/queries/inspectionacceptancereport.query';
import { NoCategoryRow } from './issuanceNoCategoryFunctions/tableRow';
import { formatDateString } from '../utils/generalUtils';
import NcAssignmentModal from '../components/NcAssignmentModal';
import PrintReportDialogForNC from '../components/printReportModalForNC';
import SignatorySelectionContainer from './issuanceNoCategoryFunctions/SignatorySelectionContainer';
import useSignatoryStore from '../stores/signatoryStore';

/**
 * IssuanceNoCategoryPage
 * ----------------------
 * Shows IAR items that have `category = null` (no PAR/ICS/RIS assignment).
 * Users can assign an NC ticket ID to these items.
 *
 * Flow:
 * 1. Query fetches all IAR items with null category via GET_ALL_IAR_NO_CATEGORY.
 * 2. Items are grouped by PO number (same pattern as ICS page).
 * 3. Each PO row expands to show individual items.
 * 4. Clicking an item's NC chip opens the NcAssignmentModal.
 * 5. On assignment, the backend generates an NC ID (format: NC-YYYY-NNNN)
 *    and creates a clone record (recordType: 'issuance_clone').
 */
export default function IssuanceNoCategoryPage() {
  /* ------------------------------------------------------------------ */
  /*  GraphQL query                                                      */
  /* ------------------------------------------------------------------ */
  const { data, loading, error, refetch } = useQuery(GET_ALL_IAR_NO_CATEGORY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  /* ------------------------------------------------------------------ */
  /*  Local state                                                        */
  /* ------------------------------------------------------------------ */
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // NC Assignment Modal state
  const [openAssignmentModal, setOpenAssignmentModal] = React.useState(false);
  const [itemToAssign, setItemToAssign] = React.useState<any>(null);

  // Print Modal state
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [printItem, setPrintItem] = React.useState<any>(null);

  // Signatories — reuse the same store pattern as ICS/RIS/PAR pages
  const getSelections = useSignatoryStore((s) => s.getSelections);
  const setSelections = useSignatoryStore((s) => s.setSelections);
  const signatories = getSelections('nc') || {
    inspection_officer: '',
    recieved_from: '',
    recieved_by: '',
  };

  /* ------------------------------------------------------------------ */
  /*  Derived data: group items by PO number                             */
  /* ------------------------------------------------------------------ */
  const ncList = data?.inspectionAcceptanceReportNoCategory ?? [];

  const groupedRows = React.useMemo(() => {
    if (!ncList.length) return [];
    const groups = ncList.reduce((acc: Record<string, any[]>, item: any) => {
      const poNumber = item.PurchaseOrder?.poNumber || 'Unknown';
      if (!acc[poNumber]) acc[poNumber] = [];
      acc[poNumber].push(item);
      return acc;
    }, {});
    return Object.entries(groups).map(([poNumber, items]: any) => ({
      id: items[0].PurchaseOrder?.id || items[0].id,
      poNumber,
      supplier: items[0].PurchaseOrder?.supplier || 'Unknown',
      dateOfDelivery: items[0].PurchaseOrder?.dateOfDelivery || '',
      itemCount: items.length,
      items,
    }));
  }, [ncList]);

  /* ------------------------------------------------------------------ */
  /*  Filter & paginate                                                  */
  /* ------------------------------------------------------------------ */
  const filteredRows = React.useMemo(() => {
    if (!searchQuery.trim()) return groupedRows;
    const q = searchQuery.toLowerCase();
    return groupedRows.filter(
      (row: any) =>
        row.poNumber.toLowerCase().includes(q) ||
        row.supplier.toLowerCase().includes(q) ||
        (row.dateOfDelivery && formatDateString(row.dateOfDelivery).toLowerCase().includes(q))
    );
  }, [groupedRows, searchQuery]);

  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                           */
  /* ------------------------------------------------------------------ */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAssignmentModal = (item: any) => {
    setItemToAssign(item);
    setOpenAssignmentModal(true);
  };

  // Print Modal handlers
  const handleOpenPrintModal = (item: any) => {
    setPrintItem(Array.isArray(item) ? item : [item]);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintItem(null);
  };

  const handleCloseAssignmentModal = () => {
    setOpenAssignmentModal(false);
    setItemToAssign(null);
  };

  const handleAssignmentComplete = () => {
    setOpenAssignmentModal(false);
    setItemToAssign(null);
    refetch();
  };

  const handleSignatoriesChange = (updatedSignatories: any) => {
    setSelections('nc', updatedSignatories);
  };

  // Refetch on window focus / online / visibility change (same pattern as ICS page)
  React.useEffect(() => {
    const onFocus = () => refetch();
    const onOnline = () => refetch();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refetch]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  if (loading && !data) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading data: {error.message}</Alert>;

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
      <Stack
        spacing={3}
        sx={{
          width: '100%',
          overflow: 'auto',
          maxHeight: 'calc(100vh - 100px)',
        }}
      >
        <Paper sx={{ width: '100%' }}>
          {/* Search toolbar */}
          <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
              No Category Issuance
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search PO#, Supplier..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Toolbar>

          {/* Table */}
          <TableContainer>
            <Table aria-label="no-category collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell>Expand</TableCell>
                  <TableCell>PO#</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Items</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No items without category found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row: any) => (
                    <NoCategoryRow
                      key={row.id}
                      row={row}
                      handleOpenAssignmentModal={handleOpenAssignmentModal}
                      handleOpenPrintModal={handleOpenPrintModal}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        {/* Signatory Selection */}
        <SignatorySelectionContainer
          signatories={signatories}
          onSignatoriesChange={handleSignatoriesChange}
        />
      </Stack>

      {/* NC Assignment Modal */}
      <NcAssignmentModal
        open={openAssignmentModal}
        onClose={handleCloseAssignmentModal}
        item={itemToAssign}
        onAssignmentComplete={handleAssignmentComplete}
      />

      {/* Print Report Dialog */}
      <PrintReportDialogForNC
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printItem}
        title="No Category Issuance Report"
        signatories={signatories}
      />
    </PageContainer>
  );
}
