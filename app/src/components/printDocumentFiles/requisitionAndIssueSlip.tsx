export const getRequisitionAndIssueSlip = (signatories : any, reportData: any) => {
  // Check if reportData is an array, if not, convert it to an array for consistent handling
  const itemsArray = Array.isArray(reportData) ? reportData : [reportData];
  const totalAmount = itemsArray.reduce((sum, item) => {
    return sum + (item?.amount || 0);
  }, 0);
  // Format the total amount
  const formatTotalAmount = `₱${totalAmount.toFixed(2)}`;
  
  const { inspectionOfficer, supplyOfficer, receivedFrom } = signatories || {};
  
  // Generate rows for each item
  const itemRows = itemsArray.map((item, index) => {
    return `
                <tr>
                    <td>${item?.id || ''}</td>
                    <td>${item?.purchaseOrderId || ''}</td>
                    <td>${item?.unit || ''}</td>
                    <td colspan="2">${item?.description || ''}</td>
                    <td>${item?.quantity || ''}</td>
                    <td colspan="2"></td>
                    <td></td>
                    <td>${item?.actualQuantityReceived || ''}</td>
                    <td></td>
                </tr>
    `;
  }).join('');
  
  // Fill remaining rows with empty rows to maintain layout
  const emptyRows = Array(Math.max(0, 5 - itemsArray.length))
    .fill('')
    .map(() => `
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
    `).join('');
  
  return `
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
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 14px;
}

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
    border: 1px solid color-mix(in srgb, black 50%, white);
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
        grid-template-columns: 1fr 1.75fr 1fr;
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
            padding: 1rem 0px 3rem 0px;
            & > span {
              text-transform: uppercase;
              display: block;
              &:first-child {
                font-size: 14px;
                font-weight: lighter;
              }
              &:nth-child(2) {
                font-size: 16px;
              }
              &:last-child {
                font-size: 16px;
                font-weight: 900;
                line-height: 1;
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
                font-size: 14px;
                font-family: serif;
              }
              & > span:last-child {
                text-align: center;
                font-size: 12px;
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
      line-height: 1;
      height: 14px;
    }
  }
}

tbody {
  & > tr {
    & > td {
      padding: 2px 0px;
      font-size: 12px;
      height: 14px;
      line-height: 1;
    }
  }
}

tfoot {
  & > tr {
    &:first-child {
      & > td {
        font-weight: lighter;
      }
    }
    & > td {
      font-size: 12px;
      line-height: 1;
      height: 14px;
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
                                <img src="chmsu-logo.png" alt="CHMSU Logo">
                            </div>
                            <div>
                                <span>Republic of the PHILIPPINES</span>
                                <span>Carlos Hilado Memorial State University</span>
                                <span>Requisition and Issue Slip</span>
                            </div>
                            <div>
                                <span>
                                    <span>Appendix 63</span>
                                    <span>page 1/1</span>
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
                            <span>RIS No. : ${itemsArray[0]?.risId || ''}</span>
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
                ${itemRows}
                ${emptyRows}
            </tbody>
            <tfoot>
            <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td>Total</td>
                    <td>${formatTotalAmount}</td>
                </tr>
                <tr class="footer-1st-row">
                    <td colspan="2">
                        Purpose:
                    </td>
                    <td colspan="9">
                        <div>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </td>
                </tr>
                <tr class="footer-2nd-row">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Requested by:</td>
                    <td colspan="3">Approved by:</td>
                    <td colspan="3">Issued by:</td>
                    <td>Received by:</td>
                </tr>
                <tr class="footer-last-rows">
                    <td>Signiture :</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="3"></td>
                    <td colspan="3"></td>
                    <td></td>
                </tr>
                <tr class="footer-last-rows">
                    <td colspan="2">Printed Name :</td>
                    <td></td>
                    <td> ${receivedFrom || ''}</td>
                    <td colspan="3"> ${supplyOfficer || ''} </td>
                    <td colspan="3">${inspectionOfficer || ''}</td>
                    <td>${inspectionOfficer || ''}</td>
                </tr>
                <tr class="footer-last-rows">
                    <td>Designation :</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="3"></td>
                    <td colspan="3"></td>
                    <td></td>
                </tr>
                <tr class="footer-last-rows">
                    <td>Date :</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="3"></td>
                    <td colspan="3"></td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    </div>
</body>
</html>
`;
};

