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
  Divider,
} from "@mui/material";
import { genericPreviewProps } from "../../types/previewPrintDocument/types";
import useSignatoryStore from "../../stores/signatoryStore";
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


export default function RequisitionReport({
  signatories,
  reportData,
  onPrint,
  onClose,
}: genericPreviewProps) {
  const componentRef = useRef(null);
  
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

  // Check if reportData is an array, if not, convert it to an array for consistent handling
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
                <TableCell sx={{ width: "17%" }}></TableCell>
                <TableCell sx={{ width: "13%" }}></TableCell>
                <TableCell sx={{ width: "13%" }}></TableCell>
                <TableCell sx={{ width: "34%" }}></TableCell>
                <TableCell sx={{ width: "19%" }}></TableCell>
                <TableCell sx={{ width: "16%" }}></TableCell>
                <TableCell sx={{ width: "3%" }}></TableCell>
                <TableCell sx={{ width: "6%" }}></TableCell>
                <TableCell sx={{ width: "14%" }}></TableCell>
                <TableCell sx={{ width: "14%" }}></TableCell>
                <TableCell sx={{ width: "34%" }}></TableCell>
              </TableRow>
              <TableRow>
                <HeaderTableCell colSpan={11}>
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
                          REQUISITION AND ISSUE SLIP
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
                      Appendix 63
                    </Box>
                  </Box>
                </HeaderTableCell>
              </TableRow>
              
              <TableRow>
                <StyledTableCellHeader colSpan={7}>
                  <Box sx={{ padding: "10px 0px 0px 0px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        textAlign: "left",
                        fontSize: "12px",
                      }}
                    >
                      <Typography>Division:</Typography>
                      <Box
                        sx={{ borderBottom: "1px solid #000", width: "100%" }}
                      ></Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        textAlign: "left",
                        fontSize: "12px",
                      }}
                    > 
                      <Typography>Office:  </Typography>
                      
                      <Box
                        sx={{ borderBottom: "1px solid #000", width: "100%" }}
                      > &nbsp;  &nbsp; {itemsArray[0]?.PurchaseOrder?.placeOfDelivery || ""}</Box> 
                    </Box>
                  </Box>
                </StyledTableCellHeader>
                <HeaderTableCell></HeaderTableCell>
                <HeaderTableCell colSpan={3}>
                  <Box sx={{ padding: "10px 0px 0px 0px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        textAlign: "left",
                        fontSize: "12px",
                      }}
                    >
                      <Typography>Responsibility Center Code : </Typography>
                      <Box
                        sx={{ borderBottom: "1px solid #000", width: "100%" }}
                      ></Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        textAlign: "left",
                        fontSize: "12px",
                      }}
                    >
                      <Typography>
                        RIS No. : 
                      </Typography>
                      <Box
                        sx={{ borderBottom: "1px solid #000", width: "100%" }}
                      > &nbsp; &nbsp;{itemsArray[0]?.PurchaseOrder?.poNumber || ""}</Box>
                    </Box>
                  </Box>
                </HeaderTableCell>
              </TableRow>
              
              <TableRow>
                <StyledTableCellHeader
                  colSpan={6}
                  sx={{
                    padding: "4px",
                    fontWeight: "bold",
                    fontStyle: "italic",
                  }}
                >
                  Requisition
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  colSpan={3}
                  sx={{
                    padding: "4px",
                    fontWeight: "bold",
                    fontStyle: "italic",
                  }}
                >
                  Stock Available?
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  colSpan={2}
                  sx={{
                    padding: "4px",
                    fontWeight: "bold",
                    fontStyle: "italic",
                  }}
                >
                  Issue
                </StyledTableCellHeader>
              </TableRow>
              
              <TableRow sx={{ "& th": { padding: "1px 0px" } }}>
                <StyledTableCell align="center">Stock No.</StyledTableCell>
                <StyledTableCell align="center">Item No.</StyledTableCell>
                <StyledTableCell align="center">Unit</StyledTableCell>
                <StyledTableCell align="center" colSpan={2}>Description</StyledTableCell>
                <StyledTableCell align="center">Quantity</StyledTableCell>
                <StyledTableCell align="center" colSpan={2}>Yes</StyledTableCell>
                <StyledTableCell align="center">No</StyledTableCell>
                <StyledTableCell align="center">Quantity</StyledTableCell>
                <StyledTableCell align="center">Remarks</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {itemsArray?.length > 0 ? (
                itemsArray.map((item : any, index : any) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{item.id || ""}</StyledTableCell>
                    <StyledTableCell>{item.purchaseOrderId || ""}</StyledTableCell>
                    <StyledTableCell>{item.unit || ""}</StyledTableCell>
                    <StyledTableCell colSpan={2}>{item.description || ""}</StyledTableCell>
                    <StyledTableCell>{item.quantity || ""}</StyledTableCell>
                    <StyledTableCell colSpan={2}></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell>{item.actualQuantityReceived || ""}</StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell colSpan={2}></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell colSpan={2}></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </StyledTableRow>
              )}
              
              <StyledTableRow>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell colSpan={2}></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell colSpan={2}></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell align="right">Total</StyledTableCell>
                <StyledTableCell align="right">{formatTotalAmount}</StyledTableCell>
              </StyledTableRow>
            </TableBody>
            
            <TableBody>
              <StyledTableRow>
                <StyledTableCell colSpan={4} sx={{ padding: "1px 1px 16px 1px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px"
                    }}
                  >
                    <Box sx={{ fontWeight: 600 }}>Requested by:</Box>
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
                      <Typography sx={{ fontWeight: 600 }}>{capitalizeFirstLetter(receivedFrom?.name || "")}</Typography>
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
                      Designation
                    </Box>
                  </Box>
                </StyledTableCell>
                <StyledTableCell colSpan={7} sx={{ padding: "1px 1px 16px 1px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px"
                    }}
                  >
                    <Box sx={{ fontWeight: 600 }}>Approved by:</Box>
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
                      <Typography sx={{ fontWeight: 600 }}>{capitalizeFirstLetter(InspectorOffice?.name || "")}</Typography>
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
                      Designation
                    </Box>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
              
              <StyledTableRow>
                <StyledTableCell colSpan={4} sx={{ padding: "1px 1px 16px 1px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px"
                    }}
                  >
                    <Box sx={{ fontWeight: 600 }}>Issued by:</Box>
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
                      <Typography sx={{ fontWeight: 600 }}>{capitalizeFirstLetter(supplyOffice?.name || "")}</Typography>
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
                      Designation
                    </Box>
                  </Box>
                </StyledTableCell>
                <StyledTableCell colSpan={8} sx={{ padding: "1px 1px 16px 1px" }}>
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
                      <Typography sx={{ fontWeight: 600 }}>{capitalizeFirstLetter(receivedFrom?.name || "")}</Typography>
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
                      Designation
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
