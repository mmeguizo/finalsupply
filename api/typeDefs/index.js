import { mergeTypeDefs } from "@graphql-tools/merge";

//typeDefs

import userTypeDef from "./user.typeDef.js";
import transactionTypeDef from "./transaction.typeDef.js";
import purchaseorderTypeDef from "./purchaseorder.typeDef.js";

const mergedTypeDefs = mergeTypeDefs([
  userTypeDef,
  transactionTypeDef,
  purchaseorderTypeDef,
]);

export default mergedTypeDefs;
