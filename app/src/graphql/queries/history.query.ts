import { gql } from "@apollo/client";

export const GET_ALL_HISTORY = gql`
  query GetAllHistory {
    purchaseOrderItemsHistoryAll {
      id
      purchaseOrderItemId
      purchaseOrderId
      itemName
      description
      iarId
      parId
      risId
      icsId
      previousQuantity
      newQuantity
      previousActualQuantityReceived
      newActualQuantityReceived
      previousAmount
      newAmount
      changeType
      changedBy
      changeReason
      createdAt
      updatedAt
    }
  }
`;
