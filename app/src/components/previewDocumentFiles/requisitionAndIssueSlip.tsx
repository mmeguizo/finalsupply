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
import { escapeHtml, nl2br } from "../../utils/textHelpers";

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

  console.log("signatories", signatories);

 

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
    ? reportData.filter((item) => item !== null && item !== undefined)
    : reportData
      ? [reportData]
      : [];

  // Calculate total amount from all items
  const totalAmount = itemsArray.reduce((sum, item) => {
    return sum + (item?.amount || 0);
  }, 0);

  // Format the total amount
  const formatTotalAmount = `₱${totalAmount.toFixed(2)}`;

  // Build a display string of unique RIS IDs from the report data
  const risIdsDisplay = React.useMemo(() => {
    const ids = Array.from(
      new Set(itemsArray.map((it: any) => it?.risId).filter(Boolean))
    );
    return ids.join(', ');
  }, [itemsArray]);

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
                <TableCell sx={{ width: "8%" }}></TableCell>
                <TableCell sx={{ width: "8%" }}></TableCell>
                <TableCell sx={{ width: "8%" }}></TableCell>
                <TableCell sx={{ width: "40%" }}></TableCell>
                <TableCell sx={{ width: "12%" }}></TableCell>
                <TableCell sx={{ width: "8%" }}></TableCell>
                <TableCell sx={{ width: "4%" }}></TableCell>
                <TableCell sx={{ width: "4%" }}></TableCell>
                <TableCell sx={{ width: "8%" }}></TableCell>
                <TableCell sx={{ width: "12%" }}></TableCell>
                <TableCell sx={{ width: "20%" }}></TableCell>
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
                          src="/chmsu-logo.png"
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
                        No. {risIdsDisplay}
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
                      <Typography>Office: </Typography>

                      <Box
                        sx={{ borderBottom: "1px solid #000", width: "100%" }}
                      >
                        {" "}
                        &nbsp; &nbsp;{" "}
                        {itemsArray[0]?.PurchaseOrder?.placeOfDelivery || ""}
                      </Box>
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
                      <Typography>RIS No. :</Typography>
                      <Box
                        sx={{ borderBottom: "1px solid #000", width: "100%" }}
                      >
                        {" "}&nbsp; &nbsp;{risIdsDisplay}
                      </Box>
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
                <StyledTableCell align="center" colSpan={2}>
                  Description
                </StyledTableCell>
                <StyledTableCell align="center">Quantity</StyledTableCell>
                <StyledTableCell align="center" colSpan={2}>
                  Yes
                </StyledTableCell>
                <StyledTableCell align="center">No</StyledTableCell>
                <StyledTableCell align="center">Quantity</StyledTableCell>
                <StyledTableCell align="center">Remarks</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {itemsArray?.length > 0 ? (
                itemsArray.map((item: any, index: any) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{item.id || ""}</StyledTableCell>
                    <StyledTableCell>{index + 1 || ""}</StyledTableCell>
                    <StyledTableCell>{item.unit || ""}</StyledTableCell>
                    <StyledTableCell colSpan={2}>
                      <Box>
                        <Typography sx={{ fontWeight: 500 }}>
                          {item.description || item.PurchaseOrderItem?.description || ""}
                        </Typography>

                        {(item.PurchaseOrderItem?.specification || item.specification) && (
                          <Typography
                            component="div"
                            sx={{ fontSize: 12, color: "text.secondary", mt: 0.5, textAlign: "left" }}
                            dangerouslySetInnerHTML={{
                              __html: nl2br(
                                escapeHtml(item.PurchaseOrderItem?.specification || item.specification || "")
                              ),
                            }}
                          />
                        )}

                        {(item.PurchaseOrderItem?.generalDescription || item.generalDescription) && (
                          <Typography
                            component="div"
                            sx={{ fontSize: 12, color: "text.secondary", mt: 0.5, textAlign: "left" }}
                            dangerouslySetInnerHTML={{
                              __html: nl2br(
                                escapeHtml(item.PurchaseOrderItem?.generalDescription || item.generalDescription || "")
                              ),
                            }}
                          />
                        )}
                      </Box>
                    </StyledTableCell>
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
                <StyledTableCell align="right">
                  {formatTotalAmount}
                </StyledTableCell>
              </StyledTableRow>
            </TableBody>

            <TableBody>
              <StyledTableRow>
                <StyledTableCell colSpan={2}>Purpose:</StyledTableCell>
                <StyledTableCell colSpan={9}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Typography>________________________________</Typography>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell colSpan={2}></StyledTableCell>
                <StyledTableCell>Requested by:</StyledTableCell>
                <StyledTableCell colSpan={2}>Approved by:</StyledTableCell>
                <StyledTableCell colSpan={3}>Issued by:</StyledTableCell>
                <StyledTableCell colSpan={3}>Received by:</StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell>Signature :</StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell colSpan={2}></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell colSpan={2}>Printed Name :</StyledTableCell>
                <StyledTableCell>
                  <Typography>
                    {capitalizeFirstLetter(signatories?.requested_by || "")}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell colSpan={2}>
                  <Typography>
                    {capitalizeFirstLetter(signatories?.approved_by || "")}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell colSpan={3}>
                  <Typography>
                    {capitalizeFirstLetter(signatories?.issued_by || "")}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell colSpan={3}>
                  <Typography>
                    {capitalizeFirstLetter(signatories?.recieved_by || "")}
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell>Designation :</StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell>End User </StyledTableCell>
                <StyledTableCell colSpan={2}>AO V / Supply Officer</StyledTableCell>
                <StyledTableCell colSpan={3}>Supply Officer Staff</StyledTableCell>
                <StyledTableCell colSpan={3}>End User</StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell>Date :</StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell colSpan={2}></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
                <StyledTableCell colSpan={3}></StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}
