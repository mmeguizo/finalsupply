import React, { useRef, useEffect } from 'react';
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
  styled
} from "@mui/material";
import { genericPreviewProps } from "../../types/previewPrintDocument/types";
import { Divider } from "@mui/material";
import useSignatoryStore from "../../stores/signatoryStore";
import { capitalizeFirstLetter } from "../../utils/generalUtils";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: "1px solid black",
  padding: "4px",
  fontSize: "12px",
  fontWeight: "normal"
}));

const StyledTableCellHeader = styled(StyledTableCell)(({ theme }) => ({
  whiteSpace: "nowrap",
  textAlign: "left",
  padding: "0px 6px"
}));

const StyledTableRow = styled(TableRow)({
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});

const HeaderTableCell = styled(StyledTableCell)({
  padding: 0
});

// Improved PrintContainer with better print isolation
const PrintContainer = styled(Box)({
  '@media print': {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '210mm',
    height: '297mm',
    margin: 0,
    padding: 0,
    pageBreakAfter: 'always',
    backgroundColor: 'white',
    zIndex: 9999,
    visibility: 'visible'
  }
});

// Controls for buttons that shouldn't print
const PrintControls = styled(Box)({
  '@media print': {
    display: 'none !important'
  }
});


export default function PropertyAcknowledgementReceipt({
  signatories,
  reportData,
  onPrint,
  onClose,
}: genericPreviewProps) {
  const componentRef = useRef(null);

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
    const style = document.createElement('style');
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

    // Check if reportData is an array, if not, convert it to an array for consistent handling
    const itemsArray = Array.isArray(reportData) 
    ? reportData.filter(item => item !== null && item !== undefined) 
    : (reportData ? [reportData] : []);
  
  // Calculate total amount from all items
  const totalAmount = itemsArray.reduce((sum, item) => {
    return sum + (item?.amount || 0);
  }, 0);
  const totalUnitCost = itemsArray.reduce((sum, item) => {
    return sum + (item?.unitCost || 0);
  }, 0);
  
  // Format the total amount
  // Format the total amount
  const formatTotalAmount = `₱${totalAmount.toFixed(2)}`;
  const formatTotalUnitCost = `₱${totalUnitCost.toFixed(2)}`;


  return (
    
    <>
      <PrintControls sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        {/* <Button onClick={onClose} variant="outlined">Back</Button> */}
        {/* <Button onClick={handlePrint} variant="contained">Print Report</Button>  */}
      </PrintControls>
      
      <Box id="printable-report" ref={componentRef}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid black' }}>
          <Table sx={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow sx={{ visibility: "collapse", height: 0 }}>
                <TableCell sx={{ width: "11%" }}></TableCell>
                <TableCell sx={{ width: "11%" }}></TableCell>
                <TableCell sx={{ width: "28%" }}></TableCell>
                <TableCell sx={{ width: "25%" }}></TableCell>
                <TableCell sx={{ width: "11%" }}></TableCell>
                <TableCell sx={{ width: "14%" }}></TableCell>
              </TableRow>
              <TableRow>
                <HeaderTableCell colSpan={6}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "4px 0px",
                      position: "relative",
                      gap: "0.5em"
                    }}
                  >
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "grid",
                        gridTemplateColumns: "2fr 4fr 2fr",
                        gridTemplateRows: "90px",
                        alignItems: "center",
                        textAlign: "center"
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
                            objectFit: "contain"
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center"
                        }}
                      >
                        <Typography variant="h6" sx={{ fontSize: "14px", fontWeight: "normal" }}>
                          REPUBLIC OF THE PHILIPPINES
                        </Typography>
                        <Typography variant="h5" sx={{ fontSize: "16px", fontWeight: 600 }}>
                          CARLOS HILADO MEMORIAL STATE UNIVERSITY
                        </Typography>
                        <Typography variant="h6" sx={{ fontSize: "14px", fontWeight: "normal" }}>
                          PROPERTY ACKNOWLEDGEMENT RECEIPT
                        </Typography>
                      </Box>
                      <Box></Box>
                    </Box>

                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gridTemplateRows: "3em"
                      }}
                    >
                      <Box></Box>
                      <Box
                        sx={{
                          display: "grid",
                          justifyContent: "center",
                          alignItems: "end"
                        }}
                      >
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          justifyContent: "start",
                          alignItems: "center",
                          fontWeight: 600
                        }}
                      >
                        PAR#: {reportData && reportData[0]?.parId || ""}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: "3px",
                        right: "3px",
                        textAlign: "right"
                      }}
                    >
                      <Typography 
                        sx={{ 
                          fontFamily: "serif",
                          fontStyle: "italic",
                          fontWeight: "bold",
                          fontSize: "16px"
                        }}
                      >
                        Appendix 71
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontFamily: "system-ui",
                          fontSize: "12px"
                        }}
                      >
                        page 1/1
                      </Typography>
                    </Box>
                  </Box>
                </HeaderTableCell>
              </TableRow>

              <TableRow sx={{ "& th": { padding: "1px 0px" } }}>
                <StyledTableCell align="left">Quantity</StyledTableCell>
                <StyledTableCell align="left">Unit</StyledTableCell>
                <StyledTableCell align="center" colSpan={2}>Description and Property Number</StyledTableCell>
                <StyledTableCell align="right">Unit Price</StyledTableCell>
                <StyledTableCell align="right">Total Price</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
            
            {reportData ? 
                reportData.map((reportData : any, index : any) => (
                  <StyledTableRow key={reportData?.id}>
                    <StyledTableCell align="left">{reportData.quantity}</StyledTableCell>
                    <StyledTableCell align="left">{reportData.unit}</StyledTableCell>
                    <StyledTableCell align="right" colSpan={2}>{reportData.description}</StyledTableCell>
                    <StyledTableCell align="right">{reportData.unitCost}</StyledTableCell>
                    <StyledTableCell align="right">{reportData.amount}</StyledTableCell>
                  </StyledTableRow>
                ))
              : (
                <StyledTableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell colSpan={2}></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </StyledTableRow>
              )  }

              <StyledTableRow>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell align="right" colSpan={2} sx={{ paddingLeft: "14%", fontWeight: 600 }}>Total</StyledTableCell>
                <StyledTableCell  align="right">{formatTotalUnitCost}</StyledTableCell>
                <StyledTableCell align="right">{formatTotalAmount}</StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell colSpan={6}>Remarks:</StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell colSpan={6}></StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell colSpan={3} sx={{ padding: "1px 1px 16px 1px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px"
                    }}
                  >
                    <Box sx={{ fontWeight: 600 }}>Received from:</Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "22px 75px",
                        gap: "20px",
                        height: "125px",
                        marginTop: "5px",
                        alignContent: "stretch",
                        alignItems: "stretch",
                        justifyContent: "flex-end",
                        textAlign: "center"
                      }}
                    >
                     <Divider sx={{ width: "100%", margin: "5px 0" }} />
                      <Typography sx={{ fontWeight: 600 }}>{reportData?.PurchaseOrder?.supplier || ""}</Typography>
                     <Divider sx={{ width: "100%", margin: "5px 0" }} />
                    </Box>
                    <Box
                      sx={{
                        textAlign: "center",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px"
                      }}
                    >
                      Date: {reportData?.PurchaseOrder?.dateOfDelivery || ""}
                    </Box>
                  </Box>
                </StyledTableCell>
                <StyledTableCell colSpan={3} sx={{ padding: "1px 1px 16px 1px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px"
                    }}
                  >
                    <Box sx={{ fontWeight: 600 }}>Received by:</Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "0px 40px",
                        gap: "10px",
                        height: "125px",
                        marginTop: "5px",
                        alignContent: "stretch",
                        alignItems: "stretch",
                        justifyContent: "flex-end",
                        textAlign: "center"
                      }}
                    >
                        {capitalizeFirstLetter(InspectorOffice?.name)}
                      <Divider sx={{ width: "100%", margin: "0px 0" }} />
                      <Typography sx={{ fontWeight: 600 }}>Signature over Printed Name</Typography>
                      {capitalizeFirstLetter(InspectorOffice?.role)}
                      <Divider sx={{ width: "100%", margin: "0px 0" }} />
                      <Typography sx={{ fontWeight: 600 }}>Position / Office</Typography>
                    </Box>
                    <Box
                      sx={{
                        textAlign: "center",
                        margin: "0 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px"
                      }}
                    >
                      Date: {reportData?.PurchaseOrder?.dateOfPayment || ""}
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