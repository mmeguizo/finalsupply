import React, { useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  Button,
} from "@mui/material";
import { InspectionAcceptanceReportPropsForRIS } from "../../types/previewPrintDocument/types";
import useSignatoryStore from "../../stores/signatoryStore";
import { Divider } from "@mui/material";
import { capitalizeFirstLetter } from "../../utils/generalUtils";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: "1px solid black",
  padding: "4px",
  fontSize: "12px",
  fontWeight: "normal",
}));

const StyledTableCellHeader = styled(StyledTableCell)(({ theme }) => ({
  whiteSpace: "nowrap",
  textAlign: "left",
  padding: "0px 6px",
}));

const StyledTableRow = styled(TableRow)({
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});

const HeaderTableCell = styled(StyledTableCell)({
  padding: 0,
});

// Improved PrintContainer with better print isolation
const PrintContainer = styled(Box)({
  "@media print": {
    position: "fixed",
    left: 0,
    top: 0,
    width: "210mm",
    height: "297mm",
    margin: 0,
    padding: 0,
    pageBreakAfter: "always",
    backgroundColor: "white",
    zIndex: 9999,
    visibility: "visible",
  },
});

// Controls for buttons that shouldn't print
const PrintControls = styled(Box)({
  "@media print": {
    display: "none !important",
  },
});

