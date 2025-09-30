export const getPropertyAcknowledgementReciept = (signatories: any, reportData: any) => {
  // Check if reportData is an array, if not, convert it to an array for consistent handling
  console.log("getPropertyAcknowledgementReciept", signatories, reportData);
  const itemsArray = Array.isArray(reportData) ? reportData : [reportData];

  const { recieved_from, recieved_by, metadata } = signatories;
  const { position: recievedFromPosition, role: recievedFromRole } = metadata?.recieved_from || {};
  const { position: recievedByPosition, role: recievedByRole } = metadata?.recieved_by || {};

  const escapeHtml = (str: any) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const nl2br = (s: any) => escapeHtml(s).replace(/\r\n|\r|\n/g, "<br/>");

  // Currency formatter for PHP with thousand separators
  const formatCurrency = (value: any) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Collect all unique PAR IDs from the items
  const parIds = Array.from(new Set(itemsArray.map((item: any) => item?.parId).filter((id: any) => !!id)));
  const parIdsDisplay = parIds.length ? parIds.join(", ") : "";

  // Generate rows for each item, include specification & generalDescription with newline -> <br/> and a small space
  const itemRows = itemsArray
    .map((item, index) => {
      const desc = escapeHtml(item.description || item.PurchaseOrderItem?.description || "");
      const spec = item.PurchaseOrderItem?.specification || item.specification || "";
      const gen = item.PurchaseOrderItem?.generalDescription || item.generalDescription || "";

      const specHtml = spec ? `<div style="margin-top:6px; font-size:12px; color:#333; text-align:left;">${nl2br(spec)}</div>` : "";
      const genHtml = gen ? `<div style="margin-top:6px; font-size:12px; color:#333; text-align:left;">${nl2br(gen)}</div>` : "";

      let row = `
        <tr>
          <td>${escapeHtml(item.inventoryNumber || "")}</td>
          <td>${escapeHtml(item.quantity || "")}</td>
          <td>${escapeHtml(item.unit || "")}</td>
          <td colspan="2">
            ${desc}
            ${specHtml}
            ${genHtml}
          </td>
          <td>${escapeHtml(formatCurrency(item.unitCost))}</td>
          <td>${escapeHtml(formatCurrency(item.amount))}</td>
        </tr>
      `;

      // If this is the LAST item, append "Nothing Follows"
      if (index === itemsArray.length - 1) {
        row += `
        <tr>
          <td></td>
          <td></td>
          <td style="text-align: center;">*****Nothing Follows*****</td>
          <td colspan="2"></td>
          <td></td>
          <td></td>
        </tr>
        `;

        for (let i = 0; i < 1; i++) {
          // <-- you can make this 200 if needed
          row += `
          <tr>
            <td style="height: 100%"></td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td colspan="2">&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          `;
        }
      }

      return row;
    })
    .join("");

  // Get the first item for header information
  const firstItem = itemsArray[0] || {};
  // Note: We display all PAR IDs instead of the PO number in the header
  const poNumber = firstItem.PurchaseOrder?.poNumber || "";
  const supplier = firstItem.PurchaseOrder?.supplier || "";
  const dateOfDelivery = firstItem.PurchaseOrder?.dateOfDelivery || "";
  const dateOfPayment = firstItem.PurchaseOrder?.dateOfPayment || "";

  // Calculate totals
  const totalUnitCost = itemsArray.reduce((sum, item) => sum + (parseFloat(item.unitCost) || 0), 0);
  const totalAmount = itemsArray.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  // Format totals
  const formatTotalUnitCost = isNaN(totalUnitCost) ? "" : formatCurrency(totalUnitCost);
  const formatTotalAmount = isNaN(totalAmount) ? "" : formatCurrency(totalAmount);

  return `
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Property Acknowledgement Receipt</title>
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
  overflow: hidden;page-break-after: always;
} */

table {
  width: 100%;
  height: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border: 1px solid #000;
  tr.sizing-row {
    visibility: collapse;
    height: 0;
    & > td {
      &:nth-child(1),
      &:nth-child(2) {
        width: 11%;
      }
      &:nth-child(3) {
        width: 28%;
      }
      &:nth-child(5) {
        width: 25%;
      }
      &:nth-child(5) {
        width: 11%;
      }
      &:nth-child(6) {
        width: 14%;
      }
    }
  }
  & :not(tbody) td {
    border: 1px solid #000;
    padding: 0px;
  }
  & th {
    border: 1px solid #000;
    white-space: normal; /* Change from nowrap to normal */
    word-wrap: break-word; /* Add this to ensure long words break */
  }

  & thead {
    & .tbl-headings th {
      padding: 1px 0px;
      font-weight: 600;
      font-size: 12px; /* Adjust size if needed */
      text-align: center; /* Center the text */
      vertical-align: middle; /* Vertically center the text */
      height: auto; /* Allow height to adjust to content */
    }
    & tr > th[colspan="7"] > div {
      display: flex;
      flex-direction: column;
      padding: 4px 0px;
      position: relative;
      gap: 0.25em;
      & > div:nth-child(1) {
        flex-grow: 1;
        display: grid;
        grid-template-columns: 2fr 4fr 2fr;
        grid-template-rows: 90px;
        align-items: center;
        text-align: center;
        & > div:nth-child(2) {
          display: grid;
          place-items: center;
          & > * {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          }
          & h3 {
            font-size: 18px;
            font-weight: 600;
          }
          & *:not(:last-child) {
            font-style: italic;
          }
          & *:first-child {
            font-size: 15px;
          }
          & *:last-child {
            font-weight: 600;
            font-size: 16px;
          }
        }

        & img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      & > div:nth-child(2) {
        flex-grow: 1;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: 3em;
        & > div:nth-child(2) {
          display: grid;
          justify-content: center;
          align-items: end;
        }
        & > div:last-child {
          display: grid;
          justify-content: start;
          align-items: center;
          font-weight: 600;
        }
      }

      & > div:nth-child(3) {
        position: absolute;
        top: 3px;
        right: 3px;
        text-align: right;
        & > p:first-child {
          font-family: serif;
          font-style: italic;
          font-weight: bold;
          font-size: 16px;
        }
        & > p:last-child {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          font-size: 12px;
        }
      }
    }
  }

  & tbody {
    & td {
      padding: 1px;
      align-content: start;
      border: 1px red #000 !important
      & p {
        line-height: 1 !important;
      }
    }
  }

  & tfoot {
    & tr.total-row {
      & > td {
        padding: 1px 2px;
        &:nth-child(3) {
          padding-left: 14%;
          font-weight: 600;
        }
      }
    }
    & tr:is(.total-row, .total-row + tr, .total-row + tr + tr) > td {
      height: 19.76px;
    }
    & tr:is(.total-row + tr, ) > td {
      padding-left: 1em;
      font-weight: 600;
    }
    & tr:not(.total-row, .total-row + tr, .total-row + tr + tr) > td {
      padding: 1px 1px 16px 1px;
      & > div {
        display: flex;
        flex-direction: column;
        padding: 2px;
        & > div {
          display: flex;
          flex-direction: column;
          font-weight: 600;
          & > div {
            display: flex;
          }
          &:nth-child(2) {
            display: flex;
            flex-direction: column;
            padding: 22px 75px;
            gap: 20px;
            height: 125px;
            margin-top: 5px;
            align-content: stretch;
            align-items: stretch;
            justify-content: flex-end;
            text-align: center;
            & > div {
              display: flex;
              flex-direction: column;
              &  p {
                font-weight: 600;
              }
              & hr {
                height: calc(1rem - 2px);
                border: none;
                border-bottom: 2px solid #000;
                &:last-child {
                  margin-top: 0.25rem;
                  margin-bottom: 1.25rem;
                }
              }
            }
          }
          &:nth-child(3) {
            text-align: center;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
        }
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
        </tr>
        <tr>
          <th colspan="7">
            <div>
              <div>
                <div>
                  <img src="/chmsu-logo.png" alt="CHMSU Logo" />
                </div>
                <div>
                  <h4>REPUBLIC OF THE PHILIPPINES</h4>
                  <h3>CARLOS HILADO MEMORIAL STATE UNIVERSITY</h3>
                  <h4>PROPERTY ACKNOWLEDGEMENT RECEIPT</h4>
                </div>
                <div></div>
              </div>
              <div>
                <div></div>
                <div></div>
                <div>PAR#: ${escapeHtml(parIdsDisplay)}</div>
              </div>
              <div>
                <p>Appendix 71</p>
                <p>page 1/1</p>
              </div>
            </div>
          </th>
        </tr>
        <tr class="tbl-headings">
          <th>Inventory Number</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th colspan="2">Description and Property Number</th>
          <th>Unit Price</th>
          <th>Total Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td></td>
          <td></td>
          <td></td>
          <td colspan="2">Total</td>
          <td>${formatTotalUnitCost}</td>
          <td>${formatTotalAmount}</td>
        </tr>
        <tr>
          <td colspan="7">Remarks:</td>
        </tr>
        <tr>
          <td colspan="7"></td>
        </tr>
        <tr>
          <td colspan="3">
            <div>
              <div>Received from:</div>
              <div>
                <div>
                  <p>${recieved_from}</p>
                   <hr>
                  <p>Signature over Printed Name</p>
                </div>
                <div>
               ${recievedFromRole}
                   <hr>
                  <p>Position / Office</p>
                </div>
              </div>
              <div>
                Date:___________
              </div>
            </div>
          </td>
          <td colspan="4">
            <div>
              <div>Received by:</div>
              <div>
                <div>
                  <p>${recieved_by}</p>
                   <hr>
                  <p>Signature over Printed Name</p>
                </div>
                <div>
                  ${recievedByPosition}
                   <hr>
                  <p>Position / Office</p>
                </div>
              </div>
              <div>
                Date: ____________
              </div>
            </div>
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

 {
    recieved_from: 'ram buyco',
    recieved_by: 'test',
    metadata: {
      recieved_from: { position: '', role: 'Recieved From' },
      recieved_by: { position: 'supply tester', role: '' }
    }
  }
*/
