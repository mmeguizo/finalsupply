import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import Typography from "@mui/material/Typography";
import { DataGrid , GridToolbar, GridRowParams} from "@mui/x-data-grid";
import { Paper, Stack } from "@mui/material";
import { CustomToolbarForTable} from "../layouts/ui/genericCustomToolbar";
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT } from "../graphql/queries/inspectionacceptancereport.query";
import { GET_ALL_IAR_FOR_REPORTS } from "../graphql/queries/inspectionacceptancereport.query";
import { useQuery,useLazyQuery  } from "@apollo/client";
import { createItemColumns } from "./reportsFunctions/inventory_gridColDef";
import ForPrintReporting from "../components/printingForReports";
import { GET_IAR_ITEMS_BY_IAR_ID } from "../graphql/queries/inspectionacceptancereport.query"; // You'll need to define this GraphQL query


export default function ReportsPage() {
  const { data, loading, error, refetch } = useQuery(GET_ALL_IAR_FOR_REPORTS);
  const [openPrintModal, setOpenPrintModal] = React.useState(false);
  const [printData, setPrintData] = React.useState<[]>([]);
  const [getIARItems, { data: iarItemsData, loading: iarItemsLoading, error: iarItemsError }] = useLazyQuery(GET_IAR_ITEMS_BY_IAR_ID);

  const handleOpenPrintModal = async (rowItem: any) => {
    const { iarId } = rowItem; // Get iarId from the row item
    console.log({ handleOpenPrintModalIARId: iarId });

    if (iarId) {
        // Execute the lazy query to get all items for this iarId
        const { data } = await getIARItems({ variables: { iarId } });
        if (data && data.getIARItemsByIarId) {
          console.log("Detailed items for IAR ID:", data.getIARItemsByIarId);
            setPrintData(data.getIARItemsByIarId);
            setOpenPrintModal(true);
        } else {
            console.error("No detailed items found for IAR ID:", iarId);
            // Optionally, show a user notification that no items were found
        }
    } else {
        console.warn("No IAR ID found for this row to print.");
        // Optionally, show a user notification
    }
    };
  
  const itemColumns = React.useMemo(
    () => createItemColumns(handleOpenPrintModal),
    [handleOpenPrintModal]
  );

  const handleClosePrintModal = () => {
    setOpenPrintModal(false);
    setPrintData([]);
  };
  const handleRowClick = (params: GridRowParams) => {
    // console.log("Row clicked", params);
  };

  const poRows = React.useMemo(() => {
    if (!data?.iarForReports.length) return [];
    console.log(data?.iarForReports)
    return data.iarForReports
  }, [data]);

  return (
    <PageContainer title="" breadcrumbs={[]} sx={{ overflow: 'hidden' }}>
    <Stack spacing={3}  sx={{ width: '100%', overflow: 'auto', maxHeight: 'calc(100vh - 100px)'}}>
      <Paper sx={{ width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data && data.iarForReports && (
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
                slots={{ toolbar: GridToolbar }}
              />
            )}
          </div>
      </Paper>
    </Stack>
    <ForPrintReporting 
    open={openPrintModal}
    handleClose={handleClosePrintModal}
    reportData={printData}
    />
    </PageContainer>
  );

}