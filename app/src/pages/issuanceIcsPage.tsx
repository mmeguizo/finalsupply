  import * as React from "react";
  import { useQuery } from "@apollo/client";
  import {
    CircularProgress,
    Alert,
    Box,
    Paper,
    Typography,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination
  } from "@mui/material";
  import { PageContainer } from "@toolpad/core/PageContainer";
  import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS } from "../graphql/queries/inspectionacceptancereport.query";
  // Note: signatories are supplied explicitly via the SignatorySelectionContainer
  import { Row } from "./issuanceIcsFunctions/tableRow";
  import EnhancedTableToolbar from "./issuanceIcsFunctions/enhancedToolbar";
  import SignatoriesComponent from "./issuanceIcsFunctions/SignatorySelectionContainer";
  import { formatDateString } from "../utils/generalUtils";
  import PrintReportDialogForICS from "../components/printReportModalForICS";

  // Type definition for the signatory data
  interface icsIssuanceSignatories {
    recieved_from: string;
    recieved_by: string;
    metadata?: {
      recieved_from: { position: string; role: string };
      recieved_by: { position: string; role: string };
    };
  }

  export default function IssuanceIcsPage() {
    const { data, loading, error, refetch, networkStatus } = useQuery(
      GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS,
      {
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        // pollInterval can cause repeated updates; disable if it leads to loops
        // pollInterval: 4000,
        notifyOnNetworkStatusChange: true,
      }
    );
    
    const [searchQuery, setSearchQuery] = React.useState("");
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [printItem, setPrintItem] = React.useState<any>(null);
    const [openPrintModal, setOpenPrintModal] = React.useState(false);
    const [reportType, setReportType] = React.useState("");
    const [title, setTitle] = React.useState("");

    // Initialize signatories state. Keep blank until user selects via SignatorySelectionContainer.
    const [signatories, setSignatories] = React.useState<icsIssuanceSignatories>({
      recieved_from: "",
      recieved_by: "",
      metadata: {
        recieved_from: { position: "", role: "" },
        recieved_by: { position: "", role: "" }
      }
    });

    // Safer derived list
    const icsList = data?.inspectionAcceptanceReportForICS ?? [];

    // Removed verbose logging

    // Group ICS items by PO number
    const groupedRows = React.useMemo(() => {
      if (!icsList.length) return [];
      const groups = icsList.reduce((acc: Record<string, any[]>, item: any) => {
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
        items
      }));
    }, [icsList]);

    // Filter rows based on search query
    const filteredRows = React.useMemo(() => {
      if (!searchQuery.trim()) return groupedRows;
      
      const lowerCaseQuery = searchQuery.toLowerCase();
      
      return groupedRows.filter((row: any) => 
        row.poNumber.toLowerCase().includes(lowerCaseQuery) ||
        row.supplier.toLowerCase().includes(lowerCaseQuery) ||
        (row.dateOfDelivery && formatDateString(row.dateOfDelivery).toLowerCase().includes(lowerCaseQuery))
      );
    }, [groupedRows, searchQuery]);

    // Paginated rows
    const paginatedRows = React.useMemo(() => {
      return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredRows, page, rowsPerPage]);

    // Handle opening print modal
    const handleOpenPrintModal = (items: any) => {
      const reportTitle = items[0].category.split(" ");
      const reportTitleString = reportTitle
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setReportType(reportTitle);
      setTitle(`${reportTitleString} Report`);
      setPrintItem(items);
      setOpenPrintModal(true);
    };

    // Handle closing print modal
    const handleClosePrintModal = () => {
      setOpenPrintModal(false);
      setPrintItem(null);
    };

    // Refetch on window focus/online/visibility change
    React.useEffect(() => {
      const onFocus = () => refetch();
      const onOnline = () => refetch();
      const onVisibility = () => {
        if (document.visibilityState === "visible") refetch();
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

    // Handle search change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
      setPage(0); // Reset to first page when searching
    };

    // Handle page change
    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    // Handle signatory changes
    const onSignatoriesChange = (selectedSignatories: icsIssuanceSignatories) => {
      setSignatories(selectedSignatories);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">Error loading data: {error.message}</Alert>;

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
                  {paginatedRows.map((row: any) => (
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
        
        {/* Print Report Dialog */}
        <PrintReportDialogForICS
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