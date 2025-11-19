import { escapeHtml, nl2br } from "../../utils/textHelpers";

export const getInventoryTemplateForICS = (signatories: any, reportData: any) => {
  // Check if reportData is an array, if not, convert it to an array for consistent handling
  const itemsArray = Array.isArray(reportData) ? reportData : [reportData];
  // Calculate total amount from all items
  const totalAmount = itemsArray.reduce((sum, item) => {
    return sum + (item?.amount || 0);
  }, 0);

  // Format the total amount
  const formatTotalAmount = `₱${totalAmount.toFixed(2)}`;
  const icsIds = Array.from(new Set(itemsArray.map((it: any) => it?.icsId).filter(Boolean)));
  const icsIdsDisplay = icsIds.join(", ");

  // Generate rows for each item
  const itemRows = itemsArray
    .map((item, index) => {
      const desc = escapeHtml(item?.description || item?.PurchaseOrderItem?.description || "");
      const spec = item?.PurchaseOrderItem?.specification || item?.specification || "";
      const gen = item?.PurchaseOrderItem?.generalDescription || item?.generalDescription || "";

      const specHtml = spec ? `<div style="margin-top:6px; font-size:12px; color:#333; text-align:left;">${nl2br(escapeHtml(spec))}</div>` : "";

      const genHtml = gen ? `<div style="margin-top:6px; font-size:12px; color:#333; text-align:left;">${nl2br(escapeHtml(gen))}</div>` : "";

      const unitCostDisplay = item?.formatUnitCost || (item?.unitCost ? `₱${item.unitCost.toFixed(2)}` : "");
      const amountDisplay = item?.formatAmount || (item?.amount ? `₱${item.amount.toFixed(2)}` : "");

      let row = `
        <tr>
          <td>${escapeHtml(item?.actualQuantityReceived || "")}</td>
          <td colspan="2">${escapeHtml(item?.unit || "")}</td>
          <td>${amountDisplay}</td>
          <td colspan="2">${desc}${specHtml}${genHtml}</td>
          <td colspan="2" style="text-align: center">5 years</td>
        </tr>
    `;

      if (index === itemsArray.length - 1) {
        row += `
        <tr>
          <td></td>
          <td colspan="2"></td>
          <td></td>
          <td colspan="2" style="text-align: center;"><br/>********Nothing Follows********</td>
          <td  colspan="2"></td>
        </tr>
        <tr>
          <td></td>
          <td colspan="2"></td>
          <td></td>
          <td colspan="2" style="text-align: left;">
            <br/>
            <span style="font-size:12px; color:#333;">
              <p style="font-size:12px;">Income: <span> ${ itemsArray[0]?.PurchaseOrder?.income }</span></p>
              <p style="font-size:12px;">MDS: <span>${ itemsArray[0]?.PurchaseOrder?.mds }</span></p>
              <p style="font-size:12px;">Details: <span>${ itemsArray[0]?.PurchaseOrder?.details }</span></p>
            </span>
          </td>
          <td  colspan="2"></td>
        </tr>
        `;
        row += `
          <tr>
            <td style="height: 100%"></td>
            <td colspan="2">&nbsp;</td>
            <td>&nbsp;</td>
            <td colspan="2">&nbsp;</td>
            <td colspan="2">&nbsp;</td>
          </tr>
        `;
      }
      return row;
    })
    .join("");

  return `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventory Custodian Slip</title>
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
  height: 100%;
  table-layout: fixed;
  border-collapse: collapse;

  tr.sizing-row {
    visibility: collapse;
    height: 0;
    & > td {
      &:nth-child(1) {
        width: 5%;
      }
      &:nth-child(2) {
        width: 3%;
      }
      &:nth-child(3) {
        width: 6%;
      }
      &:nth-child(4) {
        width: 8%;
      }
      &:nth-child(5) {
        width: 9%;
      }
      &:nth-child(6) {
        width: 18%;
      }
      &:nth-child(7) {
        width: 8%;
      }
      &:nth-child(8) {
        width: 5%;
      }
    }
  }
  & th,
  & td {
    border: 1px solid color-mix(in srgb, black 50%, white);
    padding: 0px 2px;
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
        &:last-child {
          & > div {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-start;
            padding: 0px;
            margin-top: 0.5rem;
            & > span {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
  & > tr.header-2nd-row {
    & > th {
      font-size: 12px;
      line-height: 1;
      &:nth-child(3) {
        padding: 2px;
        font-weight: 600;
        font-size: 14px;
      }
      &:nth-child(4) {
        padding: 2px;
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
  & > tr.header-3rd-row {
    & > th {
      font-size: 12px;
      line-height: 1;
      height: 14px;
    }
  }
}

tbody {
  & > tr {
    & > td {
      padding: 4px 2px;
      font-size: 12px;
      height: 14px;
      line-height: 1;
      align-content: start;
      border-top: none;
      border-bottom: none;
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
    &:nth-child(3) {
      & > td {
        padding: 2px 2px 20px;
        & > div {
          display: flex;
          flex-direction: column;
          gap: 42px;
          height: 100%;
          justify-content: space-between;
          & > div {
            font-size: 12px;
            &:last-child {
              display: flex;
              flex-direction: column;
              gap: 20px;
              & > span {
                font-size: 12px;
                text-align: center;
              }
            }
          }
        }
      }
    }
    &:last-child {
      & > td {
        font-size: 10px;
        padding: 4px 2px;
        border: none;
        font-style: italic;
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
                </tr>
                <tr class="header-1st-row">
                    <th colspan="8">
                        <div>
                            <div>
                                <img src="/chmsu-logo.png" alt="CHMSU Logo">
                            </div>
                            <div>
                                <span>Republic of the PHILIPPINES</span>
                                <span>Carlos Hilado Memorial State University</span>
                                <span>Inventory Custodian Slip</span>
                            </div>
                            <div>
                                <span>
                                    <span>Appendix 59</span>
                                    <span>page 1/1</span>
                                </span>
                            </div>
                        </div>
                        <div>
                            <div>
                                <span>Entity Name:</span>
                                <span>Find Cluster:</span>
                            </div>
                            <div></div>
                            <div>
                                <span>ICS No. ${escapeHtml(icsIdsDisplay)}</span>
                                <span>Date: ${itemsArray[0]?.PurchaseOrder?.dateOfDelivery || ""}</span>
                            </div>
                        </div>
                    </th>
                </tr>
                <tr class="header-2nd-row">
                    <th rowspan="2">Quantity</th>
                    <th  colspan="2" rowspan="2">Unit</th>
                    <th >Amount</th>
                    <th rowspan="2" colspan="2">Description</th>
                    <th  colspan="2">Estimated</th>
                </tr>
                <tr class="header-3rd-row">
                  <th  >Unit Cost</th>
                  <th colspan="2">Useful Life</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows}
            </tbody>
            <tfoot>
         <tr>
          <td></td>
          <td colspan="2"></td>
          <td></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
        </tr>
                <tr>
                    <td colspan="8">
                        <span style="font-weight: lighter; font-size: 12px;">
                            I hereby acknowledge receipt of the following property/ies issued for my use and for which I am responsible:
                        </span>
                    </td>
                </tr>
                <tr>
                    <td colspan="5" style="padding: 20px 0px;">
                        <div style="display: flex; flex-direction: column; padding: 2px;">
                            <div style="font-weight: 600;">Received from:</div>
                            <div style="display: flex; flex-direction: column; padding: 22px 75px; gap: 20px; height: 125px; margin-top: 5px; align-content: stretch; align-items: stretch; justify-content: flex-end; text-align: center;">
                                <span> ${signatories?.recieved_from} </span>
                                <hr style="width: 100%; margin: 5px 0;" />
                                <span style="font-weight: 600;"></span>
                                <hr style="width: 100%; margin: 5px 0;" />
                            </div>
                            <div style="text-align: center; margin: 0 auto; display: flex; flex-direction: column; gap: 3px;">
                                <span>Signature over Printed Name</span>
                                <span>Position/Office</span>
                                <span>Date:________________</span>
                            </div>
                        </div>
                    </td>
                    <td colspan="3" style="padding: 20px 0px;">
                        <div style="display: flex; flex-direction: column; padding: 2px;">
                            <div style="font-weight: 600;">Received by:</div>
                            <div style="display: flex; flex-direction: column; padding: 22px 75px; gap: 20px; height: 125px; margin-top: 5px; align-content: stretch; align-items: stretch; justify-content: flex-end; text-align: center;">
                                <span> ${signatories?.recieved_by} </span>
                                <hr style="width: 100%; margin: 5px 0;" />
                                <span style="font-weight: 600;">Custodian</span>
                                <hr style="width: 100%; margin: 5px 0;" />
                            </div>
                            <div style="text-align: center; margin: 0 auto; display: flex; flex-direction: column; gap: 3px;">
                                <span>Signature over Printed Name</span>
                                <span>Position/Office</span>
                                <span>Date:________________</span>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="8" style="border: none; font-size: 10px; padding: 4px 2px; font-style: italic;">
                        Note: This form shall be accomplished in triplicate. The original copy shall be retained by the Supply and/or Property Division/Unit, the duplicate copy for the Accounting Division/Unit and the triplicate copy for the end-user/Accountable Officer.
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</body>
</html>
`;
};

/*
<span>Date: ${itemsArray[0]?.PurchaseOrder?.dateOfDelivery || ''}</span>
<span>Date: ${itemsArray[0]?.PurchaseOrder?.dateOfPayment || ''}</span>
// line 402
     <span style="font-weight: 600;">${itemsArray[0]?.PurchaseOrder?.supplier || ""}</span>
//line 382
      <td>Total</td>
                    <td>${formatTotalAmount}</td>
                    //line 365
                     <th>Inventory</th>

                     //line 370
                       <th>Total Cost</th>
                    <th>Item No.</th>
                    //line 34
                      <td>${unitCostDisplay}</td>

*/
