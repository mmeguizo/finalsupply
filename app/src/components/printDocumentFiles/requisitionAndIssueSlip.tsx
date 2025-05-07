export const getRequisitionAndIssueSlip = (reportData: any) => `
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Requisition and Issue Slip</title>
    <link rel="stylesheet" href="./assets/styles/style.css">
</head>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-weight: normal;
  font-family: serif;
  font-size: 14px;
}

/* A4 size dimensions in millimeters */
/* .page {
  width: 210mm;
  height: 297mm;
  margin: 0 auto;
  border: 1px solid #000;
  padding: 0.25in;
} */

table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border: 1px solid #000;

  tr.sizing-row {
    visibility: collapse;
    height: 0;
    & > td {
      &:nth-child(1) {
        width: 17%;
      }
      &:nth-child(2),
      &:nth-child(3) {
        width: 13%;
      }
      &:nth-child(4) {
        width: 34%;
      }
      &:nth-child(5) {
        width: 19%;
      }
      &:nth-child(6) {
        width: 16%;
      }
      &:nth-child(7) {
        width: 3%;
      }
      &:nth-child(8) {
        width: 6%;
      }
      &:nth-child(9),
      &:nth-child(10) {
        width: 14%;
      }
      &:nth-child(11) {
        width: 34%;
      }
    }
  }
  & th,
  & td {
    border: 1px solid color-mix(in srgb, black 25%, white);
    padding: 2px;
  }
  & th {
    white-space: nowrap;
  }
}

thead {
  & > tr.header-1st-row {
    & > th {
      & > div {
        display: grid;
        grid-template-columns: 1fr 3fr 1fr;
        & > div {
          &:nth-child(1) {
            display: grid;
            place-items: center;
            & > img {
              width: 90px;
              aspect-ratio: 1 / 1;
              object-fit: contain;
            }
          }
          &:nth-child(2) {
            display: grid;
            place-items: center;
            align-content: center;
            text-align: center;
            padding: 3rem 0px;
            & > span {
              font-weight: bold;
              text-transform: uppercase;
              display: block;
              &:first-child {
                font-size: 10px;
                font-style: italic;
              }
              &:nth-child(2) {
                margin: 0.25rem 0px 0.5rem 0px;
                font-style: italic;
              }
            }
          }
          &:nth-child(3) {
            text-align: right;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-end;
            & > span {
              display: flex;
              flex-direction: column;
              & > span:first-child {
                font-style: italic;
                font-size: 16px;
              }
              & > span:last-child {
                text-align: center;
                font-size: 14px;
              }
            }
            & > div {
              --adjustment: 3rem;
              width: calc(100% + var(--adjustment));
              display: grid;
              grid-template-columns: auto 1fr;
              gap: 0.5ch;
              margin-left: calc(var(--adjustment) * -1);
              & > span:first-child {
                font-weight: bold;
                font-size: 12px;
              }
              & > span:last-child {
                border-bottom: 1px solid #000;
              }
            }
          }
        }
      }
    }
  }
  & > tr.header-2nd-row {
    & > th {
      padding-top: 10px;
      padding-bottom: 0px;
      & > div {
        & > span {
          display: flex;
          text-align: left;
          font-size: 12px;
          & > span {
            border-bottom: 1px solid #000;
            width: 100%;
          }
        }
      }
    }
  }
  & > tr.header-3rd-row {
    & > th {
      padding-top: 4px;
      padding-bottom: 4px;
      font-weight: bold;
      font-style: italic;
      &:nth-child(2) {
        font-size: 10px;
      }
    }
  }
  & > tr.header-4th-row {
    & > th {
      padding-top: 4px;
      padding-bottom: 4px;
      font-size: 12px;
    }
  }
}

tbody {
  & > tr {
    & > td {
      padding: 2px 4px;
      font-size: 12px;
      height: 24px;
    }
  }
}

tfoot {
  & > tr {
    & > td {
      padding: 2px 4px;
      font-size: 12px;
      height: 24px;
    }
    &.footer-1st-row {
      & > td:first-child {
        border-right: none;
        padding: 10px 0px 0px 12px;
        align-content: start;
      }
      & > td:last-child {
        border-left: none;
        padding: 0px;
        & > div {
          display: flex;
          flex-direction: column;
          & > span {
            width: 100%;
            display: block;
            height: 24px;
            &:not(:last-child) {
              border-bottom: 1px solid #000;
            }
          }
        }
      }
    }
    &.footer-2nd-row {
      & > td {
        font-weight: bold;
      }
    }
    &.footer-last-rows {
      & > td {
        padding: 0px;
        padding-left: 0px;
        align-content: end;
        height: 22px;
      }
    }
  }
}


</style>

<body>
    <div class="page">
        <table>
            <thead>
                <tr class="sizing-row">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr class="header-1st-row">
                    <th colspan="11">
                        <div>
                            <div>
                                  <img src="chmsu-logo.png" alt="CHMSU Logo" />
                            </div>
                            <div>
                                <span>Republic of the PHILIPPINES</span>
                                <span>Carlos Hilado Memorial State University</span>
                                <span>Requisition and Issue Slip</span>
                            </div>
                            <div>
                                <span>
                                    <span>Appendix 63</span>
                                </span>
                                <div>
                                    <span>Fund Cluster :</span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </th>
                </tr>
                <tr>
                    <th colspan="11"></th>
                </tr>
                <tr class="header-2nd-row">
                    <th colspan="7">
                        <div>
                            <span>Division:</span>
                            <span>Office:</span>
                        </div>
                    </th>
                    <th></th>
                    <th colspan="3">
                        <div>
                            <span>Responsibility Center Code : <span></span></span>
                            <span>RIS No. : ${reportData?.PurchaseOrder?.poNumber || ''}</span>
                        </div>
                    </th>
                </tr>
                <tr class="header-3rd-row">
                    <th colspan="6">Requisition</th>
                    <th colspan="3">Stock Available?</th>
                    <th colspan="2">Issue</th>
                </tr>
                <tr class="header-4th-row">
                    <th>Stock No.</th>
                    <th>Item No.</th>
                    <th>Unit</th>
                    <th colspan="2">Description</th>
                    <th>Quantity</th>
                    <th colspan="2">Yes</th>
                    <th>No</th>
                    <th>Quantity</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${reportData?.id || ''}</td>
                    <td>${reportData?.purchaseOrderId || ''}</td>
                    <td>${reportData?.unit || ''}</td>
                    <td colspan="2">${reportData?.description || ''}</td>
                    <td>${reportData?.quantity || ''}</td>
                    <td colspan="2"></td>
                    <td></td>
                    <td>${reportData?.actualQuantityReceived || ''}</td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
            <tfoot>
                <tr class="footer-1st-row">
                    <td colspan="6">Purpose:</td>
                    <td colspan="5">
                        <div>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </td>
                </tr>
                <tr class="footer-2nd-row">
                    <td colspan="11">Requested by:</td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="3">Signature:</td>
                    <td colspan="4">Approved by:</td>
                    <td colspan="4">Issued by:</td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="3">Printed Name:</td>
                    <td colspan="4">Signature:</td>
                    <td colspan="4">Signature:</td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="3">Designation:</td>
                    <td colspan="4">Printed Name:</td>
                    <td colspan="4">Printed Name: ${reportData?.PurchaseOrder?.supplier || ''}</td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="3">Date: ${reportData?.PurchaseOrder?.dateOfDelivery || ''}</td>
                    <td colspan="4">Designation:</td>
                    <td colspan="4">Designation:</td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="3"></td>
                    <td colspan="4">Date: ${reportData?.PurchaseOrder?.dateOfPayment || ''}</td>
                    <td colspan="4">Date: ${reportData?.PurchaseOrder?.dateOfDelivery || ''}</td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="11">Received by:</td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="3">Signature:</td>
                    <td colspan="8"></td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="3">Printed Name:</td>
                    <td colspan="8"></td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="3">Designation:</td>
                    <td colspan="8"></td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="3">Date:</td>
                    <td colspan="8"></td>
                </tr>
            </tfoot>
        </table>
    </div>
</body>

</html>
`;
