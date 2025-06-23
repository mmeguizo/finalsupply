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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";
interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  user: any | null;
}

const ROLE_OPTIONS = ["admin", "user"];
const LOCATION_OPTIONS = ["Talisay", "Alijis", "Binalbagan", "Fortune Town"];
const GenderOptions = ["male", "female", "others"];

const UserModal = ({ open, onClose, onSave, user }: UserModalProps) => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    department: "",
    employee_id: "",
    gender: "",
    email: "",
    position: "",
    role: "",
    password: "",
    confirm_password: "",
    location: "",
  });

  // State for validation errors
  const [errors, setErrors] = useState({
    name: "",
    last_name: "",
    department: "",
    employee_id: "",
    gender: "",
    email: "",
    position: "",
    role: "",
    password: "",
    confirm_password: "",
    location: "",
  });

  
  const [showPassword, setShowPassword] = useState(true);
  // Set initial form data when editing
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        last_name: user.last_name || "",
        department: user.department || "",
        employee_id: user.employee_id,
        gender: user.gender || "",
        email: user.email || "",
        position: user.position || "",
        role: user.role || "",
        password: "",
        confirm_password: "",
        location: user.location || "",
      });
    } else {
      // Reset form for new signatory
      setFormData({
        name: "",
        last_name: "",
        department: "",
        employee_id: "",
        gender: "",
        email: "",
        position: "",
        role: "",
        password: "Password123!",
        confirm_password: "Password123!",
        location: "",
      });
    }
    // Reset errors
    setErrors({
      name: "",
      last_name: "",
      department: "",
      employee_id: "",
      gender: "",
      email: "",
      position: "",
      role: "",
      password: "",
      confirm_password: "",
      location: "",
    });
  }, [user, open]);

  // Handle input changes
  const handleChange = (e: any) => {
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
    // const newErrors = { ...errors };

    const newErrors = {
      name: "",
      last_name: "",
      department: "",
      employee_id: "",
      gender: "",
      email: "",
      position: "",
      role: "",
      password: "",
      confirm_password: "",
      location: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last Name is required";
      valid = false;
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
      valid = false;
    }

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = "Employee ID is required";
      valid = false;
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
      valid = false;
    }

    if (!formData.location.trim()) {
      newErrors.role = "Location is required";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Password validation: 12 characters, alphanumeric, 1 number, 1 special character
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!user) {
      // Adding a new user: Password is required
      if (!formData.password) {
        newErrors.password = "Password is required";
        valid = false;
      } else {
        if (!passwordRegex.test(formData.password)) {
          newErrors.password =
            "Password must be at least 12 characters long, include at least one number, and one special character (@$!%*?&).";
          valid = false;
        }
        if (!formData.confirm_password) {
          newErrors.confirm_password = "Confirm password is required";
          valid = false;
        } else if (formData.password !== formData.confirm_password) {
          newErrors.confirm_password = "Passwords do not match";
          valid = false;
        }
      }
    } else {
      // Editing an existing user: Password is optional
      // Validate only if user is trying to change the password (i.e., password or confirm_password field is not empty)
      if (formData.password || formData.confirm_password) {
        if (!formData.password) {
          newErrors.password = "Password is required to make a change.";
          valid = false;
        } else if (!passwordRegex.test(formData.password)) {
          newErrors.password =
            "Password must be at least 12 characters long, include at least one number, and one special character (@$!%*?&).";
          valid = false;
        }
        if (!formData.confirm_password) {
          newErrors.confirm_password = "Please confirm your new password.";
          valid = false;
        } else if (formData.password !== formData.confirm_password) {
          newErrors.confirm_password = "Passwords do not match";
          valid = false;
        }
      }
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
        {user ? "Edit User" : "Add New User"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="First Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department Name"
                name="department"
                value={formData.department}
                onChange={handleChange}
                error={!!errors.department}
                helperText={errors.department}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                error={!!errors.employee_id}
                helperText={errors.employee_id}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.gender} required>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  {GenderOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.gender && (
                  <FormHelperText>{errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                error={!!errors.position}
                helperText={errors.position}
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
                  label="Gender"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.location} required>
                <InputLabel id="role-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  label="Location"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <MenuItem key={loc} value={loc}>
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
                {errors.location && <FormHelperText>{errors.location}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete={user ? "new-password" : "current-password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={handleChange}
                error={!!errors.confirm_password}
                helperText={errors.confirm_password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {user ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
