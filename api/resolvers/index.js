import { mergeResolvers } from "@graphql-tools/merge";
import userResolver from "./user.resolver.js";
import purchaseorderResolver from "./purchaseorder.resolver.js";
import signatoryResolver from "./signatory.resolver.js";
import inspectionAcceptanceReportResolver from "./inspectionacceptancereport.resolver.js";
import propertyAcknowledgmentReportResolver from "./propertyacknowledgementrepoert.resolver.js";
import requisitionIssueSlipResolver from "./requisitionissueslip.resolver.js";
import departmentResolver from "./department.resolver.js";
const mergedResolvers = mergeResolvers([
  userResolver,
  purchaseorderResolver,
  signatoryResolver,
  inspectionAcceptanceReportResolver,
  propertyAcknowledgmentReportResolver,
  requisitionIssueSlipResolver,
  departmentResolver
]); 

export default mergedResolvers;