export default function InspectionAcceptanceReport({
  signatories,
  reportData,
  onPrint,
  onClose,
}: InspectionAcceptanceReportPropsForRIS) {
  const componentRef = useRef(null);
  // const { signatories, loading, error } = useSignatoryStore();
  // Get specific signatories by role

  console.log("reportData", reportData);

  const InspectorOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Inspector Officer")
  );
  const supplyOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Property And Supply Officer")
  );
  const receivedFrom = useSignatoryStore((state) =>
    state.getSignatoryByRole("Recieved From")
  );
  // Create and inject print styles dynamically
  useEffect(() => {
    // Create a style element
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        @page {
          size: auto;
          margin: 20mm;
        }
        body {
          visibility: visible !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #printable-report {
          visibility: visible !important;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        /* Hide non-printable elements */
        button, 
        .MuiBackdrop-root,
        .MuiDialog-container,
        div[role="presentation"],
        div[role="dialog"],
        .PrintControls {
          display: none !important;
        }
      }
    `;

    // Append the style to the document head
    document.head.appendChild(style);

    // Clean up on component unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const itemsArray = Array.isArray(reportData) 
  ? reportData.filter(item => item !== null && item !== undefined) 
  : (reportData ? [reportData] : []);
    // Calculate total amount from all items
    const totalAmount = itemsArray.reduce((sum, item) => {
      return sum + (item?.amount || 0);
    }, 0);
    
    // Format the total amount
    const formatTotalAmount = `₱${totalAmount.toFixed(2)}`;
  

  return (
    <>
      <PrintControls
        sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}
      >
        {/* <Button onClick={onClose} variant="outlined">Back</Button> */}
        {/* <Button onClick={handlePrint} variant="contained">Print Report</Button>  */}
      </PrintControls>

      <Box id="printable-report" ref={componentRef}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid black" }}
        >
          <Table sx={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow sx={{ visibility: "collapse", height: 0 }}>
                <TableCell sx={{ width: "7%" }}></TableCell>
                <TableCell sx={{ width: "7%" }}></TableCell>
                <TableCell sx={{ width: "18%" }}></TableCell>
                <TableCell sx={{ width: "18%" }}></TableCell>
                <TableCell sx={{ width: "16%" }}></TableCell>
                <TableCell sx={{ width: "11%" }}></TableCell>
                <TableCell sx={{ width: "11%" }}></TableCell>
                <TableCell sx={{ width: "12%" }}></TableCell>
              </TableRow>
              <TableRow>
                <HeaderTableCell colSpan={8}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "4px 0px",
                      position: "relative",
                      gap: "0.5em",
                    }}
                  >
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "grid",
                        gridTemplateColumns: "2fr 4fr 2fr",
                        gridTemplateRows: "90px",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Box>
                        <Box
                          component="img"
                          src="chmsu-logo.png"
                          alt="CHMSU Logo"
                          sx={{
                            width: "40%",
                            height: "40%",
                            marginTop: "10%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontSize: "14px", fontWeight: "normal" }}
                        >
                          REPUBLIC OF THE PHILIPPINES
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ fontSize: "16px", fontWeight: 600 }}
                        >
                          CARLOS HILADO MEMORIAL STATE UNIVERSITY
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontSize: "14px", fontWeight: "normal" }}
                        >
                          INSPECTION & ACCEPTANCE REPORT
                        </Typography>
                      </Box>
                      <Box></Box>
                    </Box>

                    <Box
                      sx={{
                        flexGrow: 1,
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
                        No. {itemsArray[0]?.risId || ""}
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          justifyContent: "end",
                          alignItems: "start",
                        }}
                      >
                        Page 1 of 1
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: "3px",
                        right: "0px",
                        fontFamily: "serif",
                        fontStyle: "italic",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      Appendix 62
                    </Box>
                  </Box>
                </HeaderTableCell>
              </TableRow>

              <TableRow>
                <StyledTableCellHeader colSpan={2}>
                  Supplier:
                </StyledTableCellHeader>
                <StyledTableCellHeader colSpan={6}>
                  {itemsArray[0]?.PurchaseOrder?.supplier || ""}
                </StyledTableCellHeader>
              </TableRow>

              <TableRow>
                <StyledTableCellHeader colSpan={2}>
                  PO # & Date:
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  {itemsArray[0]?.PurchaseOrder?.poNumber || ""}
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  {itemsArray[0]?.PurchaseOrder?.dateOfPayment || ""}
                </StyledTableCellHeader>
                <StyledTableCellHeader>Invoice# & Date:</StyledTableCellHeader>
                <StyledTableCellHeader colSpan={2}>
                  {itemsArray[0]?.PurchaseOrder?.invoice || ""}
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  {itemsArray[0]?.PurchaseOrder?.dateOfDelivery || ""}
                </StyledTableCellHeader>
              </TableRow>

              <TableRow>
                <StyledTableCellHeader colSpan={3}>
                  Requisitioning Office/Department:
                </StyledTableCellHeader>
                <StyledTableCellHeader colSpan={5}>
                  {itemsArray[0]?.PurchaseOrder?.placeOfDelivery || ""}
                </StyledTableCellHeader>
              </TableRow>

              <TableRow sx={{ "& th": { padding: "1px 0px" } }}>
                <StyledTableCell align="center">Item #</StyledTableCell>
                <StyledTableCell align="center">Unit</StyledTableCell>
                <StyledTableCell align="center" colSpan={3}>
                  Description
                </StyledTableCell>
                <StyledTableCell align="center">Quantity</StyledTableCell>
                <StyledTableCell align="center">Unit Cost</StyledTableCell>
                <StyledTableCell align="center">Amount</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {itemsArray?.length > 0 ? (
                itemsArray.map((item : any, index : any) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{index + 1}</StyledTableCell>
                    <StyledTableCell>{item.unit}</StyledTableCell>
                    <StyledTableCell colSpan={3}>
                      {item.description}
                    </StyledTableCell>
                    <StyledTableCell>{item.quantity}</StyledTableCell>
                    <StyledTableCell>{item.unitCost}</StyledTableCell>
                    <StyledTableCell>{item.amount}</StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell colSpan={3}></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </StyledTableRow>
              )}

              <StyledTableRow>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell colSpan={4}></StyledTableCell>
                <StyledTableCell>Total</StyledTableCell>
                <StyledTableCell>
                {formatTotalAmount}
                </StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell colSpan={4} sx={{ padding: "20px 0px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px",
                    }}
                  >
                    <Box>Date Inspected: {itemsArray[0]?.PurchaseOrder?.dateOfDelivery || ""}</Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "20px 35px",
                        gap: "20px",
                        alignItems: "flex-start",
                        height: "150px",
                        marginTop: "5px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-evenly",
                          alignItems: "center",
                          width: "100%",
                          gap: "4px",
                        }}
                      >
                        <Box
                          sx={{
                            width: "50px",
                            height: "50px",
                            border: "1px dotted black",
                          }}
                        ></Box>
                        <Typography>
                          Inspected, verified and found in order as to quantity
                          and specification
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        marginTop: "10px",
                        width: "75%",
                        textAlign: "center",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                    >
                      {capitalizeFirstLetter(InspectorOffice?.name)}
                      <Divider sx={{ width: "100%", margin: "5px 0" }} />
                      Inspection Officer
                    </Box>
                  </Box>
                </StyledTableCell>
                <StyledTableCell colSpan={4} sx={{ padding: "20px 0px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px",
                    }}
                  >
                    <Box>Date Received: {itemsArray[0]?.PurchaseOrder?.dateOfDelivery  || ""}</Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "20px 35px",
                        gap: "20px",
                        alignItems: "flex-start",
                        height: "150px",
                        marginTop: "5px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          gap: "4px",
                        }}
                      >
                        <Box
                          sx={{
                            width: "40px",
                            aspectRatio: "3/2",
                            border: "1px dotted black",
                            backgroundColor: itemsArray[0]?.PurchaseOrder?.status === "complete"
                              ? "#ccc"
                              : "transparent",
                          }}
                        ></Box>
                        <Typography sx={{ width: "65px" }}>Complete</Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          gap: "4px",
                        }}
                      >
                        <Box
                          sx={{
                            width: "40px",
                            aspectRatio: "3/2",
                            border: "1px dotted black",
                            backgroundColor: itemsArray[0]?.PurchaseOrder?.status !== "complete"
                              ? "#ccc"
                              : "transparent",
                          }}
                        ></Box>
                        <Typography sx={{ width: "65px" }}>Partial</Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        marginTop: "10px",
                        width: "75%",
                        textAlign: "center",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                    >
                      {capitalizeFirstLetter(supplyOffice?.name)}
                      <Divider sx={{ width: "100%", margin: "5px 0" }} />
                      Property and Supply Management Officer
                    </Box>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}
