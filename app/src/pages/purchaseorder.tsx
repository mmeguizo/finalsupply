import * as React from "react";
import { GET_PURCHASEORDERS } from "../graphql/queries/purchaseorder.query";
import { useQuery } from "@apollo/client";
import {
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Tooltip,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarContainer,
  GridRowParams,
  GridCsvExportOptions,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
  useGridApiContext,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core/PageContainer";
import PrintIcon from "@mui/icons-material/Print";
// Custom toolbar with export button for PO with items
function CustomToolbar({ onExportWithItems, onPrintWithItems }: any) {
  return (
    // original toolbar
    // <GridToolbarContainer>
    //   <GridToolbar />
    //   <Tooltip title="Export">
    //     <Button startIcon={<FileDownloadIcon />} onClick={onExportWithItems}>
    //       Export with Items
    //     </Button>
    //   </Tooltip>
    //   <Tooltip title="Print">
    //     <Button
    //       startIcon={<PrintIcon />}
    //       onClick={onPrintWithItems}
    //       sx={{ ml: 1 }}
    //     >
    //       Print with Items
    //     </Button>
    //   </Tooltip>
    // </GridToolbarContainer>

    // Custom toolbar with individual
    // components instead of GridToolbar
    <GridToolbarContainer>
      {/* Individual toolbar components instead of GridToolbar */}
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />

      {/* Your custom buttons */}
      <Tooltip title="Export">
        <Button
          startIcon={<FileDownloadIcon />}
          onClick={onExportWithItems}
          sx={{ ml: 1 }}
        >
          Export
        </Button>
      </Tooltip>
      <Tooltip title="Print">
        <Button
          startIcon={<PrintIcon />}
          onClick={onPrintWithItems}
          sx={{ ml: 1 }}
        >
          Print
        </Button>
      </Tooltip>
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

export default function PurchaseOrder() {
  const { data, loading, error } = useQuery(GET_PURCHASEORDERS);

  console.log(data);

  const [selectedPO, setSelectedPO] = React.useState<any>(null);

  // Define columns for purchase orders
  const poColumns: GridColDef[] = [
    {
      field: "ponumber",
      headerName: "Purchase Order #",
      width: 150,
    },
    {
      field: "supplier",
      headerName: "Supplier",
      width: 200,
      flex: 1,
    },
    {
      field: "formattedDeliveryDate", // Use the pre-formatted field
      headerName: "Delivery Date",
      width: 150,
      // No formatter needed!
    },
    {
      field: "formattedPaymentDate", // Use the pre-formatted field
      headerName: "Payment Date",
      width: 150,
      // No formatter needed!
    },
    {
      field: "formatAmount",
      headerName: "Amount",
      type: "number",
      width: 150,
      align: "right",
      headerAlign: "right",
    },
  ];

  // Define columns for items
  const itemColumns: GridColDef[] = [
    { field: "item", headerName: "Item", width: 150 },
    { field: "description", headerName: "Description", width: 300, flex: 1 },
    { field: "unit", headerName: "Unit", width: 100 },
    { field: "quantity", headerName: "Quantity", type: "number", width: 100 },
    {
      field: "formatUnitCost",
      headerName: "Unit Cost",
      type: "number",
      width: 120,
      // valueFormatter: (params: any) => {
      //   if (params.value == null) return "₱0.00";
      //   return `₱${Number(params.value).toFixed(2)}`;
      // },
    },
    {
      field: "formatAmount",
      headerName: "Amount",
      type: "number",
      width: 120,
      // valueFormatter: (params: any) => {
      //   if (params.value == null) return "₱0.00";
      //   return `₱${Number(params.value).toFixed(2)}`;
      // },
    },
  ];

  // Format purchase orders for DataGrid
  const poRows = React.useMemo(() => {
    if (!data?.purchaseorders) return [];

    return data.purchaseorders.map((po: any) => {
      // Pre-format dates during row preparation instead of in the formatter

      console.log(po);

      const formatAmount = po.amount ? `₱${po.amount.toFixed(2)}` : "0.00";

      const formattedDeliveryDate = po.dateofdelivery
        ? new Date(Number(po.dateofdelivery)).toLocaleDateString()
        : "Not specified";

      const formattedPaymentDate = po.dateofpayment
        ? new Date(Number(po.dateofpayment)).toLocaleDateString()
        : "Not specified";

      // Use the amount directly from the data - no calculations needed
      // The data shows the amount is already populated correctly

      return {
        id: po._id,
        ...po,
        formattedDeliveryDate,
        formattedPaymentDate,
        formatAmount, // No amount recalculation needed since it's already in the data
        // No amount recalculation needed since it's already in the data
      };
    });
  }, [data]);

  // Format items for the selected purchase order
  const itemRows = React.useMemo(() => {
    if (!selectedPO?.items) return [];

    return selectedPO.items.map((item: any) => ({
      formatUnitCost: item.unitcost ? `₱${item.unitcost.toFixed(2)}` : "0.00",
      formatAmount: item.amount ? `₱${item.amount.toFixed(2)}` : "0.00",
      id: item._id || `item-${Math.random().toString(36).substr(2, 9)}`,
      ...item,
    }));
  }, [selectedPO]);

  // Handle row click to show items
  const handleRowClick = (params: GridRowParams) => {
    const clickedPO = data?.purchaseorders.find(
      (po: any) => po._id === params.id
    );
    setSelectedPO(clickedPO || null);
  };

  // Function to export PO with items
  const exportPurchaseOrdersWithItems = () => {
    // Get all purchase orders and their items
    const allData = data?.purchaseorders
      .map((po: any) => {
        // Get base PO data
        const poData = {
          "PO Number": po.ponumber,
          Supplier: po.supplier,
          "Delivery Date": new Date(
            Number(po.dateofdelivery)
          ).toLocaleDateString(),
          "Payment Date": new Date(
            Number(po.dateofpayment)
          ).toLocaleDateString(),
          "Total Amount": `${po.amount.toFixed(2)}`,
        };

        // If PO has no items, return just the PO row
        if (!po.items || po.items.length === 0) {
          return [
            {
              ...poData,
              Item: "",
              Description: "",
              Unit: "",
              Quantity: "",
              "Unit Cost": "",
              "Item Amount": "",
            },
          ];
        }

        // Otherwise, return the PO data combined with each item
        return po.items.map((item: any, idx: any) => {
          return {
            ...poData,
            // Only include PO details in first row of each PO group
            "PO Number": idx === 0 ? po.ponumber : "",
            Supplier: idx === 0 ? po.supplier : "",
            "Delivery Date":
              idx === 0
                ? new Date(Number(po.dateofdelivery)).toLocaleDateString()
                : "",
            "Payment Date":
              idx === 0
                ? new Date(Number(po.dateofpayment)).toLocaleDateString()
                : "",
            "Total Amount": idx === 0 ? `${po.amount.toFixed(2)}` : "",
            // Item details
            Item: item.item,
            Description: item.description,
            Unit: item.unit,
            Quantity: item.quantity,
            "Unit Cost": `${item.unitcost.toFixed(2)}`,
            "Item Amount": `${item.amount.toFixed(2)}`,
          };
        });
      })
      .flat();

    // Convert to CSV
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add header row
    const headers = Object.keys(allData[0]);
    csvContent += headers.join(",") + "\n";

    // Add data rows
    allData.forEach((row: any) => {
      const rowContent = headers
        .map((header) => {
          // Escape quotes and commas in text fields
          const cell = row[header] !== undefined ? row[header].toString() : "";
          return `"${cell.replace(/"/g, '""')}"`;
        })
        .join(",");
      csvContent += rowContent + "\n";
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Purchase_Order.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // print PO with items
  // Function to print PO with items
  const printPurchaseOrdersWithItems = () => {
    // Create a print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print purchase orders.");
      return;
    }

    // Start building HTML content
    let htmlContent = `
    <html>
    <head>
      <title>Purchase Orders</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .po-header { background-color: #f8f8f8; font-weight: bold; }
        .item-row { }
        .page-break { page-break-after: always; }
        .text-right { text-align: right; }
        h2 { margin-top: 0; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print();" style="padding: 10px; margin-bottom: 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Purchase Orders</button>
      <h2>Purchase Orders with Items</h2>
  `;

    // Group data by purchase order
    const purchaseOrders = data?.purchaseorders || [];

    purchaseOrders.forEach((po: any, poIndex: number) => {
      // Add purchase order header
      htmlContent += `
      <table>
        <thead>
          <tr>
            <th colspan="2">Purchase Order Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PO Number:</td>
            <td>${po.ponumber}</td>
          </tr>
          <tr>
            <td>Supplier:</td>
            <td>${po.supplier}</td>
          </tr>
          <tr>
            <td>Delivery Date:</td>
            <td>${new Date(Number(po.dateofdelivery)).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>Payment Date:</td>
            <td>${new Date(Number(po.dateofpayment)).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>Total Amount:</td>
            <td>PHP ${po.amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    `;

      // Add items table
      if (po.items && po.items.length > 0) {
        htmlContent += `
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
      `;

        po.items.forEach((item: any) => {
          htmlContent += `
          <tr>
            <td>${item.item}</td>
            <td>${item.description}</td>
            <td>${item.unit}</td>
            <td>${item.quantity}</td>
            <td class="text-right">PHP ${item.unitcost.toFixed(2)}</td>
            <td class="text-right">PHP ${item.amount.toFixed(2)}</td>
          </tr>
        `;
        });

        htmlContent += `
          </tbody>
        </table>
      `;
      } else {
        htmlContent += `<p>No items found for this purchase order.</p>`;
      }

      // Add page break between purchase orders (except for the last one)
      if (poIndex < purchaseOrders.length - 1) {
        htmlContent += `<div class="page-break"></div>`;
      }
    });

    // Close HTML document
    htmlContent += `
    </body>
    </html>
  `;

    // Write to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <PageContainer title="" breadcrumbs={[]}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error loading purchase orders: {error.message}
        </Alert>
      )}

      {data && data.purchaseorders && (
        <Stack spacing={3}>
          {/* Purchase Orders Grid */}
          <Paper sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={poRows}
              columns={poColumns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              slots={{
                toolbar: (props) => (
                  <CustomToolbar
                    {...props}
                    onExportWithItems={exportPurchaseOrdersWithItems}
                    onPrintWithItems={printPurchaseOrdersWithItems}
                  />
                ),
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              onRowClick={handleRowClick}
            />
          </Paper>

          {/* Items Grid - shown when a purchase order is selected */}
          {selectedPO && (
            <Paper sx={{ width: "100%" }}>
              <Box p={2} pb={0}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Items for Purchase Order #{selectedPO.ponumber} -{" "}
                  {selectedPO.supplier}
                </Typography>
              </Box>
              <Box sx={{ height: 300, width: "100%" }}>
                <DataGrid
                  rows={itemRows}
                  columns={itemColumns}
                  hideFooter={itemRows.length <= 10}
                  disableRowSelectionOnClick
                  density="compact"
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                />
              </Box>
            </Paper>
          )}
        </Stack>
      )}
    </PageContainer>
  );
}
