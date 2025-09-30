import * as React from "react";
import {
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
  Toolbar,
  TablePagination,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { currencyFormat, formatDateString } from "../../utils/generalUtils";
import PreviewIcon from "@mui/icons-material/Preview";
import PrintIcon from "@mui/icons-material/Print";
const Row = (props: {
  row: any;
  handleOpenPrintModal: (items: any) => void;
}) => {
  const { row, handleOpenPrintModal } = props;
  const [open, setOpen] = React.useState(false);
  const [idSearch, setIdSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const filteredItems = React.useMemo(() => {
    const term = idSearch.trim().toLowerCase();
    if (!term) return row.items;
    return row.items.filter((item: any) =>
      (item.parId || "").toLowerCase().includes(term)
    );
  }, [row.items, idSearch]);

  const isItemSelected = (id: string) => selectedIds.has(id);
  const toggleItem = (item: any) => {
    if (!item?.parId) return; // only allow selecting items with a PAR ID
    const id = String(item.id);
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const allFilteredSelected = React.useMemo(() => {
    if (!filteredItems.length) return false;
    const selectable = filteredItems.filter((it: any) => !!it.parId);
    if (!selectable.length) return false;
    return selectable.every((it: any) => selectedIds.has(String(it.id)));
  }, [filteredItems, selectedIds]);

  const someFilteredSelected = React.useMemo(() => {
    return filteredItems.some((it: any) => selectedIds.has(String(it.id)));
  }, [filteredItems, selectedIds]);

  const toggleSelectAllFiltered = (checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      filteredItems.forEach((it: any) => {
        if (it.parId) next.add(String(it.id));
      });
    } else {
      filteredItems.forEach((it: any) => next.delete(String(it.id)));
    }
    setSelectedIds(next);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const printSelected = (e: React.MouseEvent) => {
    e.stopPropagation();
    const items = row.items.filter((it: any) => selectedIds.has(String(it.id)));
    if (items.length) handleOpenPrintModal(items);
  };

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.poNumber}
        </TableCell>
        <TableCell>{row.supplier}</TableCell>
        <TableCell>{formatDateString(row.dateOfDelivery)}</TableCell>
        <TableCell>{row.itemCount} items</TableCell>
        <TableCell>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPrintModal(row.items);
            }}
            disabled={!row.items.some((item: any) => item.parId)}
          >
            <PreviewIcon fontSize="medium" />
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <Box sx={{ margin: 1 }}>
                    <Typography variant="h6" gutterBottom component="div">
                      PAR Items Details
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <TextField
                        size="small"
                        label="Search PAR ID"
                        value={idSearch}
                        onChange={(e) => setIdSearch(e.target.value)}
                      />
                      <Button size="small" onClick={clearSelection}>Clear</Button>
                      <Box sx={{ flexGrow: 1 }} />
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PrintIcon fontSize="small" />}
                        onClick={printSelected}
                        disabled={selectedIds.size === 0}
                      >
                        Print Selected
                      </Button>
                    </Box>
                    <Table size="small" aria-label="par-details">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={allFilteredSelected}
                              indeterminate={!allFilteredSelected && someFilteredSelected}
                              onChange={(e) => toggleSelectAllFiltered(e.target.checked)}
                              inputProps={{ 'aria-label': 'select all filtered' }}
                            />
                          </TableCell>
                          <TableCell>PAR ID</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell align="right">Actual Received</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Cost</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Tag</TableCell>
                          <TableCell>Print</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredItems.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected(String(item.id))}
                                onChange={() => toggleItem(item)}
                                disabled={!item.parId}
                              />
                            </TableCell>
                            <TableCell component="th" scope="row">
                              {item.parId || "Not Generated"}
                            </TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell align="right">
                              {item.actualQuantityReceived}
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              {currencyFormat(item.unitCost)}
                            </TableCell>
                            <TableCell align="right">
                              {currencyFormat(item.amount)}
                            </TableCell>
                            <TableCell>
                              {item.category
                                ?.split(" ")
                                .map(
                                  (word: string) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </TableCell>
                            <TableCell>
                              {item.tag
                                ?.split(" ")
                                .map(
                                  (word: string) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ") || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                startIcon={<PrintIcon fontSize="small" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPrintModal([item]);
                                }}
                                disabled={!item.parId}
                              >
                                
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
    </React.Fragment>
  );
};

export { Row };
