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
import PrintIcon from "@mui/icons-material/Print";
import Checkbox from "@mui/material/Checkbox";
import SearchIcon from "@mui/icons-material/Search";
import PrintReportDialogForRIS from "../components/printReportModalForRIS";
import {
  formatTimestampToDateTime,
  currencyFormat,
  capitalizeFirstLetter,
  formatDateString,
} from "../utils/generalUtils";
import useSignatoryStore from "../stores/signatoryStore";
import { GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY } from "../graphql/queries/requisitionIssueslip";
import SignatoriesComponent from "../pages/issuanceRisPageFunctions/SignatorySelectionContainer";
import { risIssuanceSignatories } from "../types/user/userType";
// Row component for collapsible table
function Row(props: { row: any; handleOpenPrintModal: (items: any) => void }) {
  const { row, handleOpenPrintModal } = props;
  const [open, setOpen] = React.useState(false);
  const [idSearch, setIdSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const filteredItems = React.useMemo(() => {
    const term = idSearch.trim().toLowerCase();
    if (!term) return row.items;
    return row.items.filter((item: any) =>
      (item.risId || "").toLowerCase().includes(term)
    );
  }, [row.items, idSearch]);

  const isItemSelected = (id: string) => selectedIds.has(id);
  const toggleItem = (item: any) => {
    if (!item?.risId) return; // only allow selecting items with a RIS ID
    const id = String(item.id);
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const allFilteredSelected = React.useMemo(() => {
    if (!filteredItems.length) return false;
    const selectable = filteredItems.filter((it: any) => !!it.risId);
    if (!selectable.length) return false;
    return selectable.every((it: any) => selectedIds.has(String(it.id)));
  }, [filteredItems, selectedIds]);

  const someFilteredSelected = React.useMemo(() => {
    return filteredItems.some((it: any) => selectedIds.has(String(it.id)));
  }, [filteredItems, selectedIds]);

  const toggleSelectAllFiltered = (checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      filteredItems.forEach((it: any) => {
        if (it.risId) next.add(String(it.id));
      });
    } else {
      filteredItems.forEach((it: any) => next.delete(String(it.id)));
    }
    setSelectedIds(next);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const printSelected = (e: React.MouseEvent) => {
    e.stopPropagation();
    const items = row.items.filter((it: any) => selectedIds.has(String(it.id)));
    if (items.length) handleOpenPrintModal(items);
  };

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
          {row.poNumber}
        </TableCell>
        <TableCell>{row.supplier}</TableCell>
        <TableCell>{formatDateString(row.dateOfDelivery)}</TableCell>
        <TableCell>{row.itemCount} items</TableCell>
        <TableCell>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPrintModal(row.items);
            }}
            disabled={!row.items.some((item: any) => item.risId)}
          >
            <PreviewIcon fontSize="medium" />
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                RIS Items Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <TextField
                  size="small"
                  label="Search RIS ID"
                  value={idSearch}
                  onChange={(e) => setIdSearch(e.target.value)}
                />
                <Button size="small" onClick={clearSelection}>Clear</Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PrintIcon fontSize="small" />}
                  onClick={printSelected}
                  disabled={selectedIds.size === 0}
                >
                  Print Selected
                </Button>
              </Box>
              <Table size="small" aria-label="ris-details">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allFilteredSelected}
                        indeterminate={!allFilteredSelected && someFilteredSelected}
                        onChange={(e) => toggleSelectAllFiltered(e.target.checked)}
                        inputProps={{ 'aria-label': 'select all filtered' }}
                      />
                    </TableCell>
                    <TableCell>RIS ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Actual Received</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Tag</TableCell>
                    <TableCell>Print</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected(String(item.id))}
                          onChange={() => toggleItem(item)}
                          disabled={!item.risId}
                        />
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {item.risId || "Not Generated"}
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
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
                      <TableCell>
                        {item.category
                          ?.split(" ")
                          .map(
                            (word: string) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </TableCell>
                      <TableCell>
                        {item.tag
                          ?.split(" ")
                          .map(
                            (word: string) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ") || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<PrintIcon fontSize="small" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPrintModal([item]);
                          }}
                          disabled={!item.risId}
                        >
                          Print
                        </Button>
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
        Requisition Issue Slip (RIS)
      </Typography>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search PO#, RIS ID, description..."
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

// IssuanceRisPage component
export default function IssuanceRisPage() {
  const { data, loading, error, refetch, networkStatus } = useQuery(
    GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    }
  );
  const [printItem, setPrintItem] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Signatory store
  const InspectorOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Inspector Officer")
  );
  const supplyOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Property And Supply Officer")
  );
  const receivedFrom = useSignatoryStore((state) =>
    state.getSignatoryByRole("Recieved From")
  );
  
  // Persist selections across navigation using store
  const getSelections = useSignatoryStore((s) => s.getSelections);
  const setSelections = useSignatoryStore((s) => s.setSelections);
  const risDefault: risIssuanceSignatories = React.useMemo(() => ({
    requested_by: "",
    approved_by: "",
    issued_by: "",
    recieved_by: ""
  }), []);
  const signatories: risIssuanceSignatories = getSelections("ris") || risDefault;
 
  const handleOpenPrintModal = (items: any) => {
    const reportTitle = items[0]?.category?.split(" ") || [];
    const reportTitleString = reportTitle
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    setReportType(reportTitle);
    setTitle(`${reportTitleString} Report`);
    setPrintItem(items);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintItem(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Refetch on window focus/online/visibility (guarded to avoid overlaps)
  React.useEffect(() => {
    const inFlight = { current: false } as { current: boolean };
    const safeRefetch = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        await refetch();
      } finally {
        inFlight.current = false;
      }
    };

    const onFocus = () => void safeRefetch();
    const onOnline = () => void safeRefetch();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void safeRefetch();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refetch]);

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

  // Group rows by PO Number
  const groupedRows = React.useMemo(() => {
    if (!data?.requisitionIssueSlipForView?.length) return [];

    // Group by PO Number
    const groups = data.requisitionIssueSlipForView.reduce(
      (acc: any, item: any) => {
        const poNumber = item.PurchaseOrder?.poNumber;
        if (!acc[poNumber]) {
          acc[poNumber] = [];
        }
        acc[poNumber].push(item);
        return acc;
      },
      {}
    );

    // Create one row per PO Number with all items
    return Object.entries(groups).map(([poNumber, items]: any) => ({
      id: items[0].PurchaseOrder?.id || items[0].id,
      poNumber: poNumber,
      supplier: items[0].PurchaseOrder?.supplier,
      dateOfDelivery: items[0].PurchaseOrder?.dateOfDelivery,
      itemCount: items.length,
      items: items, // Store all items for this PO
    }));
  }, [data]);

  // Filter rows based on search query
  const filteredRows = React.useMemo(() => {
    if (!searchQuery.trim()) return groupedRows;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return groupedRows.filter((row) => {
      // Check if PO Number matches
      if (row.poNumber?.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      // Check if supplier matches
      if (row.supplier?.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }

      // Check if any item in this group matches the search criteria
      return row.items.some((item: any) => {
        return (
          // Search in various fields
          (item.risId && item.risId.toLowerCase().includes(lowerCaseQuery)) ||
          (item.description &&
            item.description.toLowerCase().includes(lowerCaseQuery)) ||
          (item.unit && item.unit.toLowerCase().includes(lowerCaseQuery)) ||
          (item.category &&
            item.category.toLowerCase().includes(lowerCaseQuery)) ||
          (item.tag && item.tag.toLowerCase().includes(lowerCaseQuery))
        );
      });
    });
  }, [groupedRows, searchQuery]);


  const onSignatoriesChange = (selectedSignatories: risIssuanceSignatories) => {
    setSelections("ris", selectedSignatories);
  }

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
                  <TableCell>Expand</TableCell>
                  <TableCell>PO#</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Print</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => (
                  <Row
                    key={row.id}
                    row={row}
                    handleOpenPrintModal={handleOpenPrintModal}
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
        
        {/* Signatory Selection Component */}
        <SignatoriesComponent
          signatories={signatories}
          onSignatoriesChange={onSignatoriesChange}
        />
      </Stack>
      
      <PrintReportDialogForRIS
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printItem}
        reportType={reportType}
        title={title}
        signatories={signatories}
      />
    </PageContainer>
  );
}
