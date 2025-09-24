import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import useSignatoryStore from "../../stores/signatoryStore";
import { GET_ALL_USERS } from "../../graphql/queries/user.query";

// Enhanced signatory interface with additional fields
interface SignatoryData {
  id: string;
  name: string;
  role?: string;
  position?: string;
}

interface ParPageProps {
  signatories: any;
  onSignatoriesChange: (signatories: any) => void;
}

interface UserOption {
  id: string;
  name: string;
  last_name?: string;
  position?: string;
  role?: string;
  label: string;
}

const SignatoriesComponent = ({
  signatories,
  onSignatoriesChange,
}: ParPageProps) => {
  // Enhanced state to store additional information
  const [selectedSignatories, setSelectedSignatories] = useState<any>({
    recieved_from: signatories.recieved_from || "",
    recieved_by: signatories.recieved_by || "",
    // Store additional metadata (now includes id)
    metadata: {
      recieved_from: { id: signatories?.metadata?.recieved_from?.id || "", position: "", role: "" },
      recieved_by: { id: signatories?.metadata?.recieved_by?.id || "", position: "", role: "" }
    }
  });

  // Get signatories from the store (for approved_by and issued_by)
  const allSignatories = useSignatoryStore((state) => state.signatories);
  const fetchSignatories = useSignatoryStore((state) => state.fetchSignatories);

  // Get users from GraphQL query (for requested_by and recieved_by)
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery(GET_ALL_USERS, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  // Fetch signatories on component mount and on window focus
  useEffect(() => {
    fetchSignatories();
  }, [fetchSignatories]);

  useEffect(() => {
    const onFocus = () => {
      refetchUsers();
      fetchSignatories();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetchUsers, fetchSignatories]);

  // Update local state when props change
  useEffect(() => {
    setSelectedSignatories({
      recieved_from: signatories.recieved_from || "",
      recieved_by: signatories.recieved_by || "",
      metadata: signatories.metadata || {
        recieved_from: { id: "", position: "", role: "" },
        recieved_by: { id: "", position: "", role: "" }
      }
    });
  }, [signatories]);

  const handleSignatoryChange = (role: string, newValue: UserOption | null) => {
    const updatedMetadata = { ...selectedSignatories.metadata };

    if (newValue) {
      updatedMetadata[role] = {
        id: newValue.id,
        position: newValue.position || "",
        role: newValue.role || ""
      };
    } else {
      updatedMetadata[role] = { id: "", position: "", role: "" };
    }

    const displayName = newValue
      ? [newValue.name, newValue.last_name].filter(Boolean).join(" ")
      : "";

    const updatedSignatories = {
      ...selectedSignatories,
      [role]: displayName,
      metadata: updatedMetadata
    };

    setSelectedSignatories(updatedSignatories);
    onSignatoriesChange(updatedSignatories);
  };

  // Get dropdown options based on role and format them for Autocomplete
  const getDropdownOptions = (roleKey: string): UserOption[] => {
    if (roleKey === "recieved_by") {
      // Use users for end users (recieved_by)
      const users = usersData?.users?.filter((user: any) => user.is_active) || [];
      return users.map((user: any) => {
        const displayName = `${user.name} ${user.last_name || ""} ${
          user.position ? `(${user.position})` : ""
        }`.trim();
        return {
          id: user.id,
          name: user.name,
          last_name: user.last_name,
          position: user.position,
          label: displayName
        };
      });
    } else {
      // Use signatories for recieved_from
      return (allSignatories || []).map((signatory: any) => ({
        id: signatory.id,
        name: signatory.name,
        role: signatory.role,
        label: `${signatory.name} (${signatory.role})`
      }));
    }
  };

  // Find the selected option object using id first, fallback to name when id is missing
  const findSelectedOption = (roleKey: string, options: UserOption[]) => {
    const meta = selectedSignatories?.metadata?.[roleKey];
    if (meta?.id) {
      return options.find(o => o.id === meta.id) || null;
    }
    const value = (selectedSignatories?.[roleKey] || "").trim().toLowerCase();
    return (
      options.find(option => {
        const optionFullName = [option.name, option.last_name].filter(Boolean).join(" ").trim().toLowerCase();
        return optionFullName === value || option.name.toLowerCase() === value;
      }) || null
    );
  };

  const signatoryRoles = [
    { key: "recieved_from", label: "Received From", designation: "Supply Officer" },
    { key: "recieved_by", label: "Received By", designation: "End User" },
  ];

  if (usersLoading) {
    return (
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography>Loading users and signatories...</Typography>
      </Stack>
    );
  }

  if (usersError) {
    return (
      <Stack spacing={2}>
        <Typography color="error">Error loading users: {usersError.message}</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="div">
        Signatory Selection
      </Typography>
      <Paper>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Role</strong>
                </TableCell>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Designation</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {signatoryRoles.map((role) => {
                const options = getDropdownOptions(role.key);
                const isUserRole = role.key === "recieved_by";
                const selectedOption = findSelectedOption(role.key, options);

                return (
                  <TableRow key={role.key}>
                    <TableCell>
                      <Typography variant="body2">{role.label}</Typography>
                    </TableCell>
                    <TableCell>
                      <Autocomplete
                        value={selectedOption}
                        onChange={(event, newValue) => {
                          handleSignatoryChange(role.key, newValue);
                        }}
                        options={options}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            placeholder={`Search ${isUserRole ? "user" : "signatory"}...`}
                            size="small"
                            fullWidth
                          />
                        )}
                        sx={{ minWidth: 250 }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        filterOptions={(options, state) => {
                          const inputValue = state.inputValue.toLowerCase().trim();
                          return options.filter(option => 
                            option.label.toLowerCase().includes(inputValue)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {role.designation}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
};

export default SignatoriesComponent;