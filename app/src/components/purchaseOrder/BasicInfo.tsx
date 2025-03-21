import React from "react";
import { Grid, TextField } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { PurchaseOrderFormData } from "../../types/purchaseOrder";

interface BasicInfoProps {
  formData: PurchaseOrderFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateChange: (date: Date | null, fieldName: string) => void;
}

export const BasicInfo: React.FC<BasicInfoProps> = ({
  formData,
  handleChange,
  handleDateChange,
}) => {
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="PO Number"
          name="ponumber"
          value={formData.ponumber}
          onChange={handleChange}
          disabled={true}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Invoice"
          name="invoice"
          value={formData.invoice}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Supplier"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          disabled={true}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          disabled={true}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Place of Delivery"
          name="placeofdelivery"
          value={formData.placeofdelivery}
          onChange={handleChange}
          disabled={true}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Payment Date"
            value={formData.dateofpayment}
            onChange={(date) => handleDateChange(date, "dateofpayment")}
            disabled={true}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  );
};
