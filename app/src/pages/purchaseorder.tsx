import * as React from "react";
import { GET_PURCHASEORDERS } from "../graphql/queries/purchaseorder.query";
import { useQuery } from "@apollo/client";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import { PurchaseOrderRow } from "../components/purchaseorderrow";

export default function PurchaseOrder() {
  const { data, loading, error } = useQuery(GET_PURCHASEORDERS);
  console.log(data);
  return (
    <PageContainer title="" breadcrumbs={[]}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error loading purchase orders: {error.message}
        </Alert>
      )}

      {data && data.purchaseorders && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Purchase Order #</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Delivery Date</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.purchaseorders.map((po: any) => (
                <PurchaseOrderRow key={po._id} purchaseOrder={po} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  );
}
