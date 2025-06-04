import { InMemoryCache } from "@apollo/client";

export const cache = new InMemoryCache({
  typePolicies: {
    Purchaseorder: {
      fields: {
        items: {
          // Specify a custom merge function for the items field
          merge(existing = [], incoming = []) {
            return [...incoming]; // Simply use the incoming items
          },
        },
      },
    },
    

  },
});
