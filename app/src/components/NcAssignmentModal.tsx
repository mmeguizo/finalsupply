import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMutation } from '@apollo/client';
import { ASSIGN_NO_CATEGORY_ITEM } from '../graphql/mutations/inventoryIAR.mutation';
import { GET_ALL_IAR_NO_CATEGORY } from '../graphql/queries/inspectionacceptancereport.query';
import { currencyFormat } from '../utils/generalUtils';

/**
 * NcAssignmentModal
 * -----------------
 * Simpler version of IcsAssignmentModal — no department, receivedFrom, receivedBy needed.
 *
 * Flow:
 * 1. User clicks an item chip on the No Category page → this modal opens.
 * 2. Shows item info (description, unit, available qty, unit cost).
 * 3. User enters a quantity to assign and an optional purpose.
 * 4. On submit, calls ASSIGN_NO_CATEGORY_ITEM mutation.
 * 5. Backend:
 *    a. Generates an NC ID (format: NC-YYYY-NNNN)
 *    b. Creates a clone record with the NC ID (recordType: 'issuance_clone')
 *    c. Reduces the source item's actualQuantityReceived
 * 6. On success, shows the generated NC ID in a success alert.
 * 7. Refetches GET_ALL_IAR_NO_CATEGORY to update the table.
 *
 * Why simpler than ICS?
 * - NC items don't have tag, department, or signatory assignment requirements.
 * - The modal only needs: quantity + optional purpose.
 */

interface NcAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  item: any | null;
  onAssignmentComplete: () => void;
}

export default function NcAssignmentModal({
  open,
  onClose,
  item,
  onAssignmentComplete,
}: NcAssignmentModalProps) {
  /* ---------- GraphQL ---------- */
  const [assignNoCategoryItem, { loading: assigning }] = useMutation(ASSIGN_NO_CATEGORY_ITEM, {
    refetchQueries: [{ query: GET_ALL_IAR_NO_CATEGORY }],
  });

  /* ---------- Local state ---------- */
  const [quantity, setQuantity] = useState<number | ''>(0);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /* ---------- Derived item info ---------- */
  const description = item?.description || item?.itemName || '';
  const unit = item?.unit || '';
  const unitCost = parseFloat(item?.unitCost) || 0;
  const poNumber = item?.PurchaseOrder?.poNumber || '-';
  const availableQty = item?.actualQuantityReceived || 0;
  const existingNcId = item?.ncId || null;

  /* ---------- Reset state when modal opens/closes ---------- */
  useEffect(() => {
    if (open && item) {
      setQuantity(0);
      setPurpose(item.purpose || '');
      setError('');
      setSuccessMessage('');
    }
    if (!open) {
      setQuantity(0);
      setPurpose('');
      setError('');
      setSuccessMessage('');
    }
  }, [open, item]);

  /* ---------- Submit handler ---------- */
  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    const qty = typeof quantity === 'number' ? quantity : 0;

    // Validate: quantity must be > 0
    if (qty <= 0) {
      setError('Please enter a quantity greater than 0.');
      return;
    }

    // Validate: can't exceed available qty
    if (qty > availableQty) {
      setError(`Quantity (${qty}) exceeds available (${availableQty}).`);
      return;
    }

    try {
      const result = await assignNoCategoryItem({
        variables: {
          id: parseInt(item.id, 10),
          assignedQuantity: qty,
          purpose: purpose.trim() || null,
        },
      });

      const { generatedNcId } = result.data.assignNoCategoryItem;
      setSuccessMessage(`NC ID ${generatedNcId} assigned successfully!`);

      // Auto-close after short delay so user can see the success message
      setTimeout(() => {
        onAssignmentComplete();
      }, 1200);
    } catch (err: any) {
      console.error('assignNoCategoryItem error:', err);
      setError(err.message || 'Failed to assign NC ID. Please try again.');
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {existingNcId ? `NC Assignment — ${existingNcId}` : 'Assign NC ID'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Item summary */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            PO: {poNumber} &nbsp;|&nbsp; Unit: {unit} &nbsp;|&nbsp; Unit Cost:{' '}
            {currencyFormat(unitCost)}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {availableQty}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              available to assign
            </Typography>
          </Box>
        </Paper>

        {/* Error / Success alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Assignment form — only shown if item can still be assigned */}
        {availableQty > 0 && !existingNcId && !successMessage && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Quantity to Assign"
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val === '' ? '' : parseInt(val, 10));
              }}
              inputProps={{ min: 0, max: availableQty }}
              size="small"
              fullWidth
              helperText={`Max: ${availableQty}`}
            />
            <TextField
              label="Purpose (optional)"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              multiline
              rows={3}
              size="small"
              fullWidth
            />
          </Box>
        )}

        {/* Already assigned message */}
        {existingNcId && (
          <Alert severity="info" sx={{ mt: 1 }}>
            This item already has NC ID: <strong>{existingNcId}</strong>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={assigning}>
          {successMessage ? 'Close' : 'Cancel'}
        </Button>
        {availableQty > 0 && !existingNcId && !successMessage && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={assigning}
            startIcon={assigning ? <CircularProgress size={16} /> : undefined}
          >
            {assigning ? 'Assigning...' : 'Assign NC ID'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
