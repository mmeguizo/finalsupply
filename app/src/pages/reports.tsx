import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import Typography from "@mui/material/Typography";
import { DataGrid , GridToolbar, GridRowParams, GridRowSelectionModel} from "@mui/x-data-grid";
import { Paper, Stack, Autocomplete, TextField, CircularProgress, Alert, Box, Button, Tooltip } from "@mui/material";
// import { CustomToolbarForTable} from "../layouts/ui/genericCustomToolbar"; // This might be too generic now

// IAR Imports
import { GET_ALL_IAR_FOR_REPORTS } from "../graphql/queries/inspectionacceptancereport.query";
import { useQuery,useLazyQuery, useApolloClient  } from "@apollo/client";
import { createItemColumns as createIARItemColumns } from "./reportsFunctions/inventory_gridColDef";
import ForPrintReportingIAR from "../components/printingForReports"; // Renamed for clarity
import { GET_IAR_ITEMS_BY_IAR_ID } from "../graphql/queries/inspectionacceptancereport.query"; // You'll need to define this GraphQL query

// ICS Imports
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS } from "../graphql/queries/inspectionacceptancereport.query";
import PrintReportDialogForICS from "../components/printReportModalForICS";
import { createItemColumns as createICSItemColumns } from "./icsHighLowFunctions/icsHighLow_gridColDef";
import {CustomToolbarForTable as CustomToolbarForICS } from "../layouts/ui/customtoolbarforics"
import useSignatoryStore from "../stores/signatoryStore";
import { capitalizeFirstLetter } from "../utils/generalUtils";

// RIS Imports
import { GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY } from "../graphql/queries/requisitionIssueslip";
import PrintReportDialogForRIS from "../components/printReportModalForRIS";
import { createItemColumns as createRISItemColumns } from "./risFunctions/ris_gridColDef";
import {CustomToolbarForTable as CustomToolbarForRIS } from "../layouts/ui/customtoolbarforris"

// PAR Imports
import { GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY } from "../graphql/queries/propertyacknowledgementreport";
import PrintReportDialogForPAR from "../components/printReportModalForPAR";
import { createItemColumns as createPARItemColumns } from "./parFunctions/par_gridColDef";
import {CustomToolbarForTable as CustomToolbarForPAR } from "../layouts/ui/customtoolbarforpar"


const CategoryOptions = [
  { label: 'Inspection Acceptance Report', value: 'inspection acceptance report' },
  { label: 'Inventory Custodian Slip', value: 'inventory custodian slip' },
  { label: 'Requisition Issue Slip', value: 'requisition issue slip' },
  { label: 'Property Acknowledgement Receipt', value: 'property acknowledgement receipt' },
];

// --- IAR Table Component ---
const IARTableComponent = () => {
  const { data, loading, error } = useQuery(GET_ALL_IAR_FOR_REPORTS);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [printData, setPrintData] = React.useState<[]>([]);
  const [getIARItems, { data: iarItemsData, loading: iarItemsLoading }] = useLazyQuery(GET_IAR_ITEMS_BY_IAR_ID);

  const handleOpenPrintModal = async (rowItem: any) => {
    const { iarId } = rowItem;
    if (iarId) {
      const { data: itemsData } = await getIARItems({ variables: { iarId } });
      if (itemsData && itemsData.getIARItemsByIarId) {
        setPrintData(itemsData.getIARItemsByIarId);
        setOpenPrintModal(true);
      } else {
        console.error("No detailed items found for IAR ID:", iarId);
      }
    } else {
      console.warn("No IAR ID found for this row to print.");
    }
  };

  const itemColumns = React.useMemo(() => createIARItemColumns(handleOpenPrintModal), [handleOpenPrintModal]);

  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintData([]);
  };

  const poRows = React.useMemo(() => {
    if (!data?.iarForReports?.length) return [];
    return data.iarForReports;
  }, [data]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading IAR data: {error.message}</Alert>;

  return (
    <>
      <Paper sx={{ width: "100%" }}>
        <DataGrid
          rows={poRows}
          columns={itemColumns}
          loading={loading || iarItemsLoading}
          hideFooter={poRows.length <= 10}
          disableRowSelectionOnClick
          density="compact"
          initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
          pageSizeOptions={[5, 10, 25]}
          slots={{ toolbar: GridToolbar }}
        />
      </Paper>
      <ForPrintReportingIAR
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printData}
      />
    </>
  );
};

