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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { currencyFormat, formatDateString } from "../../utils/generalUtils";
import PreviewIcon from "@mui/icons-material/Preview";
const Row = (props: {
  row: any;
  handleOpenPrintModal: (items: any) => void;
}) => {
  const { row, handleOpenPrintModal } = props;
  const [open, setOpen] = React.useState(false);

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
                    <Table size="small" aria-label="par-details">
                      <TableHead>
                        <TableRow>
                          <TableCell>PAR ID</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell align="right">Actual Received</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Cost</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Tag</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {row.items.map((item: any) => (
                          <TableRow key={item.id}>
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