/*
<tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td colspan="2"></td>
                    <td></td>
                    <td>Total</td>
                    <td>${formatTotalAmount}</td>
                </tr>
                <tr class="footer-1st-row">
                    <td colspan="6">
                        <div style="display: flex; flex-direction: column; padding: 2px;">
                            <div style="font-weight: 600;">Requested by:</div>
                            <div style="display: flex; flex-direction: column; padding: 20px 35px; gap: 20px; align-items: flex-start; height: 150px; margin-top: 5px;">
                                <div style="display: flex; flex-direction: row; justify-content: space-evenly; align-items: center; width: 100%; gap: 4px;">
                                    <div style="width: 50px; height: 50px; border: 1px dotted black;"></div>
                                    <div>Signature over Printed Name</div>
                                </div>
                            </div>
                            <div style="margin-top: 10px; width: 75%; text-align: center; margin: 0 auto; display: flex; flex-direction: column; gap: 3px;">
                                ${receivedFrom || ''}
                                <hr style="width: 100%; margin: 5px 0;" />
                                Designation
                            </div>
                        </div>
                    </td>
                    <td colspan="5">
                        <div style="display: flex; flex-direction: column; padding: 2px;">
                            <div style="font-weight: 600;">Approved by:</div>
                            <div style="display: flex; flex-direction: column; padding: 20px 35px; gap: 20px; align-items: flex-start; height: 150px; margin-top: 5px;">
                                <div style="display: flex; flex-direction: row; justify-content: space-evenly; align-items: center; width: 100%; gap: 4px;">
                                    <div style="width: 50px; height: 50px; border: 1px dotted black;"></div>
                                    <div>Signature over Printed Name</div>
                                </div>
                            </div>
                            <div style="margin-top: 10px; width: 75%; text-align: center; margin: 0 auto; display: flex; flex-direction: column; gap: 3px;">
                                ${inspectionOfficer || ''}
                                <hr style="width: 100%; margin: 5px 0;" />
                                Designation
                            </div>
                        </div>
                    </td>
                </tr>
                <tr class="footer-2nd-row">
                    <td colspan="6">
                        <div style="display: flex; flex-direction: column; padding: 2px;">
                            <div style="font-weight: 600;">Issued by:</div>
                            <div style="display: flex; flex-direction: column; padding: 20px 35px; gap: 20px; align-items: flex-start; height: 150px; margin-top: 5px;">
                                <div style="display: flex; flex-direction: row; justify-content: space-evenly; align-items: center; width: 100%; gap: 4px;">
                                    <div style="width: 50px; height: 50px; border: 1px dotted black;"></div>
                                    <div>Signature over Printed Name</div>
                                </div>
                            </div>
                            <div style="margin-top: 10px; width: 75%; text-align: center; margin: 0 auto; display: flex; flex-direction: column; gap: 3px;">
                                ${supplyOfficer || ''}
                                <hr style="width: 100%; margin: 5px 0;" />
                                Designation
                            </div>
                        </div>
                    </td>
                    <td colspan="5">
                        <div style="display: flex; flex-direction: column; padding: 2px;">
                            <div style="font-weight: 600;">Received by:</div>
                            <div style="display: flex; flex-direction: column; padding: 20px 35px; gap: 20px; align-items: flex-start; height: 150px; margin-top: 5px;">
                                <div style="display: flex; flex-direction: row; justify-content: space-evenly; align-items: center; width: 100%; gap: 4px;">
                                    <div style="width: 50px; height: 50px; border: 1px dotted black;"></div>
                                    <div>Signature over Printed Name</div>
                                </div>
                            </div>
                            <div style="margin-top: 10px; width: 75%; text-align: center; margin: 0 auto; display: flex; flex-direction: column; gap: 3px;">
                                ${receivedFrom || ''}
                                <hr style="width: 100%; margin: 5px 0;" />
                                Designation
                            </div>
                        </div>
                    </td>
                </tr>
            </tfoot>

*/