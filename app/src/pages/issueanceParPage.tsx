import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TablePagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import * as React from "react";
import { GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY } from "../graphql/queries/propertyacknowledgementreport";
import { useQuery } from "@apollo/client";
import {
  ObjectEntriesParFunction,
  groupedRowsFunction,
  filteredGroupRows,
} from "../pages/issuanceParFunctions/row";
import { Row } from "../pages/issuanceParFunctions/tableRow";
import EnhancedTableToolbar from "./issuanceParFunctions/enhancedToolbar";
import SignatoriesComponent from "./issuanceParFunctions/SignatorySelectionContainer";
import useSignatoryStore from "../stores/signatoryStore";
import PrintReportDialogForPAR from "../components/printReportModalForPAR";
import ParAssignmentModal from "../components/ParAssignmentModal";
import MultiParAssignmentModal from "../components/MultiParAssignmentModal";
// import { parIssuanceSignatories } from "../types/user/userType";

export default function IssuanceParPage() {
  const { data, loading, error, refetch } = useQuery(
    GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [printItem, setPrintItem] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");

  // PAR Assignment Modal state (single item - legacy)
  const [openAssignmentModal, setOpenAssignmentModal] = React.useState(false);
  const [itemToAssign, setItemToAssign] = React.useState<any>(null);

  // Multi-Item PAR Assignment Modal state
  const [openMultiAssignModal, setOpenMultiAssignModal] = React.useState(false);
  const [multiAssignPOItems, setMultiAssignPOItems] = React.useState<any[]>([]);
  const [multiAssignPreSelected, setMultiAssignPreSelected] = React.useState<
    any[]
  >([]);
  const [multiAssignPONumber, setMultiAssignPONumber] = React.useState("");
  const [multiAssignSupplier, setMultiAssignSupplier] = React.useState("");
  const [multiAssignExistingPARItems, setMultiAssignExistingPARItems] =
    React.useState<any[]>([]);

  // Signatory store access
  // Persist selections across navigation using Zustand store
  const issuanceParSelections = useSignatoryStore(
    (s) => s.issuanceParSelections,
  );
  const setIssuanceParSelections = useSignatoryStore(
    (s) => s.setIssuanceParSelections,
  );
  const defaultSelections = React.useMemo(
    () => ({
      recieved_from: "",
      recieved_by: "",
      metadata: {
        recieved_from: { position: "", role: "" },
        recieved_by: { position: "", role: "" },
      },
    }),
    [],
  );

  const currentSelections = issuanceParSelections || defaultSelections;

  const groupedRows = React.useMemo(() => {
    if (!data?.propertyAcknowledgmentReportForView?.length) return [];
    const groups = groupedRowsFunction(data);
    return ObjectEntriesParFunction(groups);
  }, [data]);

  const filteredRows = React.useMemo(() => {
    if (!searchQuery.trim()) return groupedRows;
    return filteredGroupRows(groupedRows, searchQuery);
  }, [groupedRows, searchQuery]);

  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredRows, page, rowsPerPage]);

  // Get all items without PAR ID (for info display) - exclude items with 0 quantity
  const unassignedItems = React.useMemo(() => {
    if (!data?.propertyAcknowledgmentReportForView?.length) return [];
    return data.propertyAcknowledgmentReportForView.filter(
      (item: any) => !item.parId && (item.actualQuantityReceived ?? 0) > 0,
    );
  }, [data]);

  const handleOpenPrintModal = (items: any) => {
    console.log("Printing stuff", items);
    const reportTitle = items[0].category.split(" ");
    const reportTitleString = reportTitle
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    setReportType(reportTitle);
    setTitle(`${reportTitleString} Report`);
    setPrintItem(items);
    setOpenPrintModal(true);
  };

  // Open assignment modal for a single item — opens multi-item modal with that item pre-selected
  const handleOpenAssignmentModal = (item: any) => {
    // Find the PO row that contains this item to get all sibling items
    const poRow = groupedRows.find((row: any) =>
      row.items.some((it: any) => String(it.id) === String(item.id)),
    );

    if (poRow) {
      // Always open multi-item modal so users can re-split, add to existing, or create new PAR
      // (including items that already have a parId — they may need to be re-split or re-assigned)
      setMultiAssignPOItems(poRow.items);
      setMultiAssignPreSelected([item]);
      setMultiAssignPONumber(poRow.poNumber);
      setMultiAssignSupplier(poRow.supplier || "");
      // Items with existing PAR IDs in this PO (for "Add to Existing" tab)
      setMultiAssignExistingPARItems(poRow.items.filter((it: any) => it.parId));
      setOpenMultiAssignModal(true);
    } else {
      // Fallback: open legacy modal
      setItemToAssign(item);
      setOpenAssignmentModal(true);
    }
  };

  const handleCloseAssignmentModal = () => {
    setOpenAssignmentModal(false);
    setItemToAssign(null);
  };

  const handleCloseMultiAssignModal = () => {
    setOpenMultiAssignModal(false);
    setMultiAssignPOItems([]);
    setMultiAssignPreSelected([]);
    setMultiAssignExistingPARItems([]);
  };

  const handleAssignmentComplete = () => {
    refetch(); // Refresh data after assignment
  };

  const handleMultiAssignmentComplete = () => {
    refetch(); // Refresh data after multi-item assignment
  };

  // Open multi-assign modal from PO row "Assign PAR" button
  const handleOpenMultiAssignFromRow = (row: any) => {
    setMultiAssignPOItems(row.items);
    setMultiAssignPreSelected([]); // No pre-selection when opening from row
    setMultiAssignPONumber(row.poNumber);
    setMultiAssignSupplier(row.supplier || "");
    setMultiAssignExistingPARItems(row.items.filter((it: any) => it.parId));
    setOpenMultiAssignModal(true);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onSignatoriesChange = (selectedSignatories: any) => {
    // Persist to store so it survives route changes and reloads
    setIssuanceParSelections(selectedSignatories);
  };

  const handleClosePrintModal = () => {
    //remove selected items from rowSelectionModel
    setOpenPrintModal(false);
    setPrintItem(null);
  };

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
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row: any) => (
                  <Row
                    key={row.id}
                    row={row}
                    handleOpenPrintModal={handleOpenPrintModal}
                    handleOpenAssignmentModal={handleOpenAssignmentModal}
                    handleOpenMultiAssignModal={handleOpenMultiAssignFromRow}
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

        {/* Signatory Selection Component - keeping for backward compatibility */}
        <SignatoriesComponent
          signatories={currentSelections}
          onSignatoriesChange={onSignatoriesChange}
        />
      </Stack>

      {/* Print Report Dialog */}
      <PrintReportDialogForPAR
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printItem}
        reportType={reportType}
        title={title}
        signatories={currentSelections}
      />

      {/* PAR Assignment Modal (legacy single-item, for editing existing assignments) */}
      <ParAssignmentModal
        open={openAssignmentModal}
        onClose={handleCloseAssignmentModal}
        item={itemToAssign}
        onAssignmentComplete={handleAssignmentComplete}
      />

      {/* Multi-Item PAR Assignment Modal */}
      <MultiParAssignmentModal
        open={openMultiAssignModal}
        onClose={handleCloseMultiAssignModal}
        availableItems={multiAssignPOItems}
        preSelectedItems={multiAssignPreSelected}
        poNumber={multiAssignPONumber}
        supplier={multiAssignSupplier}
        existingPARItems={multiAssignExistingPARItems}
        onAssignmentComplete={handleMultiAssignmentComplete}
      />
    </PageContainer>
  );
}