// --- ICS Table Component ---
const ICSTableComponent = () => {
  const { data, loading, error } = useQuery(GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS);
  const [printItem, setPrintItem] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [rowSelectionModel, setRowSelectionModel] =  React.useState<GridRowSelectionModel>([]);

  const handleOpenPrintModal = (item: any) => {
    const reportTitle = item[0].category.split(" ");
    const reportTitleString = reportTitle.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    setReportType(reportTitle.join(" ")); // Store as string
    setTitle(`${reportTitleString} Report`);
    setPrintItem(item);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setRowSelectionModel([]);
    setOpenPrintModal(false);
    setPrintItem(null);
  };

  const InspectorOffice = useSignatoryStore((state) => state.getSignatoryByRole("Inspector Officer"));
  const supplyOffice = useSignatoryStore((state) => state.getSignatoryByRole("Property And Supply Officer"));
  const receivedFrom = useSignatoryStore((state) => state.getSignatoryByRole("Recieved From"));
  const [signatories, setSignatories] = React.useState({});

  React.useEffect(() => {
    setSignatories({
      inspectionOfficer: capitalizeFirstLetter(InspectorOffice?.name ?? ''),
      supplyOfficer: capitalizeFirstLetter(supplyOffice?.name ?? ''),
      receivedFrom: capitalizeFirstLetter(receivedFrom?.name ?? ''),
    });
  }, [InspectorOffice?.name, supplyOffice?.name, receivedFrom?.name]);

  const poRows = React.useMemo(() => {
    if (!data?.inspectionAcceptanceReportForICS) return [];
    return data.inspectionAcceptanceReportForICS.map((po: any) => ({
      id: po.id,
      ...po,
      formatAmount: po.amount ? `₱${po.amount.toFixed(2)}` : "0.00",
      formatUnitCost: po.unitCost ? `₱${po.unitCost.toFixed(2)}` : "0.00",
      print: !!po.icsId,
    }));
  }, [data]);

  const itemColumns = React.useMemo(() => createICSItemColumns(handleOpenPrintModal), [handleOpenPrintModal]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading ICS data: {error.message}</Alert>;

  return (
    <>
      <Paper sx={{ width: "100%" }}>
        <DataGrid
          rows={poRows}
          columns={itemColumns}
          loading={loading}
          hideFooter={poRows.length <= 10}
          disableRowSelectionOnClick
          density="compact"
          initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          slots={{
            toolbar: (props) =>
              CustomToolbarForICS({
                props: {
                  ...props,
                  selectedItems: data?.inspectionAcceptanceReportForICS.filter((item: any) =>
                    rowSelectionModel.includes(item.id)
                  ),
                },
                printICS: handleOpenPrintModal,
              }),
          }}
          onRowSelectionModelChange={(newRowSelectionModel) => setRowSelectionModel(newRowSelectionModel)}
         // isRowSelectable={(params: GridRowParams) => !params.row.icsId}
          rowSelectionModel={rowSelectionModel}
        />
      </Paper>
      <PrintReportDialogForICS
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printItem}
        reportType={reportType}
        title={title}
        signatories={signatories}
      />
    </>
  );
};

// --- RIS Table Component ---
const RISTableComponent = () => {
  const { data, loading, error } = useQuery(GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY);
  const [printItem, setPrintItem] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

  const handleOpenPrintModal = (item: any) => {
    const reportTitleWords = item[0].category.split(" ");
    const reportTitleString = reportTitleWords.map((word: string) => capitalizeFirstLetter(word)).join(" ");
    setReportType(reportTitleWords.join(" "));
    setTitle(`${reportTitleString} Report`);
    setPrintItem(item);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setRowSelectionModel([]);
    setOpenPrintModal(false);
    setPrintItem(null);
  };

  const InspectorOffice = useSignatoryStore((state) => state.getSignatoryByRole("Inspector Officer"));
  const supplyOffice = useSignatoryStore((state) => state.getSignatoryByRole("Property And Supply Officer"));
  const receivedFrom = useSignatoryStore((state) => state.getSignatoryByRole("Recieved From"));
  const [signatories, setSignatories] = React.useState({});

  React.useEffect(() => {
    setSignatories({
      inspectionOfficer: capitalizeFirstLetter(InspectorOffice?.name ?? ''),
      supplyOfficer: capitalizeFirstLetter(supplyOffice?.name ?? ''),
      receivedFrom: capitalizeFirstLetter(receivedFrom?.name ?? ''),
    });
  }, [InspectorOffice?.name, supplyOffice?.name, receivedFrom?.name]);

  const poRows = React.useMemo(() => {
    if (!data?.requisitionIssueSlipForView) return [];
    return data.requisitionIssueSlipForView.map((po: any) => ({
      id: po.id,
      ...po,
      formatAmount: po.amount ? `₱${po.amount.toFixed(2)}` : "0.00",
      formatUnitCost: po.unitCost ? `₱${po.unitCost.toFixed(2)}` : "0.00",
      print: !!po.risId, // Assuming risId indicates printed status
    }));
  }, [data]);

  const itemColumns = React.useMemo(() => createRISItemColumns(handleOpenPrintModal), [handleOpenPrintModal]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading RIS data: {error.message}</Alert>;

  return (
    <>
      <Paper sx={{ width: "100%" }}>
        <DataGrid
          rows={poRows}
          columns={itemColumns}
          loading={loading}
          hideFooter={poRows.length <= 10}
          disableRowSelectionOnClick
          density="compact"
          initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          slots={{
            toolbar: (props) =>
              CustomToolbarForRIS({ // Ensure this toolbar is correctly named/imported
                props: {
                  ...props,
                  selectedItems: data?.requisitionIssueSlipForView.filter((item: any) =>
                    rowSelectionModel.includes(item.id)
                  ),
                },
                printRIS: handleOpenPrintModal, // Ensure prop name matches toolbar
              }),
          }}
          onRowSelectionModelChange={(newRowSelectionModel) => setRowSelectionModel(newRowSelectionModel)}
         // isRowSelectable={(params: GridRowParams) => !params.row.risId}
          rowSelectionModel={rowSelectionModel}
        />
      </Paper>
      <PrintReportDialogForRIS
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printItem}
        reportType={reportType}
        title={title}
        signatories={signatories}
      />
    </>
  );
};

