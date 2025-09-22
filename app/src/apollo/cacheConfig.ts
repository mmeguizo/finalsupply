import { InMemoryCache } from "@apollo/client";

export const cache = new InMemoryCache({
  typePolicies: {
    // Ensure proper normalization for entities
    PurchaseOrder: {
      keyFields: ["id"],
      fields: {
        items: {
          // Replace items array on fetch/mutation to avoid duplications
          merge(existing = [], incoming = []) {
            return incoming;
          },
        },
      },
    },
    PurchaseOrderItem: {
      keyFields: ["id"],
    },
    Query: {
      fields: {
        // Make the purchaseOrders field replace the list whenever refetched
        purchaseOrders: {
          keyArgs: false,
          merge(existing = [], incoming = []) {
            return incoming;
          },
        },
      },
    },
  },
});
