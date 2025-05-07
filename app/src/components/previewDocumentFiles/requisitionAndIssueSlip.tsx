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
import { genericPreviewProps } from "../../types/previewPrintDocument/types";

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
}: genericPreviewProps) {
  const componentRef = useRef(null);
  // Add this line to define emptyRows
  let emptyRows: any; // You can adjust this value if needed

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

  //   const handlePrint = () => {
  //     if (onPrint) {
  //       onPrint();
  //     } else {
  //       window.print();
  //     }
  //   };

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
                        gridTemplateColumns: "1fr 3fr 1fr",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Box sx={{ display: "grid", placeItems: "center" }}>
                        <Box
                          component="img"
                          src="chmsu-logo.png"
                          alt="CHMSU Logo"
                          sx={{
                            width: "90px",
                            aspectRatio: "1/1",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          alignContent: "center",
                          textAlign: "center",
                          padding: "3rem 0px",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            fontStyle: "italic",
                          }}
                        >
                          Republic of the PHILIPPINES
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            margin: "0.25rem 0px 0.5rem 0px",
                            fontStyle: "italic",
                          }}
                        >
                          Carlos Hilado Memorial State University
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                          }}
                        >
                          Requisition and Issue Slip
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          textAlign: "right",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography
                            sx={{ fontStyle: "italic", fontSize: "16px" }}
                          >
                            Appendix 63
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: "calc(100% + 3rem)",
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: "0.5ch",
                            marginLeft: "calc(3rem * -1)",
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: "bold", fontSize: "12px" }}
                          >
                            Fund Cluster :
                          </Typography>
                          <Box sx={{ borderBottom: "1px solid #000" }}></Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </HeaderTableCell>
              </TableRow>
              <TableRow>
                <HeaderTableCell colSpan={11}></HeaderTableCell>
              </TableRow>
              <TableRow>
                <HeaderTableCell colSpan={7}>
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
                      > &nbsp;  &nbsp; {reportData?.PurchaseOrder?.placeOfDelivery}</Box> 
                    </Box>
                  </Box>
                </HeaderTableCell>
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
                      > &nbsp; &nbsp;{reportData?.PurchaseOrder?.poNumber || ""}</Box>
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
                    fontSize: "10px",
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
              <TableRow>
                <StyledTableCellHeader
                  sx={{ padding: "4px", fontSize: "12px" }}
                >
                  Stock No.
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  sx={{ padding: "4px", fontSize: "12px" }}
                >
                  Item No.
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  sx={{ padding: "4px", fontSize: "12px" }}
                >
                  Unit
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  colSpan={2}
                  sx={{ padding: "4px", fontSize: "12px" }}
                >
                  Description
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  sx={{ padding: "4px", fontSize: "12px" }}
                >
                  Quantity
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  colSpan={2}
                  sx={{ padding: "4px", fontSize: "12px" }}
                >
                  Yes
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  sx={{ padding: "4px", fontSize: "12px" }}
                >
                  No
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  sx={{ padding: "4px", fontSize: "12px" }}
                >
                  Quantity
                </StyledTableCellHeader>
                <StyledTableCellHeader
                  sx={{ padding: "4px", fontSize: "12px" }}
                >
                  Remarks
                </StyledTableCellHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData ? (
                <StyledTableRow key={1}>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell>{1}</StyledTableCell>
                  <StyledTableCell>{reportData.unit}</StyledTableCell>
                  <StyledTableCell colSpan={2}>
                    {reportData.description}
                  </StyledTableCell>
                  <StyledTableCell>{reportData.quantity}</StyledTableCell>
                  <StyledTableCell colSpan={2}></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell>{reportData.actualQuantityReceived}</StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </StyledTableRow>
              ) : (
                // Fill with empty rows if no items
                  <StyledTableRow key={1}>
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
            </TableBody>
            <TableBody component="tfoot">
              <StyledTableRow>
                <StyledTableCell
                  colSpan={2}
                  sx={{
                    borderRight: "none",
                    padding: "10px 0px 0px 12px",
                    alignContent: "start",
                  }}
                >
                  Purpose:
                </StyledTableCell>
                <StyledTableCell
                  colSpan={9}
                  sx={{
                    borderLeft: "none",
                    padding: "0px",
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Box
                      sx={{
                        width: "100%",
                        display: "block",
                        height: "24px",
                        borderBottom: "1px solid #000",
                      }}
                    >
                      {reportData?.purpose || ""}
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        display: "block",
                        height: "24px",
                        borderBottom: "1px solid #000",
                      }}
                    ></Box>
                    <Box
                      sx={{
                        width: "100%",
                        display: "block",
                        height: "24px",
                      }}
                    ></Box>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell sx={{ fontWeight: "bold" }}></StyledTableCell>
                <StyledTableCell sx={{ fontWeight: "bold" }}></StyledTableCell>
                <StyledTableCell sx={{ fontWeight: "bold" }}></StyledTableCell>
                <StyledTableCell sx={{ fontWeight: "bold" }}>
                  Requested by:
                </StyledTableCell>
                <StyledTableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                  Approved by:
                </StyledTableCell>
                <StyledTableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                  Issued by:
                </StyledTableCell>
                <StyledTableCell sx={{ fontWeight: "bold" }}>
                  Received by:
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell
                  sx={{
                    height: "22px",
                    paddingLeft: "0px",
                    alignContent: "end",
                  }}
                >
                  Signature :
                </StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
                <StyledTableCell></StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell
                  colSpan={2}
                  sx={{
                    height: "22px",
                    paddingLeft: "0px",
                    alignContent: "end",
                  }}
                >
                  Printed Name :
                </StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell>
                  {reportData?.requestedBy || ""}
                </StyledTableCell>
                <StyledTableCell colSpan={3}>
                  {reportData?.approvedBy || ""}
                </StyledTableCell>
                <StyledTableCell colSpan={3}>
                  {reportData?.issuedBy || ""}
                </StyledTableCell>
                <StyledTableCell>
                  {reportData?.receivedBy || ""}
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell
                  colSpan={2}
                  sx={{
                    height: "22px",
                    paddingLeft: "0px",
                    alignContent: "end",
                  }}
                >
                  Designation :
                </StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
                <StyledTableCell></StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <StyledTableCell
                  colSpan={2}
                  sx={{
                    height: "22px",
                    paddingLeft: "0px",
                    alignContent: "end",
                  }}
                >
                  Date :
                </StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
                <StyledTableCell></StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}
