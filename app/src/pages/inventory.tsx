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
//@ts-ignore
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT } from "../graphql/queries/inspectionacceptancereport.query";
import PrintReportDialogForIAR from "../components/printReportModalForIAR";
import { formatTimestampToDateTime, currencyFormat } from "../utils/generalUtils";

// Row component for collapsible table
function Row(props: { row: any, handleOpenPrintModal: (item: any) => void }) {
  const { row, handleOpenPrintModal } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
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
        <TableCell>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPrintModal(row.items[0]); // Use the first item for printing
            }}
          >
            <PreviewIcon fontSize="medium" />
          </Button>
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
                      <TableCell align="right">{item.actualQuantityReceived}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{currencyFormat(item.unitCost)}</TableCell>
                      <TableCell align="right">{currencyFormat(item.amount)}</TableCell>
                      {/* <TableCell>{item.PurchaseOrder?.poNumber}</TableCell> */}
                      <TableCell>
                        {item.category?.split(" ")
                          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
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
function EnhancedTableToolbar(props: { searchQuery: string; onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  const { searchQuery, onSearchChange } = props;

  return (
    <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
      <Typography
        sx={{ flex: '1 1 100%' }}
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

export default function InventoryPage() {
  const { data, loading, error, refetch } = useQuery(GET_ALL_INSPECTION_ACCEPTANCE_REPORT);
  const [printPOI, setPrintPOI] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleOpenPrintModal = (po: any) => {
    const reportTitle = po.category.split(" ")
    const reportTitleString = reportTitle.map((word : string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    setReportType("inspection");
    setTitle(`${reportTitleString} Report`);
    setPrintPOI(po);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintPOI(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };
  
  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Group rows by iarId
  const groupedRows = React.useMemo(() => {
    if (!data?.inspectionAcceptanceReport?.length) return [];

    // Group by iarId
    const groups = data.inspectionAcceptanceReport.reduce((acc: any, item: any) => {
      const iarId = item.iarId;
      if (!acc[iarId]) {
        acc[iarId] = [];
      }
      acc[iarId].push(item);
      return acc;
    }, {});

    // Create one row per iarId with all items
    return Object.entries(groups).map(([iarId, items]: any) => ({
      id: iarId,
      po: items[0].PurchaseOrder?.poNumber,
      iarId: iarId,
      createdAt: items[0].createdAt,
      items: items, // Store all items for this iarId
    }));
  }, [data]);

  // Filter rows based on search query
  const filteredRows = React.useMemo(() => {
    if (!searchQuery.trim()) return groupedRows;

    const lowerCaseQuery = searchQuery.toLowerCase();
    
    return groupedRows.filter(row => {
      console.log(row)
      // Check if IAR ID matches
      if (row.iarId.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      
      // Check if any item in this group matches the search criteria
      return row.items.some((item: any) => {
        return (
          // Search in various fields
          (item.description && item.description.toLowerCase().includes(lowerCaseQuery)) ||
          (item.unit && item.unit.toLowerCase().includes(lowerCaseQuery)) ||
          (item.category && item.category.toLowerCase().includes(lowerCaseQuery)) ||
          (item.PurchaseOrder?.poNumber && item.PurchaseOrder.poNumber.toLowerCase().includes(lowerCaseQuery))
        );
      });
    });
  }, [groupedRows, searchQuery]);
  
  // Apply pagination to the filtered rows
  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading data: {error.message}</Alert>;

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
      <Stack spacing={3} sx={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 100px)'}}>
        <Paper sx={{ width: "100%" }}>
          <EnhancedTableToolbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
          <TableContainer>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>PO#</TableCell>
                  <TableCell>IAR#</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Print</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row) => {
                  console.log(row)
                 return <Row key={row.id} row={row} handleOpenPrintModal={handleOpenPrintModal} />
                })}
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
      <PrintReportDialogForIAR
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printPOI}
        reportType={reportType}
      />
    </PageContainer>
  );
}
