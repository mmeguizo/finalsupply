import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Stack,
  Paper,
  LinearProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BusinessIcon from "@mui/icons-material/Business";
import PlaceIcon from "@mui/icons-material/Place";
import CategoryIcon from "@mui/icons-material/Category";
import { currencyFormat, formatCategory } from "../utils/generalUtils";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
interface PurchaseOrderOverviewProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder: any;
}

interface InfoRowProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
      {icon && (
        <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
      )}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 140, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
        {value || "—"}
      </Typography>
    </Stack>
  );
}

export default function PurchaseOrderOverview({
  open,
  onClose,
  purchaseOrder,
}: PurchaseOrderOverviewProps) {
  if (!purchaseOrder) return null;

  const po = purchaseOrder;
  const items = po.items || [];
  const activeItems = items.filter((i: any) => !i.isDeleted);

  // Calculate summary stats
  const totalItems = activeItems.length;
  const totalQuantity = activeItems.reduce(
    (sum: number, i: any) => sum + Number(i.quantity ?? 0),
    0,
  );
  const totalReceived = activeItems.reduce(
    (sum: number, i: any) => sum + Number(i.actualQuantityReceived ?? 0),
    0,
  );
  const deliveryProgress =
    totalQuantity > 0 ? (totalReceived / totalQuantity) * 100 : 0;

  const deliveredCount = activeItems.filter(
    (i: any) => i.deliveryStatus === "delivered",
  ).length;
  const pendingCount = activeItems.filter(
    (i: any) => !i.deliveryStatus || i.deliveryStatus === "pending",
  ).length;
  const partialCount = activeItems.filter(
    (i: any) => i.deliveryStatus === "partial",
  ).length;
  const completeCount = activeItems.filter(
    (i: any) =>
      Number(i.quantity ?? 0) > 0 &&
      Number(i.actualQuantityReceived ?? 0) >= Number(i.quantity ?? 0),
  ).length;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  activeItems.forEach((i: any) => {
    const cat = i.category || "Uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const statusColor =
    po.status === "completed"
      ? "success"
      : deliveryProgress >= 50
        ? "warning"
        : "default";
  const statusLabel =
    po.status === "completed"
      ? "Completed"
      : po.status
        ? po.status.charAt(0).toUpperCase() + po.status.slice(1)
        : "Pending";

  const formatDate = (val: string) => {
    if (!val) return "—";
    const d = new Date(val);
    return isNaN(d.getTime())
      ? val
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 520 },
          p: 0,
          display: "flex",
          flexDirection: "column",
          top: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, color: "white" }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          PO #{po.poNumber}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          {po.supplier}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip
            label={statusLabel}
            color={statusColor as any}
            size="small"
            variant="filled"
            sx={{ color: "white", fontWeight: 600 }}
          />
          {po.campus && (
            <Chip
              label={po.campus}
              size="small"
              variant="outlined"
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.5)" }}
            />
          )}
        </Stack>
      </Box>

      <Box sx={{ p: 2, overflowY: "auto", flex: 1, minHeight: 0 }}>
        {/* Quick Stats */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Paper
              variant="outlined"
              sx={{ p: 1.5, textAlign: "center", borderRadius: 2 }}
            >
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700} color="primary">
                {currencyFormat(po.amount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Amount
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              variant="outlined"
              sx={{ p: 1.5, textAlign: "center", borderRadius: 2 }}
            >
              <InventoryIcon color="secondary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700} color="secondary">
                {totalItems}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Items
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Delivery Progress */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Delivery Progress
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={deliveryProgress}
              sx={{
                flex: 1,
                height: 10,
                borderRadius: 5,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  background:
                    deliveryProgress === 100
                      ? "linear-gradient(90deg, #2e7d32, #4caf50)"
                      : "linear-gradient(90deg, #1976d2, #42a5f5)",
                },
              }}
            />
            <Typography variant="body2" fontWeight={600}>
              {Math.round(deliveryProgress)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {totalReceived} of {totalQuantity} units received
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
              label={`${completeCount} Complete`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<LocalShippingIcon sx={{ fontSize: 14 }} />}
              label={`${deliveredCount} Delivered`}
              size="small"
              color="info"
              variant="outlined"
            />
            {partialCount > 0 && (
              <Chip
                icon={<PendingIcon sx={{ fontSize: 14 }} />}
                label={`${partialCount} Partial`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
            <Chip
              icon={<PendingIcon sx={{ fontSize: 14 }} />}
              label={`${pendingCount} Pending`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Paper>

        {/* PO Details */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Purchase Order Details
          </Typography>
          <InfoRow
            icon={<BusinessIcon sx={{ fontSize: 18 }} />}
            label="Supplier"
            value={po.supplier}
          />
          <InfoRow
            icon={<PlaceIcon sx={{ fontSize: 18 }} />}
            label="Place of Delivery"
            value={po.placeOfDelivery}
          />
          <InfoRow
            icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
            label="P.O. Date"
            value={formatDate(po.dateOfPayment)}
          />
          <InfoRow
            icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
            label="Delivery Date"
            value={formatDate(po.dateOfDelivery)}
          />
          <InfoRow
            icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
            label="Conformity Date"
            value={formatDate(po.dateOfConformity)}
          />
          <InfoRow
            icon={<ReceiptLongIcon sx={{ fontSize: 18 }} />}
            label="Invoice"
            value={po.invoice}
          />
          <InfoRow label="Delivery Terms" value={po.deliveryTerms} />
          <InfoRow label="Payment Terms" value={po.paymentTerms} />
          <InfoRow label="Mode of Procurement" value={po.modeOfProcurement} />
          <InfoRow label="Fund Source" value={po.fundsource} />
          {po.income && <InfoRow label="Income" value={po.income} />}
          {po.mds && <InfoRow label="MDS" value={po.mds} />}
          {po.details && <InfoRow label="Details" value={po.details} />}
          <InfoRow label="Address" value={po.address} />
          {po.email && <InfoRow label="Email" value={po.email} />}
          {po.telephone && <InfoRow label="Telephone" value={po.telephone} />}
          {po.tin && <InfoRow label="TIN" value={po.tin} />}
        </Paper>

        {/* Category Breakdown */}
        {Object.keys(categoryMap).length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              <CategoryIcon
                sx={{ fontSize: 18, verticalAlign: "middle", mr: 0.5 }}
              />
              Category Breakdown
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {Object.entries(categoryMap).map(([cat, count]) => (
                <Chip
                  key={cat}
                  label={`${formatCategory(cat) || cat}: ${count}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Stack>
          </Paper>
        )}

        {/* Items Summary Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box
            sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Items ({totalItems})
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 40 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>
                    Qty
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>
                    Recv
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeItems.map((item: any, idx: number) => {
                  const qty = Number(item.quantity ?? 0);
                  const recv = Number(item.actualQuantityReceived ?? 0);
                  const isComplete = qty > 0 && recv >= qty;
                  const status = item.deliveryStatus || "pending";
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={item.description || item.itemName || "—"}
                        >
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 150 }}
                          >
                            {item.itemName || item.description || "—"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {isComplete ? (
                          <CheckCircleIcon
                            color="success"
                            sx={{ fontSize: 18 }}
                          />
                        ) : status === "delivered" ? (
                          <LocalShippingIcon
                            color="info"
                            sx={{ fontSize: 18 }}
                          />
                        ) : (
                          <PendingIcon
                            sx={{ fontSize: 18, color: "text.disabled" }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">{qty}</TableCell>
                      <TableCell align="right">{recv}</TableCell>
                      <TableCell align="right">
                        {currencyFormat(item.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {activeItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No items
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Drawer>
  );
}
