import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
} from "@mui/material";

interface PurchaseOrderPrintModalProps {
  open: boolean;
  handleClose: () => void;
  purchaseOrder: any;
}

export default function PurchaseOrderPrintModal({
  open,
  handleClose,
  purchaseOrder,
}: PurchaseOrderPrintModalProps) {
  console.log(purchaseOrder); // Remove this line after testing

  const data = purchaseOrder;
  const StyledTableCell = styled(TableCell)({
    border: "1px solid black",
    padding: "4px",
    fontSize: "12px",
  });

  const StyledTableRow = styled(TableRow)({
    "&:nth-of-type(odd)": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Print Purchase Order</DialogTitle>
      {/* <DialogContent>
        <Typography>Hello World</Typography>
      </DialogContent> */}

      <Box
        sx={{
          width: "210mm",
          height: "297mm",
          margin: "0 auto",
          border: "1px solid #000",
          padding: "0.25in",
          fontFamily: "sans-serif",
        }}
      >
        <TableContainer>
          <Table sx={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow>
                <StyledTableCell colSpan={8} align="center">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5em",
                      padding: "4px 0",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "2fr 4fr 2fr",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Box></Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          REPUBLIC OF THE PHILIPPINES
                        </Typography>
                        <Typography>
                          CARLOS HILADO MEMORIAL STATE UNIVERSITY
                        </Typography>
                        <Typography>INSPECTION & ACCEPTANCE REPORT</Typography>
                        <Typography>Appendix 62</Typography>
                      </Box>
                      <Box
                        sx={{
                          position: "absolute",
                          top: "3px",
                          right: "0",
                          fontStyle: "italic",
                          fontWeight: "bold",
                          fontSize: "16px",
                          fontFamily: "serif",
                        }}
                      >
                        No.
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "2fr 4fr 2fr",
                        gridTemplateRows: "2.5em",
                      }}
                    >
                      <Box></Box>
                      <Box
                        sx={{
                          display: "grid",
                          justifyContent: "center",
                          alignItems: "end",
                        }}
                      >
                        Page 1 of 1
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          justifyContent: "end",
                          alignItems: "start",
                        }}
                      ></Box>
                    </Box>
                  </Box>
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <StyledTableRow>
                <StyledTableCell colSpan={4}>
                  Supplier: {data?.supplier  || ""}
                </StyledTableCell>
                <StyledTableCell colSpan={4}>
                  PO # & Date: {data?.poNumber || ""}
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell colSpan={4}>
                  Invoice# & Date: {data?.invoiceNumber || ""}
                </StyledTableCell>
                <StyledTableCell colSpan={4}>
                  Requisitioning Office/Department: {data?.department || ""}
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell>Item #</StyledTableCell>
                <StyledTableCell>Unit</StyledTableCell>
                <StyledTableCell>Description</StyledTableCell>
                <StyledTableCell>Quantity</StyledTableCell>
                <StyledTableCell>Unit Cost</StyledTableCell>
                <StyledTableCell>Amount</StyledTableCell>
              </StyledTableRow>
              {data?.items.map((item :any, index : any) => (
                <StyledTableRow key={index}>
                  <StyledTableCell>{item.itemNumber || ""}</StyledTableCell>
                  <StyledTableCell>{item.unit || ""}</StyledTableCell>
                  <StyledTableCell>{item.description || ""}</StyledTableCell>
                  <StyledTableCell>{item.quantity || ""}</StyledTableCell>
                  <StyledTableCell>{item.unitCost || ""}</StyledTableCell>
                  <StyledTableCell>{item.amount || ""}</StyledTableCell>
                </StyledTableRow>
              ))}
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="right">
                  Total
                </StyledTableCell>
                <StyledTableCell>{data?.totalAmount || ""}</StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell colSpan={4}>
                  Date Inspected: {data?.dateInspected || ""}
                  <br />
                  Inspected, verified and found in order as to quantity and
                  specification
                  <br />
                  Inspection Officer: {data?.inspectionOfficer || ""}
                </StyledTableCell>
                <StyledTableCell colSpan={4}>
                  Date Received: {data?.dateReceived || ""}
                  <br />
                  Complete/Partial
                  <br />
                  Property and Supply Management Officer: {data?.supplyOfficer || ""}
                </StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
