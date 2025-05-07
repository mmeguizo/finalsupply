// src/stores/index.ts

// Import all store hooks
import useSignatoryStore from './signatoryStore';

// Export all stores from a central location
export {
  useSignatoryStore,
  // Add future stores here, like:
  // usePurchaseOrderStore,
  // useInventoryStore,
};

// Optional: export any store utility functions
export const clearAllStores = () => {
  // Reset all store states
  useSignatoryStore.getState().fetchSignatories();
  // Add other store resets as needed
};
