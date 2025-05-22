import { mergeResolvers } from "@graphql-tools/merge";
import userResolver from "./user.resolver.js";
import purchaseorderResolver from "./purchaseorder.resolver.js";
import signatoryResolver from "./signatory.resolver.js";
import inspectionAcceptanceReportResolver from "./inspectionacceptancereport.resolver.js";
const mergedResolvers = mergeResolvers([
  userResolver,
  purchaseorderResolver,
  signatoryResolver,
  inspectionAcceptanceReportResolver
]);

export default mergedResolvers;
