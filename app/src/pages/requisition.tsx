
import * as React from "react";
import { useQuery, useApolloClient } from "@apollo/client";
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
import { DataGrid, GridRowParams, GridToolbar, GridRowSelectionModel } from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core/PageContainer";
import PreviewIcon from "@mui/icons-material/Preview";
import PrintReportDialogForRIS from "../components/printReportModalForRIS";
import { createItemColumns } from "./risFunctions/ris_gridColDef";
import {CustomToolbarForTable } from "../layouts/ui/customtoolbarforris"
import useSignatoryStore from "../stores/signatoryStore";
import { capitalizeFirstLetter } from "../utils/generalUtils";


//@ts-ignore
// import { GET_ALL_ICS_PURCHASEORDER_ITEMS } from "../graphql/queries/purchaseorder.query";
import { GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY } from "../graphql/queries/requisitionIssueslip";
export default function RequisitionPage() {
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY);
  const [printItem, setPrintItem] = React.useState<any>(null);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [reportType, setReportType] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [rowSelectionModel, setRowSelectionModel] =  React.useState<GridRowSelectionModel>([]);
  const [dataToPrint, setDataToPrint] = React.useState([])
  const handleOpenPrintModal = (item: any) => {
    const reportTitle = item[0].category.split(" ")
    const reportTitleString = reportTitle.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    setReportType(reportTitle);
    setTitle(`${reportTitleString} Report`);
    setPrintItem(item);
    setOpenPrintModal(true);
  };

  const handleClosePrintModal = () => {

    //remove selected items from rowSelectionModel
    setRowSelectionModel([])

    setOpenPrintModal(false);
    setPrintItem(null);
  };

  const InspectorOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Inspector Officer")
  );
  const supplyOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Property And Supply Officer")
  );
  const receivedFrom = useSignatoryStore((state) =>
    state.getSignatoryByRole("Recieved From")
  );
  const [signatories, setSignatories] = React.useState({});

  // Use useEffect instead of useMemo for side effects like setState
  React.useEffect(() => {
    setSignatories({
      inspectionOfficer: capitalizeFirstLetter(InspectorOffice?.name ?? ''),
      supplyOfficer: capitalizeFirstLetter(supplyOffice?.name ?? ''),
      receivedFrom: capitalizeFirstLetter(receivedFrom?.name ?? ''),
    });
  }, [InspectorOffice?.name, supplyOffice?.name, receivedFrom?.name]); // Depend on the actual values that should trigger updates


  const poRows = React.useMemo(() => {
    if (!data?.requisitionIssueSlipForView) return [];
    return data.requisitionIssueSlipForView.map((po: any) => {
      const formatAmount = po.amount ? `₱${po.amount.toFixed(2)}` : "0.00";
      const formatUnitCost = po.unitCost ? `₱${po.unitCost.toFixed(2)}` : "0.00";
      const isPrinted = po.icsId ? true : false

      return {
        id: po.id,
        ...po,
        formatAmount,
        formatUnitCost,
        print : isPrinted
      };
    });
  }, [data]);

  const itemColumns = React.useMemo(
    () => createItemColumns(handleOpenPrintModal),
    [handleOpenPrintModal]
  );


  const handleRowClick = (params: GridRowParams) => {
    // console.log("Row clicked", params);
  };

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
      <Stack spacing={3} sx={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 100px)'}}>
        <Paper sx={{ width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <DataGrid
              rows={poRows}
              columns={itemColumns}
              loading={loading}
              hideFooter={poRows.length <= 10}
              disableRowSelectionOnClick
              density="compact"
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              onRowClick={handleRowClick}
              checkboxSelection
              slots={{
                toolbar: (props) =>
                  CustomToolbarForTable({
                    props: { 
                      ...props, 
                      selectedItems: data?.requisitionIssueSlipForView.filter((item: any) => 
                        rowSelectionModel.includes(item.id)
                      ),
                    },
                    printICS: handleOpenPrintModal,
                  }),
              }}
              onRowSelectionModelChange={(newRowSelectionModel) => {
                setRowSelectionModel(newRowSelectionModel);
              }}
              // isRowSelectable={(params: GridRowParams) => !params.row.risId }
              rowSelectionModel={rowSelectionModel}
            />
          </div>
        </Paper>
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
