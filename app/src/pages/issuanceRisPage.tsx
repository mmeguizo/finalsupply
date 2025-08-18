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
              <Table size="small" aria-label="ris-details">
                <TableHead>
                  <TableRow>
                    <TableCell>RIS ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Actual Received</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Tag</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items.map((item: any) => (
                    <TableRow key={item.id}>
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
  const { data, loading, error, refetch } = useQuery(
    GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY
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
  
  // Updated signatory state to use proper type
  const [signatories, setSignatories] = React.useState<risIssuanceSignatories>({
    requested_by: "",
    approved_by: "",
    issued_by: "",
    recieved_by: ""
  });
 
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
    setSignatories(selectedSignatories);
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
