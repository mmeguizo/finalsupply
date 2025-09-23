import * as React from "react";
import { useQuery } from "@apollo/client";
import {
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
  Toolbar,
  TablePagination,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PreviewIcon from "@mui/icons-material/Preview";
import SearchIcon from "@mui/icons-material/Search";
import NotificationDialog from "../components/notifications";
import ConfirmDialog from "../components/confirmationdialog";
//@ts-ignore
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT } from "../graphql/queries/inspectionacceptancereport.query";
import PrintReportDialogForIAR from "../components/printReportModalForIAR";
import {
  formatTimestampToDateTime,
  currencyFormat,
} from "../utils/generalUtils";
import { Select, MenuItem, Chip } from "@mui/material";
import { useMutation } from "@apollo/client";
import { UPDATE_IAR_STATUS, REVERT_IAR_BATCH } from "../graphql/mutations/inventoryIAR.mutation";
// @ts-ignore
import { GET_PURCHASEORDERS, GET_ALL_DASHBOARD_DATA } from "../graphql/queries/purchaseorder.query";

// Row component for collapsible table
function Row(props: {
  row: any;
  handleOpenPrintModal: (item: any) => void;
  onStatusUpdate: (iarId: string, status: string) => void;
  onRevert: (iarId: string) => void; // add
}) {
  const { row, handleOpenPrintModal, onStatusUpdate, onRevert } = props;
  const [open, setOpen] = React.useState(false);
  const canRevert = React.useMemo(() => {
    if (!row?.items?.length) return false;
    return row.items.some((it: any) => Number(it.actualQuantityReceived || 0) > 0);
  }, [row]);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.po}
        </TableCell>
        <TableCell component="th" scope="row">
          {row.iarId}
        </TableCell>
        <TableCell>{formatTimestampToDateTime(row.createdAt)}</TableCell>
        <TableCell component="th" scope="row">
          <Select
            value={row.iarStatus || "none"}
            onChange={(e) => onStatusUpdate(row.iarId, e.target.value)}
            size="small"
            variant="outlined"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="complete">Complete</MenuItem>
          </Select>
        </TableCell>
        <TableCell>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPrintModal(row.items);
            }}
            sx={{ mr: 1 }}
          >
            <PreviewIcon fontSize="medium" />
          </Button>
          {canRevert && (
            <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              onRevert(row.iarId);
            }}
            >
              Revert
            </Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              <Table size="small" aria-label="details">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Actual Received</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    {/* <TableCell>P.O. #</TableCell> */}
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell component="th" scope="row">
                        {item.description}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell align="right">
                        {item.actualQuantityReceived}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {currencyFormat(item.unitCost)}
                      </TableCell>
                      <TableCell align="right">
                        {currencyFormat(item.amount)}
                      </TableCell>
                      {/* <TableCell>{item.PurchaseOrder?.poNumber}</TableCell> */}
                      <TableCell>
                        {item.category
                          ?.split(" ")
                          .map(
                            (word: string) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Custom toolbar with search functionality
function EnhancedTableToolbar(props: {
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { searchQuery, onSearchChange } = props;

  return (
    <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
      <Typography
        sx={{ flex: "1 1 100%" }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        Inventory
      </Typography>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search IAR#, description..."
        value={searchQuery}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Toolbar>
  );
}
// InventoryPage component
export default function InventoryPage() {
  const { data, loading, error, refetch } = useQuery(
    GET_ALL_INSPECTION_ACCEPTANCE_REPORT,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    }
  );
  const [printPOI, setPrintPOI] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [updateIARStatus] = useMutation(UPDATE_IAR_STATUS, {
    refetchQueries: [{ query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT }],
  });
  const [revertIARBatch] = useMutation(REVERT_IAR_BATCH, {
    awaitRefetchQueries: true,
    refetchQueries: [
      { query: GET_ALL_INSPECTION_ACCEPTANCE_REPORT },
      // Also refresh purchase orders and dashboard aggregates so all views update
      { query: GET_PURCHASEORDERS },
      { query: GET_ALL_DASHBOARD_DATA },
    ],
  });

  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Notifications state
  const [showNotification, setShowNotification] = React.useState(false);
  const [notificationMessage, setNotificationMessage] = React.useState("");
  const [notificationSeverity, setNotificationSeverity] = React.useState<
    "success" | "error" | "info" | "warning"
  >("success");

  // Confirm dialog state for revert
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingIarToRevert, setPendingIarToRevert] = React.useState<string | null>(null);

  const handleOpenPrintModal = (po: any) => {
    setReportType("inspection");
    setPrintPOI(po);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintPOI(null);
  };

  // Add this function after handleClosePrintModal (around line 177)
  const handleStatusUpdate = async (iarId: string, newStatus: string) => {
    try {
      // TODO: Replace with your actual mutation
      // await updateIARStatus({ variables: { iarId, status: newStatus } });
      console.log(`Updating IAR ${iarId} to status: ${newStatus}`);
      const results = await updateIARStatus({
        variables: {
          airId: iarId, // <-- send the variable name your mutation expects
          iarStatus: newStatus,
        },
      });
      if (results.data?.updateIARStatus) {
        console.log({updateIARStatus :results.data.updateIARStatus});
        setNotificationMessage(results.data.updateIARStatus.message);
        setNotificationSeverity("success"); // Always success if we get here
        setShowNotification(true);
        console.log("Status updated successfully");
        refetch(); // Don't forget to refetch to update the UI
      } else {
        console.error("Failed to update status");
        setNotificationSeverity("error");
      }

      // Refetch data to update UI
      // refetch();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRevertIAR = (iarId: string) => {
    setPendingIarToRevert(iarId);
    setConfirmOpen(true);
  };

  const handleConfirmClose = async (confirmed: boolean) => {
    const iarId = pendingIarToRevert;
    setConfirmOpen(false);
    if (!confirmed || !iarId) {
      setPendingIarToRevert(null);
      return;
    }
    try {
      const res = await revertIARBatch({ variables: { iarId, reason: "User requested revert" } });
      if (res.data?.revertIARBatch?.success) {
        setNotificationMessage(res.data.revertIARBatch.message);
        setNotificationSeverity("success");
        setShowNotification(true);
        await refetch();
      } else {
        setNotificationMessage("Failed to revert IAR batch.");
        setNotificationSeverity("error");
        setShowNotification(true);
      }
    } catch (e: any) {
      console.error(e);
      setNotificationMessage(e.message || "Error reverting IAR batch");
      setNotificationSeverity("error");
      setShowNotification(true);
    } finally {
      setPendingIarToRevert(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Group rows by iarId
  const groupedRows = React.useMemo(() => {
    if (!data?.inspectionAcceptanceReport?.length) return [];
    // Group by iarId
    const groups = data.inspectionAcceptanceReport.reduce(
      (acc: any, item: any) => {
        const iarId = item.iarId;
        if (!acc[iarId]) {
          acc[iarId] = [];
        }
        acc[iarId].push(item);
        return acc;
      },
      {}
    );

    // Create one row per iarId with all items
    return Object.entries(groups).map(([id, items]: any) => ({
      id: items[0].id,
      po: items[0].PurchaseOrder?.poNumber,
      iarId: items[0].iarId,
      iarStatus: items[0].iarStatus,
      createdAt: items[0].createdAt,
      items: items, // Store all items for this iarId
    }));
  }, [data]);

  // Filter rows based on search query
  const filteredRows = React.useMemo(() => {
    if (!searchQuery.trim()) return groupedRows;

    const lowerCaseQuery = searchQuery.toLowerCase();

    return groupedRows.filter((row) => {
      // console.log(row);
      // Check if IAR ID matches
      if (row.iarId.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }

      // Check if any item in this group matches the search criteria
      return row.items.some((item: any) => {
        return (
          // Search in various fields
          (item.description &&
            item.description.toLowerCase().includes(lowerCaseQuery)) ||
          (item.unit && item.unit.toLowerCase().includes(lowerCaseQuery)) ||
          (item.category &&
            item.category.toLowerCase().includes(lowerCaseQuery)) ||
          (item.PurchaseOrder?.poNumber &&
            item.PurchaseOrder.poNumber.toLowerCase().includes(lowerCaseQuery))
        );
      });
    });
  }, [groupedRows, searchQuery]);

  // Apply pagination to the filtered rows
  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredRows, page, rowsPerPage]);

  if (loading) return <CircularProgress />;
  if (error)
    return <Alert severity="error">Error loading data: {error.message}</Alert>;

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: "hidden" }}>
      {showNotification && (
        <NotificationDialog
          message={notificationMessage}
          severity={notificationSeverity}
          duration={2000}
          onClose={() => setShowNotification(false)}
        />
      )}
      <Stack
        spacing={3}
        sx={{
          width: "100%",
          overflow: "auto",
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        <Paper sx={{ width: "100%" }}>
          <EnhancedTableToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
          <TableContainer>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>PO#</TableCell>
                  <TableCell>IAR#</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>IAR</TableCell>
                  <TableCell>Print</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => (
                  <Row
                    key={row.iarId}
                    row={row}
                    handleOpenPrintModal={handleOpenPrintModal}
                    onStatusUpdate={handleStatusUpdate}
                    onRevert={handleRevertIAR} // pass handler
                  />
                ))}
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
      </Stack>
      <ConfirmDialog
        open={confirmOpen}
        message={`Are you sure you want to revert IAR batch ${pendingIarToRevert || ""}? This will roll back received quantities and hide IAR entries.`}
        onClose={handleConfirmClose}
      />
      <PrintReportDialogForIAR
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printPOI}
        reportType={reportType}
      />
    </PageContainer>
  );
}
