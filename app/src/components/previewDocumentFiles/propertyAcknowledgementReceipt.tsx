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
} from "@mui/material";
import { genericPreviewProps } from "../../types/previewPrintDocument/types";
import { Divider } from "@mui/material";
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

export default function PropertyAcknowledgementReceipt({
  signatories,
  reportData,
  onPrint,
  onClose,
}: genericPreviewProps) {
  const componentRef = useRef(null);
  console.log({ PropertyAcknowledgementReceipt: reportData });
  const InspectorOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Inspector Officer"),
  );
  const supplyOffice = useSignatoryStore((state) =>
    state.getSignatoryByRole("Property And Supply Officer"),
  );
  const receivedFrom = useSignatoryStore((state) =>
    state.getSignatoryByRole("Recieved From"),
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
    ? reportData.filter((item) => item !== null && item !== undefined)
    : reportData
      ? [reportData]
      : [];

  // Calculate total amount from all items
  const totalAmount = itemsArray.reduce((sum, item) => {
    return sum + (item?.amount || 0);
  }, 0);
  const totalUnitCost = itemsArray.reduce((sum, item) => {
    return sum + (item?.unitCost || 0);
  }, 0);

  // Format the total amount
  const formatCurrency = (value: any) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);
  const formatTotalAmount = formatCurrency(totalAmount);
  const formatTotalUnitCost = formatCurrency(totalUnitCost);

  // Build a display string of unique PAR IDs from the report data
  const parIdsDisplay = React.useMemo(() => {
    const items = Array.isArray(reportData)
      ? reportData
      : reportData
        ? [reportData]
        : [];
    const ids = Array.from(
      new Set(items.map((it: any) => it?.parId).filter(Boolean)),
    );
    return ids.join(", ");
  }, [reportData]);

  // Pull income/mds/details from item level first, fallback to PO
  const firstPO = itemsArray[0]?.PurchaseOrder || ({} as any);
  const poIncome = itemsArray[0]?.income || firstPO?.income || "";
  const poMds = itemsArray[0]?.mds || firstPO?.mds || "";
  const poDetails = itemsArray[0]?.details || firstPO?.details || "";

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
                <TableCell sx={{ width: "10%" }}></TableCell>
                <TableCell sx={{ width: "10%" }}></TableCell>
                <TableCell sx={{ width: "22%" }}></TableCell>
                <TableCell sx={{ width: "22%" }}></TableCell>
                <TableCell sx={{ width: "18%" }}></TableCell>
                <TableCell sx={{ width: "18%" }}></TableCell>
              </TableRow>
              <TableRow>
                <HeaderTableCell colSpan={6}>
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
                            width: "30%",
                            height: "30%",
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
                        gridTemplateRows: "3em",
                      }}
                    >
                      <Box></Box>
                      <Box
                        sx={{
                          display: "grid",
                          justifyContent: "center",
                          alignItems: "end",
                        }}
                      ></Box>
                      <Box
                        sx={{
                          display: "grid",
                          justifyContent: "start",
                          alignItems: "center",
                          fontWeight: 600,
                        }}
                      >
                        PAR#: {parIdsDisplay}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: "3px",
                        right: "3px",
                        textAlign: "right",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "serif",
                          fontStyle: "italic",
                          fontWeight: "bold",
                          fontSize: "16px",
                        }}
                      >
                        Appendix 71
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "system-ui",
                          fontSize: "12px",
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
                <StyledTableCell colSpan={2} align="center">
                  Description and Property Number
                </StyledTableCell>
                <StyledTableCell align="right">Unit Price</StyledTableCell>
                <StyledTableCell align="right">Total Price</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {itemsArray.length ? (
                <>
                  {itemsArray.map((row: any, index: any) => (
                    <StyledTableRow key={row?.id ?? index}>
                      <StyledTableCell align="left">
                        {row?.actualQuantityReceived ?? ""}
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {row?.unit || ""}
                      </StyledTableCell>
                      <StyledTableCell align="left" colSpan={2}>
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            {row?.description ||
                              row?.PurchaseOrderItem?.description ||
                              ""}
                          </Typography>

                          {/* specification: preserve newlines */}
                          {(row?.PurchaseOrderItem?.specification ||
                            row?.specification) && (
                            <Typography
                              sx={{
                                whiteSpace: "pre-line",
                                fontSize: "12px",
                                color: "text.secondary",
                                mt: 0.5,
                                textAlign: "left",
                              }}
                            >
                              {row?.PurchaseOrderItem?.specification ||
                                row?.specification}
                            </Typography>
                          )}

                          {/* general description: preserve newlines and add small gap */}
                          {(row?.PurchaseOrderItem?.generalDescription ||
                            row?.generalDescription) && (
                            <Typography
                              sx={{
                                whiteSpace: "pre-line",
                                fontSize: "12px",
                                color: "text.secondary",
                                mt: 0.75,
                                textAlign: "left",
                              }}
                            >
                              {row?.PurchaseOrderItem?.generalDescription ||
                                row?.generalDescription}
                            </Typography>
                          )}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {formatCurrency(row?.unitCost)}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {formatCurrency(row?.amount)}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                  {/* Spacer row to push Nothing Follows to bottom */}
                  <StyledTableRow>
                    <StyledTableCell sx={{ height: "100%" }}></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell colSpan={2}></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell
                      colSpan={2}
                      sx={{ textAlign: "center", padding: 0.5 }}
                    >
                      <Typography
                        sx={{ fontSize: "12px", color: "text.secondary" }}
                      >
                        *****Nothing Follows*****
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                    <StyledTableCell></StyledTableCell>
                  </StyledTableRow>
                  {/* Income/MDS/Details below Nothing Follows */}
                  {(poIncome || poMds || poDetails) && (
                    <StyledTableRow>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell
                        colSpan={2}
                        sx={{ textAlign: "left", padding: 0.5 }}
                      >
                        {poIncome && (
                          <Typography fontSize={12}>
                            Income: {poIncome}
                          </Typography>
                        )}
                        {poMds && (
                          <Typography fontSize={12}>MDS: {poMds}</Typography>
                        )}
                        {poDetails && (
                          <Typography fontSize={12}>
                            Details: {poDetails}
                          </Typography>
                        )}
                      </StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                      <StyledTableCell></StyledTableCell>
                    </StyledTableRow>
                  )}
                </>
              ) : (
                <StyledTableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell colSpan={2}></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </StyledTableRow>
              )}

              <StyledTableRow>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell
                  align="right"
                  colSpan={2}
                  sx={{ fontWeight: 600 }}
                >
                  Total
                </StyledTableCell>
                <StyledTableCell align="right">
                  {formatTotalUnitCost}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {formatTotalAmount}
                </StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell colSpan={4} sx={{ verticalAlign: "top" }}>
                  <Typography component="span" sx={{ fontWeight: 600 }}>
                    Remarks:{" "}
                  </Typography>
                  {itemsArray[0]?.remarks && (
                    <Typography component="span" sx={{ fontStyle: "italic" }}>
                      {itemsArray[0].remarks}
                    </Typography>
                  )}
                </StyledTableCell>
                <StyledTableCell colSpan={2} sx={{ verticalAlign: "top" }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          border: "1px solid black",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                        }}
                      >
                        {poIncome ? "✓" : ""}
                      </Box>
                      <Typography sx={{ fontSize: "12px" }}>INCOME</Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          border: "1px solid black",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                        }}
                      >
                        {poMds ? "✓" : ""}
                      </Box>
                      <Typography sx={{ fontSize: "12px" }}>MDS</Typography>
                    </Box>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>

              <StyledTableRow>
                <StyledTableCell
                  colSpan={3}
                  sx={{ padding: "8px 4px", verticalAlign: "top" }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      Received from:
                    </Typography>
                    <Box sx={{ textAlign: "center", px: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontStyle: "italic",
                          textDecoration: "underline",
                          mt: 2,
                          mb: 0.25,
                        }}
                      >
                        {signatories?.recieved_from || ""}
                      </Typography>
                      <Typography sx={{ fontSize: "11px" }}>
                        Signature over Printed Name
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          textDecoration: "underline",
                          mt: 1.5,
                          mb: 0.25,
                        }}
                      >
                        {signatories?.metadata?.recieved_from?.role || ""}
                      </Typography>
                      <Typography sx={{ fontSize: "11px" }}>
                        Position / Office
                      </Typography>
                      <Typography sx={{ mt: 1.5, fontSize: "12px" }}>
                        Date
                      </Typography>
                    </Box>
                  </Box>
                </StyledTableCell>
                <StyledTableCell
                  colSpan={3}
                  sx={{ padding: "8px 4px", verticalAlign: "top" }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      Received by:
                    </Typography>
                    <Box sx={{ textAlign: "center", px: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontStyle: "italic",
                          textDecoration: "underline",
                          mt: 2,
                          mb: 0.25,
                        }}
                      >
                        {capitalizeFirstLetter(signatories?.recieved_by)}
                      </Typography>
                      <Typography sx={{ fontSize: "11px" }}>
                        Signature over Printed Name
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          textDecoration: "underline",
                          mt: 1.5,
                          mb: 0.25,
                        }}
                      >
                        {capitalizeFirstLetter(
                          signatories?.metadata?.recieved_by?.position,
                        )}
                      </Typography>
                      <Typography sx={{ fontSize: "11px" }}>
                        Position / Office
                      </Typography>
                      <Typography sx={{ mt: 1.5, fontSize: "12px" }}>
                        Date
                      </Typography>
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
