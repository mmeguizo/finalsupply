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
    // Normalize types returned by IAR queries
    PurchaseOrderType: {
      keyFields: ["id"],
    },
    PurchaseOrderItemType: {
      keyFields: ["id"],
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
        // Ensure IAR list also fully replaces on refetch to avoid stale groups
        inspectionAcceptanceReport: {
          keyArgs: false,
          merge(existing = [], incoming = []) {
            return incoming;
          },
        },
        inspectionAcceptanceReportForICS: {
          keyArgs: false,
          merge(existing = [], incoming = []) {
            return incoming;
          },
        },
        // Ensure RIS view also fully replaces on refetch
        requisitionIssueSlipForView: {
          keyArgs: false,
          merge(existing = [], incoming = []) {
            return incoming;
          },
        },
      },
    },
  },
});
