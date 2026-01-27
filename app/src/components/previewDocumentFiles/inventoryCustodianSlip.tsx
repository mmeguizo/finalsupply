import React, { useRef, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, styled, capitalize } from "@mui/material";
import { genericPreviewProps } from "../../types/previewPrintDocument/types";
import { Divider } from "@mui/material";
import { escapeHtml, nl2br } from "../../utils/textHelpers";
import { capitalizeFirstLetter } from "../../utils/generalUtils";
import { teal } from "@mui/material/colors";

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

export default function InventoryCustodianSlip({ signatories, reportData, onPrint, onClose }: genericPreviewProps) {
  const componentRef = useRef(null);
  // const { inspectionOfficer , supplyOfficer, receivedFrom } = signatories
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
  const itemsArray = Array.isArray(reportData) ? reportData.filter((item) => item !== null && item !== undefined) : reportData ? [reportData] : [];

  // Calculate total amount from all items
  const totalAmount = itemsArray.reduce((sum, item) => {
    return sum + (item?.amount || 0);
  }, 0);

  // Format the total amount
  const formatTotalAmount = `₱${totalAmount.toFixed(2)}`;

  // Build a display string of unique ICS IDs
  const icsIdsDisplay = React.useMemo(() => {
    const ids = Array.from(new Set(itemsArray.map((it: any) => it?.icsId).filter(Boolean)));
    return ids.join(", ");
  }, [itemsArray]);

  console.log({ Signatories : signatories, reportData, itemsArray, icsIdsDisplay });

  return (
    <>
      <PrintControls sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        {/* <Button onClick={onClose} variant="outlined">Back</Button> */}
        {/* <Button onClick={handlePrint} variant="contained">Print Report</Button>  */}
      </PrintControls>

      <Box id="printable-report" ref={componentRef}>
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid black" }}>
          <Table sx={{ width: "100%", borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow sx={{ visibility: "collapse", height: 0 }}>
                <TableCell sx={{ width: "6%" }}></TableCell>
                <TableCell sx={{ width: "6%" }}></TableCell>
                <TableCell sx={{ width: "10%" }}></TableCell>
                <TableCell sx={{ width: "10%" }}></TableCell>
                <TableCell sx={{ width: "10%" }}></TableCell>
                <TableCell sx={{ width: "15%" }}></TableCell>
                <TableCell sx={{ width: "20%" }}></TableCell>
              </TableRow>
              <TableRow>
                <HeaderTableCell colSpan={7}>
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
                        gridTemplateColumns: "1fr 1.75fr 1fr",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Box sx={{ display: "grid", placeItems: "center" }}>
                        <Box
                          component="img"
                          src="/chmsu-logo.png"
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
                          padding: "1rem 0px 3rem 0px",
                        }}
                      >
                        <Typography sx={{ fontSize: "14px", fontWeight: "normal", textTransform: "uppercase" }}>Republic of the Philippines</Typography>
                        <Typography sx={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase" }}>Carlos Hilado Memorial State University</Typography>
                        <Typography sx={{ fontSize: "16px", fontWeight: "900", textTransform: "uppercase" }}>Inventory Custodian Slip</Typography>
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
                            sx={{
                              fontFamily: "serif",
                              fontStyle: "italic",
                              fontWeight: "bold",
                              fontSize: "14px",
                            }}
                          >
                            Appendix 59
                          </Typography>
                          <Typography
                            sx={{
                              textAlign: "center",
                              fontSize: "12px",
                            }}
                          >
                            page 1/1
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
                          <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>ICS No: </Typography>
                          <Box sx={{ borderBottom: "1px solid #000" }}>{icsIdsDisplay}</Box>
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "flex-start",
                        padding: "0px",
                        marginTop: "0.5rem",
                      }}
                    >
                      <Typography sx={{ fontSize: "14px" }}>Entity Name: Carlos Hilado Memorial State University</Typography>
                      <Typography sx={{ fontSize: "14px" }}>Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Typography>
                    </Box>
                  </Box>
                </HeaderTableCell>
              </TableRow>

              <TableRow>
                <StyledTableCell rowSpan={2}>Quantity</StyledTableCell>
                <StyledTableCell rowSpan={2}>Unit</StyledTableCell>
                <StyledTableCell colSpan={3} align="center">
                  Amount
                </StyledTableCell>
                <StyledTableCell rowSpan={2} colSpan={2}>
                  Description
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell>Unit Cost</StyledTableCell>
                <StyledTableCell>Total Cost</StyledTableCell>
                <StyledTableCell>Amount</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {itemsArray && itemsArray.length > 0 ? (
                <>
                  {itemsArray.map((item, index) => (
                    <StyledTableRow key={item?.id || index}>
                      <StyledTableCell align="center">{item?.actualQuantityReceived || ""}</StyledTableCell>
                      <StyledTableCell align="center">
                        {item?.unit || ""}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {item?.unitCost ? `₱${Number(item.unitCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {item?.actualQuantityReceived && item?.unitCost ? `₱${(Number(item.actualQuantityReceived) * Number(item.unitCost)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {item?.amount ? `₱${Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}
                      </StyledTableCell>
                      <StyledTableCell colSpan={2} align="left">
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>{item?.description || item?.PurchaseOrderItem?.description || ""}</Typography>

                          {/* specification (escaped + newline -> <br/>) */}
                          {(item?.PurchaseOrderItem?.specification || item?.specification) && (
                            <Typography
                              component="div"
                              sx={{ fontSize: 12, color: "text.secondary", mt: 0.5, textAlign: "left" }}
                              dangerouslySetInnerHTML={{
                                __html: nl2br(escapeHtml(item?.PurchaseOrderItem?.specification || item?.specification || "")),
                              }}
                            />
                          )}

                          {/* general description (escaped + newline -> <br/>) */}
                          {(item?.PurchaseOrderItem?.generalDescription || item?.generalDescription) && (
                            <Typography
                              component="div"
                              sx={{ fontSize: 12, color: "text.secondary", mt: 0.5, textAlign: "left" }}
                              dangerouslySetInnerHTML={{
                                __html: nl2br(escapeHtml(item?.PurchaseOrderItem?.generalDescription || item?.generalDescription || "")),
                              }}
                            />
                          )}
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                  <StyledTableRow>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell sx={{ fontWeight: 600, textAlign: "right" }}>Total</StyledTableCell>
                    <StyledTableCell align="right" sx={{ fontWeight: 600 }}>
                      ₱{itemsArray.reduce((sum, item) => sum + (Number(item?.unitCost) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </StyledTableCell>
                    <StyledTableCell align="right" sx={{ fontWeight: 600 }}>
                      ₱{itemsArray.reduce((sum, item) => sum + ((Number(item?.actualQuantityReceived) || 0) * (Number(item?.unitCost) || 0)), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </StyledTableCell>
                    <StyledTableCell align="right" sx={{ fontWeight: 600 }}>
                      ₱{itemsArray.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </StyledTableCell>
                    <StyledTableCell colSpan={2}></StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell colSpan={2} sx={{ textAlign: "center", padding: 0.5 }}>
                      <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>*****Nothing Follows*****</Typography>
                    </StyledTableCell>
                  </StyledTableRow>

                  <StyledTableRow>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell colSpan={2} sx={{ textAlign: "left", padding: 0.5 }}>
                      {itemsArray[0]?.PurchaseOrder?.income && (
                        <Typography fontSize={12}>
                          Income: <span>{itemsArray[0].PurchaseOrder.income}</span>
                        </Typography>
                      )}
                      {itemsArray[0]?.PurchaseOrder?.mds && (
                        <Typography fontSize={12}>
                          MDS: <span>{itemsArray[0].PurchaseOrder.mds}</span>
                        </Typography>
                      )}
                      {itemsArray[0]?.PurchaseOrder?.details && (
                        <Typography fontSize={12}>
                          Details: <span>{itemsArray[0].PurchaseOrder.details}</span>
                        </Typography>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                </>
              ) : (
                <StyledTableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell colSpan={2}></StyledTableCell>
                </StyledTableRow>
              )}
              {/* Move this TableRow inside TableBody */}
              <TableRow>
                <StyledTableCell colSpan={4} sx={{ padding: "20px 0px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px",
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
                        textAlign: "center",
                      }}
                    >
                      <span>{capitalizeFirstLetter(signatories?.recieved_from || "") }</span>
                      <Divider sx={{ width: "100%", margin: "5px 0" }} />
                      <Typography sx={{ fontWeight: 600 }}> {capitalizeFirstLetter(signatories?.metadata?.recieved_from?.role || signatories?.metadata?.recieved_from?.position || "")} </Typography>
                      {/* <Typography sx={{ fontWeight: 600 }}>{itemsArray[0]?.PurchaseOrder?.supplier || ""}</Typography> */}
                      <Divider sx={{ width: "100%", margin: "5px 0" }} />
                    </Box>
                    <Box
                      sx={{
                        textAlign: "center",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                    >
                      <Typography>Signature over Printed Name</Typography>
                      <Typography>Position/Office</Typography>
                      <Typography>Date:________________</Typography>
                    </Box>
                  </Box>
                </StyledTableCell>
                <StyledTableCell colSpan={2} sx={{ padding: "20px 0px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "2px",
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
                        textAlign: "center",
                      }}
                    >
                      <span>{capitalizeFirstLetter(signatories?.recieved_by || "")}</span>
                      <Divider sx={{ width: "100%", margin: "5px 0" }} />
                      <Typography sx={{ fontWeight: 600 }}> {capitalizeFirstLetter(signatories?.metadata?.recieved_by?.role || signatories?.metadata?.recieved_by?.position ||  "")} </Typography>
                      <Divider sx={{ width: "100%", margin: "5px 0" }} />
                    </Box>
                    <Box
                      sx={{
                        textAlign: "center",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                    >
                      <Typography>Signature over Printed Name</Typography>
                      <Typography>Position/Office</Typography>
                      <Typography>Date:________________</Typography>
                    </Box>
                  </Box>
                </StyledTableCell>
              </TableRow>
            </TableBody>

            {/* Create a TableFooter for the note */}
            <tfoot>
              <TableRow>
              </TableRow>
            </tfoot>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}

/*

 <Typography>Date: {itemsArray[0]?.PurchaseOrder?.dateOfPayment || ""}</Typography>
 <Typography>Date: {itemsArray[0]?.PurchaseOrder?.dateOfDelivery || ""}</Typography>
 */
