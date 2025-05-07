import { mergeResolvers } from "@graphql-tools/merge";
import userResolver from "./user.resolver.js";
import transactionResolver from "./transaction.resolver.js";
import purchaseorderResolver from "./purchaseorder.resolver.js";
import signatoryResolver from "./signatory.resolver.js";

const mergedResolvers = mergeResolvers([
  userResolver,
  transactionResolver,
  purchaseorderResolver,
  signatoryResolver
]);

export default mergedResolvers;
