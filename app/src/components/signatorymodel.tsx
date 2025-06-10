import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
  Box,
  Typography,
} from "@mui/material";
import { useQuery } from "@apollo/client";
//@ts-ignore
import { GET_PURCHASEORDERS } from "../graphql/queries/purchaseorder.query";

interface SignatoryModalProps {
 open: boolean;
 onClose: () => void;
 onSave: (formData: any) => void;
 signatory: any | null;
}
const ROLE_OPTIONS = [
  "Inspector Officer",
  "Property And Supply Officer",
  "Recieved From",
  "Recieved By",
];

const SignatoryModal = ({ open, onClose, onSave, signatory }: SignatoryModalProps) => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    purchaseOrderId: "",
  });

  // State for validation errors
  const [errors, setErrors] = useState({
    name: "",
    role: "",
  });

  // Get purchase orders for dropdown
  const { data: poData } = useQuery(GET_PURCHASEORDERS);

  // Set initial form data when editing
  useEffect(() => {
    if (signatory) {
      setFormData({
        name: signatory.name || "",
        role: signatory.role || "",
        purchaseOrderId: signatory.purchaseOrderId || "",
      });
    } else {
      // Reset form for new signatory
      setFormData({
        name: "",
        role: "",
        purchaseOrderId: "",
      });
    }
    // Reset errors
    setErrors({
      name: "",
      role: "",
    });
  }, [signatory, open]);

  // Handle input changes
  const handleChange = (e : any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is updated
 if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      // Prepare data for submission
      const submitData = {
        ...formData,
        purchaseOrderId: formData.purchaseOrderId ? parseInt(formData.purchaseOrderId) : null,
      };
      
      onSave(submitData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="signatory-dialog-title"
    >
      <DialogTitle id="signatory-dialog-title">
        {signatory ? "Edit Signatory" : "Add New Signatory"}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.role} required>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="purchase-order-label">Purchase Order (Optional)</InputLabel>
                <Select
                  labelId="purchase-order-label"
                  name="purchaseOrderId"
                  value={formData.purchaseOrderId}
                  onChange={handleChange}
                  label="Purchase Order (Optional)"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {poData?.purchaseOrders?.map((po : any) => (
                    <MenuItem key={po.id} value={po.id}>
                      PO #{po.poNumber} - {po.supplier}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Associate with a purchase order (optional)</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {signatory ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatoryModal;
