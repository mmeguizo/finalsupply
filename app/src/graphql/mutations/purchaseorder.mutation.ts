import { gql } from "@apollo/client";

export const ADD_PURCHASEORDER = gql`
  mutation AddPurchaseOrder($input: PurchaseOrderInput!) {
    addPurchaseOrder(input: $input) {
      id
      poNumber
      supplier
      address
      dateOfDelivery
      dateOfPayment
      category
      invoice
      items {
        id
        description
        purchaseOrderId
        unit
        quantity
        unitCost
        amount
        category
        isDeleted
        actualQuantityReceived
      }
    }
  }
`;

export const UPDATE_PURCHASEORDER = gql`
  mutation UpdatePurchaseOrder($input: UpdatePurchaseOrderInput!) {
    updatePurchaseOrder(input: $input) {
      id
      supplier
      address
      poNumber
      telephone
      placeOfDelivery
      dateOfDelivery
      dateOfPayment
      deliveryTerms
      paymentTerms
      category
      status
      items {
        id
        description
        unit
        quantity
        unitCost
        amount
        category
        isDeleted
        actualQuantityReceived
      }
      amount
      invoice
    }
  }
`;

export const DELETE_PURCHASEORDER = gql`
  mutation DeletePurchaseOrder($id: ID!) {
    deletePurchaseOrder(purchaseOrderId: $id) {
      id
      poNumber
      supplier
    }
  }
`;

// import { gql } from "@apollo/client";

// export const ADD_PURCHASEORDER = gql`
//   mutation AddPurchaseOrder($input: PurchaseorderInput!) {
//     addPurchaseorder(input: $input) {
//       _id
//       ponumber
//       supplier
//       address
//       dateofdelivery
//       dateofpayment
//       category
//       invoice
//     }
//   }
// `;

// export const UPDATE_PURCHASEORDER = gql`
//   mutation UpdatePurchaseOrder($input: UpdatePurchaseorderInput!) {
//     updatePurchaseorder(input: $input) {
//       _id
//       supplier
//       address
//       ponumber
//       telephone
//       placeofdelivery
//       dateofdelivery
//       dateofpayment
//       deliveryterms
//       paymentterms
//       category
//       status
//       items {
//         _id
//         item
//         description
//         unit
//         quantity
//         unitCost
//         amount
//         category
//         isDeleted
//         actualQuantityReceived
//       }
//       amount
//       invoice
//     }
//   }
// `;

// export const DELETE_PURCHASEORDER = gql`
//   mutation DeletePurchaseOrder($id: ID!) {
//     deletePurchaseorder(purchaseorderId: $id) {
//       _id
//       ponumber
//       supplier
//     }
//   }
// `;
