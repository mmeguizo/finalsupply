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
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import useSignatoryStore from '../../stores/signatoryStore';
import { GET_ALL_USERS } from '../../graphql/queries/user.query';

interface RisPageProps {
    signatories: risIssuanceSignatories;
    onSignatoriesChange: (signatories: risIssuanceSignatories) => void;
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

    const handleSignatoryChange = (role: keyof risIssuanceSignatories, value: string) => {
        const updatedSignatories = {
            ...selectedSignatories,
            [role]: value
        };
        setSelectedSignatories(updatedSignatories);
        onSignatoriesChange(updatedSignatories);
    };

    // Get dropdown options based on role
    const getDropdownOptions = (roleKey: keyof risIssuanceSignatories) => {
        if (roleKey === 'requested_by' || roleKey === 'recieved_by') {
            // Use users for end users (requested_by and recieved_by)
            return usersData?.users?.filter((user: any) => user.is_active) || [];
        } else {
            // Use signatories for approved_by and issued_by
            return allSignatories || [];
        }
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
                                
                                return (
                                    <TableRow key={role.key}>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {role.label}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={selectedSignatories[role.key] || ''}
                                                    onChange={(e) => handleSignatoryChange(role.key, e.target.value)}
                                                    displayEmpty
                                                    sx={{ minWidth: 200 }}
                                                >
                                                    <MenuItem value="">
                                                        <em>Select a {isUserRole ? 'user' : 'signatory'}</em>
                                                    </MenuItem>
                                                    {options.map((option: any) => (
                                                        <MenuItem key={option.id} value={option.name}>
                                                            {isUserRole ? (
                                                                // For users, show name and position/department
                                                                `${option.name} ${option.last_name || ''} ${option.position ? `(${option.position})` : ''}`
                                                            ) : (
                                                                // For signatories, show name and role
                                                                `${option.name} (${option.role})`
                                                            )}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
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

