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
  // Persisted selections for Issuance PAR page
  issuanceParSelections: {
    recieved_from: string;
    recieved_by: string;
    metadata?: {
      recieved_from: { position: string; role: string };
      recieved_by: { position: string; role: string };
    };
  };
  // Generic persisted selections by context (e.g., 'ris', 'ics', 'par', ...)
  selectionsByContext: Record<string, any>;
  // Actions
  fetchSignatories: () => Promise<void>;
  getSignatoryByRole: (role: string) => SignatoryTypes | undefined;
  selectSignatory: (id: string) => void;
  clearSelectedSignatory: () => void;
  setIssuanceParSelections: (selections: {
    recieved_from: string;
    recieved_by: string;
    metadata?: {
      recieved_from: { position: string; role: string };
      recieved_by: { position: string; role: string };
    };
  }) => void;
  clearIssuanceParSelections: () => void;
  // Generic getters/setters for selections persistence
  getSelections: (key: string) => any;
  setSelections: (key: string, selections: any) => void;
  clearSelections: (key: string) => void;
}

export type { SignatoryStore, Signatory, SignatoryTypes };
