import { mergeTypeDefs } from "@graphql-tools/merge";

//typeDefs

import userTypeDef from "./user.typeDef.js";
import purchaseorderTypeDef from "./purchaseorder.typeDef.js";
import signatoryTypeDef from "./signatory.typeDef.js";
import inspectionAcceptanceReportTypeDef from "./inspectionacceptancereport.typeDef.js";
import propertyAcknowledgementReportTypeDef from "./propertyacknowledgmentreport.typeDef.js";
import requisitionIssueSlipTypeDef from "./requisitionissueslip.typeDef.js";
const mergedTypeDefs = mergeTypeDefs([
  userTypeDef,
  purchaseorderTypeDef,
  signatoryTypeDef,
  inspectionAcceptanceReportTypeDef,
  propertyAcknowledgementReportTypeDef,
  requisitionIssueSlipTypeDef
]);

export default mergedTypeDefs;
