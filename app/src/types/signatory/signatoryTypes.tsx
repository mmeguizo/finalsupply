// signatory types
interface Signatory {
  id: string;
  name: string;
  role: string;
  purchaseOrderId?: number | null;
}

interface SignatoryTypes {
  id: string;
  name: string;
  role: string;
  purchaseOrderId?: number | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  purchaseOrder?: {
    id: string;
    poNumber: string | number;
    supplier: string;
  } | null;
}

interface SignatoryStore {
  // State
  selectedSignatory: Signatory | null;
  signatories: Signatory[];
  loading: boolean;
  error: string | null;
  // Actions
  fetchSignatories: () => Promise<void>;
  getSignatoryByRole: (role: string) => SignatoryTypes | undefined;
  selectSignatory: (id: string) => void;
  clearSelectedSignatory: () => void;
}

export type { SignatoryStore, Signatory, SignatoryTypes };
