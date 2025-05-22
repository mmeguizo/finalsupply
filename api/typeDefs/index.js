import { mergeTypeDefs } from "@graphql-tools/merge";

//typeDefs

import userTypeDef from "./user.typeDef.js";
import purchaseorderTypeDef from "./purchaseorder.typeDef.js";
import signatoryTypeDef from "./signatory.typeDef.js";
import inspectionAcceptanceReportTypeDef from "./inspectionacceptancereport.typeDef.js";
const mergedTypeDefs = mergeTypeDefs([
  userTypeDef,
  purchaseorderTypeDef,
  signatoryTypeDef,
  inspectionAcceptanceReportTypeDef
]);

export default mergedTypeDefs;
