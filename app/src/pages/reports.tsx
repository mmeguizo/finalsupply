import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import Typography from "@mui/material/Typography";
import { DataGrid , GridToolbar, GridRowParams} from "@mui/x-data-grid";
import { Paper, Stack } from "@mui/material";
import { CustomToolbarForTable} from "../layouts/ui/genericCustomToolbar";
import { GET_ALL_INSPECTION_ACCEPTANCE_REPORT } from "../graphql/queries/inspectionacceptancereport.query";
import { GET_ALL_IAR_FOR_REPORTS } from "../graphql/queries/inspectionacceptancereport.query";
import { useQuery,  } from "@apollo/client";
import { createItemColumns } from "./reportsFunctions/inventory_gridColDef";


const handleOpenPrintModal = (item: any) => {
  console.log(item);
  };




export default function ReportsPage() {
  const { data, loading, error, refetch } = useQuery(GET_ALL_IAR_FOR_REPORTS);
//  const { data : reports, loading: loading1, error : error1, refetch : refetch1}  = useQuery(GET_ALL_IAR_FOR_REPORTS);
//  console.log(reports)

  const itemColumns = React.useMemo(
    () => createItemColumns(handleOpenPrintModal),
    [handleOpenPrintModal]
  );
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
    </PageContainer>
  );

}