import * as React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  TextField,
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PrintIcon from '@mui/icons-material/Print';
import { currencyFormat, formatDateString } from '../../utils/generalUtils';

/**
 * NoCategoryRow
 * -------------
 * Expandable row for the No Category issuance page.
 * Follows the same pattern as the ICS tableRow.tsx but simplified:
 *
 * - Each row = one PO group (poNumber, supplier, delivery date, item count)
 * - Expanding reveals individual items
 * - Items with actualQuantityReceived === 0 are hidden (fully assigned/split)
 * - NC ID chip: green "NC-YYYY-NNNN" if assigned, yellow "Click to Assign" if not
 * - Clicking the chip triggers onAssign callback which opens the NcAssignmentModal
 */
const NoCategoryRow = (props: {
  row: any;
  handleOpenAssignmentModal: (item: any) => void;
  handleOpenPrintModal: (item: any) => void;
}) => {
  const { row, handleOpenAssignmentModal, handleOpenPrintModal } = props;
  const [open, setOpen] = React.useState(false);
  const [idSearch, setIdSearch] = React.useState('');

  // Filter items: hide fully-assigned (actualQuantityReceived === 0 AND no ncId),
  // and optionally filter by NC ID search
  const filteredItems = React.useMemo(() => {
    let items = row.items.filter(
      (item: any) => (item.actualQuantityReceived ?? 0) > 0 || item.ncId
    );
    const term = idSearch.trim().toLowerCase();
    if (term) {
      items = items.filter((item: any) => (item.ncId || '').toLowerCase().includes(term));
    }
    return items;
  }, [row.items, idSearch]);

  // Count items that still need NC assignment
  const unassignedCount = React.useMemo(() => {
    return row.items.filter((item: any) => !item.ncId && (item.actualQuantityReceived ?? 0) > 0)
      .length;
  }, [row.items]);

  return (
    <React.Fragment>
      {/* PO group header row */}
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.poNumber}
        </TableCell>
        <TableCell>{row.supplier}</TableCell>
        <TableCell>{formatDateString(row.dateOfDelivery)}</TableCell>
        <TableCell>
          {row.itemCount} items
          {unassignedCount > 0 && (
            <Chip
              size="small"
              label={`${unassignedCount} unassigned`}
              color="warning"
              sx={{ ml: 1 }}
            />
          )}
        </TableCell>
      </TableRow>

      {/* Expandable details row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                No Category Items
                {unassignedCount > 0 && (
                  <Chip
                    size="small"
                    label={`${unassignedCount} need NC assignment`}
                    color="warning"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>

              {/* Search bar for NC IDs */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <TextField
                  size="small"
                  label="Search NC ID"
                  value={idSearch}
                  onChange={(e) => setIdSearch(e.target.value)}
                />
              </Box>

              {/* Items detail table */}
              <Table size="small" aria-label="nc-items-details">
                <TableHead>
                  <TableRow>
                    <TableCell>NC ID / Assign</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="right">Actual Received</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Print</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No items to display.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Chip
                            label={item.ncId || 'Click to Assign'}
                            size="small"
                            color={item.ncId ? 'success' : 'warning'}
                            variant={item.ncId ? 'filled' : 'outlined'}
                            clickable
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAssignmentModal(item);
                            }}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: item.ncId ? 'bold' : 'normal',
                            }}
                          />
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="right">{item.actualQuantityReceived}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{currencyFormat(item.unitCost)}</TableCell>
                        <TableCell align="right">{currencyFormat(item.amount)}</TableCell>
                        <TableCell align="center">
                          {item.ncId ? (
                            <Tooltip title="Print NC Report">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPrintModal(item);
                                }}
                              >
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.disabled" fontSize={12}>
                              —
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export { NoCategoryRow };