// --- PAR Table Component ---
const PARTableComponent = () => {
  const { data, loading, error } = useQuery(GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY);
  const [printItem, setPrintItem] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

  const handleOpenPrintModal = (item: any) => {
    const reportTitleWords = item[0].category.split(" ");
    const reportTitleString = reportTitleWords.map((word: string) => capitalizeFirstLetter(word)).join(" ");
    setReportType(reportTitleWords.join(" "));
    setTitle(`${reportTitleString} Report`);
    setPrintItem(item);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setRowSelectionModel([]);
    setOpenPrintModal(false);
    setPrintItem(null);
  };

  const InspectorOffice = useSignatoryStore((state) => state.getSignatoryByRole("Inspector Officer"));
  const supplyOffice = useSignatoryStore((state) => state.getSignatoryByRole("Property And Supply Officer"));
  const receivedFrom = useSignatoryStore((state) => state.getSignatoryByRole("Recieved From"));
  const [signatories, setSignatories] = React.useState({});

  React.useEffect(() => {
    setSignatories({
      inspectionOfficer: capitalizeFirstLetter(InspectorOffice?.name ?? ''),
      supplyOfficer: capitalizeFirstLetter(supplyOffice?.name ?? ''),
      receivedFrom: capitalizeFirstLetter(receivedFrom?.name ?? ''),
    });
  }, [InspectorOffice?.name, supplyOffice?.name, receivedFrom?.name]);

  const poRows = React.useMemo(() => {
    if (!data?.propertyAcknowledgmentReportForView) return [];
    return data.propertyAcknowledgmentReportForView.map((po: any) => ({
      id: po.id,
      ...po,
      formatAmount: po.amount ? `₱${po.amount.toFixed(2)}` : "0.00",
      formatUnitCost: po.unitCost ? `₱${po.unitCost.toFixed(2)}` : "0.00",
      print: !!po.parId, // Assuming parId indicates printed status
    }));
  }, [data]);

  const itemColumns = React.useMemo(() => createPARItemColumns(handleOpenPrintModal), [handleOpenPrintModal]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading PAR data: {error.message}</Alert>;

  return (
    <>
      <Paper sx={{ width: "100%" }}>
        <DataGrid
          rows={poRows}
          columns={itemColumns}
          loading={loading}
          hideFooter={poRows.length <= 10}
          disableRowSelectionOnClick
          density="compact"
          initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          slots={{
            toolbar: (props) =>
              CustomToolbarForPAR({ // Ensure this toolbar is correctly named/imported
                props: {
                  ...props,
                  selectedItems: data?.propertyAcknowledgmentReportForView.filter((item: any) =>
                    rowSelectionModel.includes(item.id)
                  ),
                },
                printPAR: handleOpenPrintModal, // Ensure prop name matches toolbar
              }),
          }}
          onRowSelectionModelChange={(newRowSelectionModel) => setRowSelectionModel(newRowSelectionModel)}
         // isRowSelectable={(params: GridRowParams) => !params.row.parId}
          rowSelectionModel={rowSelectionModel}
        />
      </Paper>
      <PrintReportDialogForPAR
        open={openPrintModal}
        handleClose={handleClosePrintModal}
        reportData={printItem}
        reportType={reportType}
        title={title}
        signatories={signatories}
      />
    </>
  );
};


export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(CategoryOptions[0].value); // Default to first option

  const renderSelectedTable = () => {
    switch (selectedCategory) {
      case 'inspection acceptance report':
        return <IARTableComponent />;
      case 'inventory custodian slip':
        return <ICSTableComponent />;
      case 'requisition issue slip':
        return <RISTableComponent />;
      case 'property acknowledgement receipt':
        return <PARTableComponent />;
      default:
        return <Typography sx={{mt: 2}}>Please select a report category to view data.</Typography>;
    }
  };

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
       <Autocomplete
      disablePortal
      options={CategoryOptions}
      sx={{ width: 300, mb: 2 }}
      value={CategoryOptions.find(option => option.value === selectedCategory) || null}
      onChange={(event, newValue) => {
        setSelectedCategory(newValue ? newValue.value : null);
      }}
      renderInput={(params) => <TextField {...params} label="Categories" />}
    />
    <Stack spacing={3}  sx={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 100px)'}}>
      {renderSelectedTable()}
    </Stack>
    </PageContainer>
  );
}
