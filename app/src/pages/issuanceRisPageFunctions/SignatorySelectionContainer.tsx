import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { risIssuanceSignatories } from '../../types/user/userType';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import useSignatoryStore from '../../stores/signatoryStore';
import { GET_ALL_USERS } from '../../graphql/queries/user.query';

interface RisPageProps {
    signatories: risIssuanceSignatories;
    onSignatoriesChange: (signatories: risIssuanceSignatories) => void;
}

interface UserOption {
    id: string;
    name: string;
    last_name?: string;
    position?: string;
    role?: string;
    label: string;
}

const SignatoriesComponent = ({ signatories, onSignatoriesChange }: RisPageProps) => {
    const [selectedSignatories, setSelectedSignatories] = useState<risIssuanceSignatories>({
        requested_by: signatories.requested_by || '',
        approved_by: signatories.approved_by || '',
        issued_by: signatories.issued_by || '',
        recieved_by: signatories.recieved_by || ''
    });

    // Get signatories from the store (for approved_by and issued_by)
    const allSignatories = useSignatoryStore((state) => state.signatories);
    const fetchSignatories = useSignatoryStore((state) => state.fetchSignatories);

    // Get users from GraphQL query (for requested_by and recieved_by)
    const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_ALL_USERS);

    // Fetch signatories on component mount
    useEffect(() => {
        if (allSignatories.length === 0) {
            fetchSignatories();
        }
    }, [allSignatories.length, fetchSignatories]);

    // Update local state when props change
    useEffect(() => {
        setSelectedSignatories({
            requested_by: signatories.requested_by || '',
            approved_by: signatories.approved_by || '',
            issued_by: signatories.issued_by || '',
            recieved_by: signatories.recieved_by || ''
        });
    }, [signatories]);

    // const handleSignatoryChange = (role: keyof risIssuanceSignatories, value: string) => {
    //     const updatedSignatories = {
    //         ...selectedSignatories,
    //         [role]: value
    //     };
    //     setSelectedSignatories(updatedSignatories);
    //     onSignatoriesChange(updatedSignatories);
    // };

const handleSignatoryChange = (role: keyof risIssuanceSignatories, newValue: UserOption | string | null) => {


    let fullName = '';
    if (!newValue) {
        fullName = '';
    } else if (typeof newValue === 'string') {
        fullName = newValue;
    } else {
        fullName = [newValue.name, newValue.last_name].filter(Boolean).join(' ');
    }
    console.log(`Selected full name for role ${role}:`, fullName);

    const updatedSignatories = {
        ...selectedSignatories,
        [role]: fullName
    };
    setSelectedSignatories(updatedSignatories);
    onSignatoriesChange(updatedSignatories);
};

    // Get dropdown options based on role and format them for Autocomplete
    const getDropdownOptions = (roleKey: keyof risIssuanceSignatories): UserOption[] => {
        if (roleKey === 'requested_by' || roleKey === 'recieved_by') {
            // Use users for end users (requested_by and recieved_by)
            const users = usersData?.users?.filter((user: any) => user.is_active) || [];
            return users.map((user: any) => {
                const displayName = `${user.name} ${user.last_name || ''} ${
                    user.position ? `(${user.position})` : ''
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
            // Use signatories for approved_by and issued_by
            return (allSignatories || []).map((signatory: any) => ({
                id: signatory.id,
                name: signatory.name,
                role: signatory.role,
                label: `${signatory.name} (${signatory.role})`
            }));
        }
    };

    // Find the selected option object based on name
    const findSelectedOption = (options: UserOption[], name: string) => {
        // if there's no stored name, nothing to match
        if (!name) return null;

        // Try matching by common possibilities:
        // - exact label (e.g. "First Last (Position)")
        // - combined name + last_name ("First Last")
        // - name only ("First")
        return (
            options.find(option =>
                option.label === name ||
                `${option.name} ${option.last_name || ''}`.trim() === name ||
                option.name === name
            ) || null
        );
    };

    const signatoryRoles = [
        { key: 'requested_by' as keyof risIssuanceSignatories, label: 'Requested By', designation: 'End User' },
        { key: 'approved_by' as keyof risIssuanceSignatories, label: 'Approved By', designation: 'AO V / Supply Officer' },
        { key: 'issued_by' as keyof risIssuanceSignatories, label: 'Issued By', designation: 'Supply Officer Staff' },
        { key: 'recieved_by' as keyof risIssuanceSignatories, label: 'Received By', designation: 'End User' }
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
                                <TableCell><strong>Role</strong></TableCell>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Designation</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {signatoryRoles.map((role) => {
                                const options = getDropdownOptions(role.key);
                                const isUserRole = role.key === 'requested_by' || role.key === 'recieved_by';
                                const selectedValue = selectedSignatories[role.key] || '';
                                const selectedOption = findSelectedOption(options, selectedValue);
                                
                                return (
                                    <TableRow key={role.key}>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {role.label}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Autocomplete
                                                value={selectedOption}
                                                onChange={(event, newValue) => {
                                                    handleSignatoryChange(role.key, newValue || null);
                                                }}
                                                options={options}
                                                getOptionLabel={(option) => option.label}
                                                renderInput={(params) => (
                                                    <TextField 
                                                        {...params} 
                                                        placeholder={`Search ${isUserRole ? 'user' : 'signatory'}...`}
                                                        size="small"
                                                        fullWidth
                                                    />
                                                )}
                                                sx={{ minWidth: 250 }}
                                                isOptionEqualToValue={(option, value) => option?.id === value?.id}
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

