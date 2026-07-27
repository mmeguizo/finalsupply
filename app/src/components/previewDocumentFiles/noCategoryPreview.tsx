import React from 'react';
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
} from '@mui/material';
import { Divider } from '@mui/material';
import { capitalizeFirstLetter, formatCurrencyPHP } from '../../utils/generalUtils';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: '1px solid black',
  padding: '4px',
  fontSize: '12px',
  fontWeight: 'normal',
}));

const StyledTableCellHeader = styled(StyledTableCell)(({ theme }) => ({
  whiteSpace: 'nowrap',
  textAlign: 'left',
  padding: '0px 6px',
}));

const StyledTableRow = styled(TableRow)({
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

const HeaderTableCell = styled(StyledTableCell)({
  padding: 0,
});

const BodyTableCell = styled(TableCell)(({ theme }) => ({
  borderLeft: '1px solid black',
  borderRight: '1px solid black',
  padding: '4px',
  fontSize: '12px',
  fontWeight: 'normal',
}));

/**
 * NoCategoryPreview
 * -----------------
 * Preview component for NC (No Category) issuance items.
 * Uses the same Appendix 62 IAR form layout but displays `ncId` instead of `iarId`.
 *
 * Flow:
 * 1. Receives `reportData` (single item or array) and `signatories`.
 * 2. Normalizes to an array and extracts PO info from the first item.
 * 3. Renders the standard IAR form: header → supplier/PO/invoice row →
 *    item table → total → signatory footer.
 * 4. The NC ID (e.g., "NC-2026-0001") is shown where the IAR ID normally appears.
 */
export default function NoCategoryPreview({
  signatories,
  reportData,
}: {
  signatories: any;
  reportData: any;
}) {
  // Normalize reportData to an array
  const items: any[] = Array.isArray(reportData) ? reportData : reportData ? [reportData] : [];

  // PO info from the first item
  const purchaseOrder = items[0]?.PurchaseOrder || null;
  const invoiceText = (items[0]?.invoice ?? purchaseOrder?.invoice ?? '') as string;
  const dateOfPaymentText = (items[0]?.invoiceDate ?? purchaseOrder?.dateOfPayment ?? '') as string;

  // Total amount: qty × unit cost for each item
  const totalAmount = formatCurrencyPHP(
    items.reduce(
      (sum, it) => sum + Number(it?.actualQuantityReceived ?? 0) * Number(it?.unitCost ?? 0),
      0
    )
  );

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid black' }}>
        <Table sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <TableHead>
            {/* Sizing row — sets column widths */}
            <TableRow sx={{ visibility: 'collapse', height: 0 }}>
              <TableCell sx={{ width: '7%' }}></TableCell>
              <TableCell sx={{ width: '7%' }}></TableCell>
              <TableCell sx={{ width: '18%' }}></TableCell>
              <TableCell sx={{ width: '18%' }}></TableCell>
              <TableCell sx={{ width: '16%' }}></TableCell>
              <TableCell sx={{ width: '11%' }}></TableCell>
              <TableCell sx={{ width: '11%' }}></TableCell>
              <TableCell sx={{ width: '12%' }}></TableCell>
            </TableRow>

            {/* Header: logo + university name + report title */}
            <TableRow>
              <HeaderTableCell colSpan={8}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '4px 0px',
                    position: 'relative',
                    gap: '0.5em',
                  }}
                >
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: 'grid',
                      gridTemplateColumns: '2fr 4fr 2fr',
                      gridTemplateRows: '90px',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box>
                      <Box
                        component="img"
                        src="/chmsu-logo.png"
                        alt="CHMSU Logo"
                        sx={{
                          width: '40%',
                          height: '40%',
                          marginTop: '10%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'grid', placeItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 'normal' }}>
                        REPUBLIC OF THE PHILIPPINES
                      </Typography>
                      <Typography variant="h5" sx={{ fontSize: '16px', fontWeight: 600 }}>
                        CARLOS HILADO MEMORIAL STATE UNIVERSITY
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 'normal' }}>
                        INSPECTION & ACCEPTANCE REPORT
                      </Typography>
                    </Box>
                    <Box></Box>
                  </Box>

                  {/* NC ID + Page number row */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: 'grid',
                      gridTemplateColumns: '2fr 4fr 2fr',
                      gridTemplateRows: '2.5em',
                    }}
                  >
                    <Box></Box>
                    <Box sx={{ display: 'grid', justifyContent: 'center', alignItems: 'end' }}>
                      No. {items[0]?.ncId ?? ''}
                    </Box>
                    <Box sx={{ display: 'grid', justifyContent: 'end', alignItems: 'start' }}>
                      Page 1 of 1
                    </Box>
                  </Box>

                  {/* Appendix label */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '3px',
                      right: '0px',
                      fontFamily: 'serif',
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                      fontSize: '16px',
                    }}
                  >
                    Appendix 62
                  </Box>
                </Box>
              </HeaderTableCell>
            </TableRow>

            {/* Supplier row */}
            <TableRow>
              <StyledTableCellHeader colSpan={2}>Supplier:</StyledTableCellHeader>
              <StyledTableCellHeader colSpan={6}>
                {purchaseOrder?.supplier || ''}
              </StyledTableCellHeader>
            </TableRow>

            {/* PO # & Date + Invoice row */}
            <TableRow>
              <StyledTableCellHeader colSpan={2}>PO # & Date:</StyledTableCellHeader>
              <StyledTableCellHeader>{purchaseOrder?.poNumber || ''}</StyledTableCellHeader>
              <StyledTableCellHeader>{purchaseOrder?.dateOfDelivery || ''}</StyledTableCellHeader>
              <StyledTableCellHeader>Invoice# & Date:</StyledTableCellHeader>
              <StyledTableCellHeader colSpan={2}>{invoiceText}</StyledTableCellHeader>
              <StyledTableCellHeader>{dateOfPaymentText}</StyledTableCellHeader>
            </TableRow>

            {/* Requisitioning Office */}
            <TableRow>
              <StyledTableCellHeader colSpan={3}>
                Requisitioning Office/Department:
              </StyledTableCellHeader>
              <StyledTableCellHeader colSpan={5}>
                {purchaseOrder?.placeOfDelivery || ''}
              </StyledTableCellHeader>
            </TableRow>

            {/* Column headings */}
            <TableRow sx={{ '& th': { padding: '1px 0px' } }}>
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
            {items.length ? (
              <>
                {items.map((rd, idx) => (
                  <StyledTableRow key={rd.id ?? idx}>
                    <BodyTableCell>{idx + 1}</BodyTableCell>
                    <BodyTableCell>{rd.unit || ''}</BodyTableCell>
                    <BodyTableCell
                      colSpan={3}
                      sx={{ textAlign: 'left', verticalAlign: 'top', padding: '6px' }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                          {rd.description || rd.PurchaseOrderItem?.description || ''}
                        </Typography>
                        {rd.PurchaseOrderItem?.specification ? (
                          <Typography
                            sx={{
                              whiteSpace: 'pre-line',
                              fontSize: '12px',
                              color: 'text.secondary',
                              mb: 0.5,
                              textAlign: 'left',
                            }}
                          >
                            {rd.PurchaseOrderItem.specification}
                          </Typography>
                        ) : null}
                        {rd.PurchaseOrderItem?.generalDescription ? (
                          <Typography
                            sx={{
                              whiteSpace: 'pre-line',
                              fontSize: '12px',
                              color: 'text.secondary',
                              textAlign: 'left',
                            }}
                          >
                            {rd.PurchaseOrderItem.generalDescription}
                          </Typography>
                        ) : null}
                      </Box>
                    </BodyTableCell>
                    <BodyTableCell sx={{ textAlign: 'right' }}>
                      {rd.actualQuantityReceived ?? ''}
                    </BodyTableCell>
                    <BodyTableCell sx={{ textAlign: 'right' }}>
                      {formatCurrencyPHP(rd.unitCost) ?? ''}
                    </BodyTableCell>
                    <BodyTableCell sx={{ textAlign: 'right' }}>
                      {formatCurrencyPHP((rd.actualQuantityReceived ?? 0) * (rd.unitCost ?? 0)) ??
                        0}
                    </BodyTableCell>
                  </StyledTableRow>
                ))}

                {/* Nothing Follows */}
                <StyledTableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell colSpan={3} sx={{ textAlign: 'center', padding: 0.5 }}>
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                      *****Nothing Follows*****
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </StyledTableRow>

                {/* Income / MDS / Details */}
                <StyledTableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell colSpan={3} sx={{ textAlign: 'left', padding: 0.5 }}>
                    {items[0]?.income && (
                      <Typography fontSize={12}>
                        Income: <span>{capitalizeFirstLetter(items[0].income)}</span>
                      </Typography>
                    )}
                    {items[0]?.mds && (
                      <Typography fontSize={12}>
                        MDS: <span>{capitalizeFirstLetter(items[0].mds)}</span>
                      </Typography>
                    )}
                    {items[0]?.details && (
                      <Typography fontSize={12}>
                        Details: <span>{capitalizeFirstLetter(items[0].details)}</span>
                      </Typography>
                    )}
                  </StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </StyledTableRow>
              </>
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

            {/* Total row */}
            <StyledTableRow>
              <StyledTableCell></StyledTableCell>
              <StyledTableCell></StyledTableCell>
              <StyledTableCell colSpan={4}></StyledTableCell>
              <StyledTableCell>Total</StyledTableCell>
              <StyledTableCell>{totalAmount || ''}</StyledTableCell>
            </StyledTableRow>

            {/* Signatory footer */}
            <StyledTableRow>
              {/* LEFT: Inspection Officer */}
              <StyledTableCell colSpan={4} sx={{ padding: '20px 0px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', padding: '2px' }}>
                  <Box>Date Inspected: _____</Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '20px 35px',
                      gap: '20px',
                      alignItems: 'flex-start',
                      height: '150px',
                      marginTop: '5px',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        width: '100%',
                        gap: '4px',
                      }}
                    >
                      <Box sx={{ width: '50px', height: '50px', border: '1px dotted black' }} />
                      <Typography>
                        Inspected, verified and found OK as to quantity and specification
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      marginTop: '10px',
                      width: '75%',
                      textAlign: 'center',
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    {capitalizeFirstLetter(signatories?.inspection_officer || '')}
                    <Divider sx={{ width: '100%', margin: '5px 0' }} />
                    Printed Name & Signature of Inspection Officer
                  </Box>
                </Box>
              </StyledTableCell>

              {/* RIGHT: Property and Supply Management Officer */}
              <StyledTableCell colSpan={4} sx={{ padding: '20px 0px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', padding: '2px' }}>
                  <Box>Date Received: _____</Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '20px 35px',
                      gap: '20px',
                      alignItems: 'flex-start',
                      height: '150px',
                      marginTop: '5px',
                    }}
                  >
                    {/* Complete checkbox */}
                    <Box sx={{ display: 'flex', width: '100%', gap: '4px' }}>
                      <Box
                        sx={{
                          width: '40px',
                          aspectRatio: '3/2',
                          border: '1px dotted black',
                          backgroundColor: items.every((i) => i.iarStatus === 'complete')
                            ? '#ccc'
                            : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }}
                      >
                        {items.every((i) => i.iarStatus === 'complete') ? '✓' : ''}
                      </Box>
                      <Typography sx={{ width: '65px' }}>Complete</Typography>
                    </Box>
                    {/* Partial checkbox */}
                    <Box sx={{ display: 'flex', width: '100%', gap: '4px' }}>
                      <Box
                        sx={{
                          width: '40px',
                          aspectRatio: '3/2',
                          border: '1px dotted black',
                          backgroundColor: items.some((i) => i.iarStatus === 'partial')
                            ? '#ccc'
                            : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }}
                      >
                        {items.some((i) => i.iarStatus === 'partial') ? '✓' : ''}
                      </Box>
                      <Typography sx={{ width: '65px' }}>Partial</Typography>
                    </Box>
                  </Box>
                  {/* Supply Officer */}
                  <Box
                    sx={{
                      marginTop: '10px',
                      width: '75%',
                      textAlign: 'center',
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    {capitalizeFirstLetter(signatories?.recieved_from || '')}
                    <Divider sx={{ width: '100%', margin: '5px 0' }} />
                    Supply Officer III
                  </Box>
                  {/* End User */}
                  <Box
                    sx={{
                      marginTop: '20px',
                      width: '75%',
                      textAlign: 'center',
                      margin: '20px auto 0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    {capitalizeFirstLetter(signatories?.recieved_by || '')}
                    <Divider sx={{ width: '100%', margin: '5px 0' }} />
                    Printed name & Signature of End-User
                  </Box>
                </Box>
              </StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
