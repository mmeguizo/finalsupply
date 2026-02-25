import {
  capitalizeFirstLetter,
  formatCurrencyPHP,
} from "../../utils/generalUtils";
import { escapeHtml, nl2br } from "../../utils/textHelpers";

export const getInspectionReportTemplateForIAR = (
  signatories: any,
  reportData: any,
  poOverrides?: { invoice?: string; dateOfPayment?: string }, // NEW
) => {
  // normalize input to array
  const items: any[] = Array.isArray(reportData)
    ? reportData
    : reportData
      ? [reportData]
      : [];

  const purchaseOrder = items[0]?.PurchaseOrder || {};
  const invoiceText = escapeHtml(String(items[0]?.invoice ?? ""));
  const dateOfPaymentText = escapeHtml(
    String(poOverrides?.dateOfPayment ?? purchaseOrder?.dateOfPayment ?? ""),
  );

  // helpers already imported: escapeHtml, nl2br
  const rowsHtml =
    items
      .map((it: any, idx: number) => {
        const desc = escapeHtml(
          it.description || it.PurchaseOrderItem?.description || "",
        );
        const specHtml = it.PurchaseOrderItem?.specification
          ? nl2br(it.PurchaseOrderItem.specification)
          : "";
        const genDescHtml = it.PurchaseOrderItem?.generalDescription
          ? nl2br(it.PurchaseOrderItem.generalDescription)
          : "";

        const qty = escapeHtml(
          String(it.actualQuantityReceived ?? it.quantity ?? ""),
        );
        const unit = escapeHtml(it.unit ?? "");
        const unitCost = escapeHtml(
          String(it.unitCost ?? it.PurchaseOrderItem?.unitCost ?? ""),
        );
        const amount = escapeHtml(
          String(
            (it.actualQuantityReceived ?? it.quantity ?? "") *
              (it.unitCost ?? it.PurchaseOrderItem?.unitCost ?? ""),
          ),
        );
        // const amount = escapeHtml(
        //   String(it.amount ?? it.PurchaseOrderItem?.amount ?? "")
        // );

        return `
        <tr>
          <td style="padding:4px; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;">${idx + 1}</td>
          <td style="padding:4px ; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;">${unit}</td>
          <td colspan="3" style="padding:6px; text-align:left; vertical-align:top; ; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;">
            ${desc}
            ${specHtml ? `<div style="margin-top:6px; color:#333; font-size:12px; text-align:left;">${specHtml}</div>` : ""}
            ${genDescHtml ? `<div style="margin-top:6px; color:#333; font-size:12px; text-align:left;">${genDescHtml}</div>` : ""}
          </td>
          <td style="padding:4px; text-align:right; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;">${qty}</td>
          <td style="padding:4px; text-align:right; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;">${formatCurrencyPHP(unitCost)}</td>
          <td style="padding:4px; text-align:right; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;">${formatCurrencyPHP(amount)}</td>
        </tr>
      `;
      })
      .join("\n") +
    (items.length
      ? `
      <tr>
        <td style="padding:4px; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;"></td>
        <td style="padding:4px; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;"></td>
        <td colspan="3" style="padding:4px; text-align:center; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;">
          <span style="font-size:12px; color:#333;">*****Nothing Follows*****</span>
        </td>
        <td style="padding:4px; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;"></td>
        <td style="padding:4px; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;"></td>
        <td style="padding:4px; border-left: 1px solid #000;   border-right: 1px solid #000;border-top: none;border-bottom: none; padding: 0px;"></td>
      </tr>
      ${
        items[0]?.income || items[0]?.mds || items[0]?.details
          ? `
      <tr>
        <td style="padding:4px; border-left: 1px solid #000; border-right: 1px solid #000; border-top: none; border-bottom: none;"></td>
        <td style="padding:4px; border-left: 1px solid #000; border-right: 1px solid #000; border-top: none; border-bottom: none;"></td>
        <td colspan="3" style="padding:4px; text-align:left; border-left: 1px solid #000; border-right: 1px solid #000; border-top: none; border-bottom: none;">
          <span style="font-size:12px; color:#333;">
            ${items[0]?.income ? `<p style="font-size:12px;">Income: <span>${capitalizeFirstLetter(items[0].income)}</span></p>` : ""}
            ${items[0]?.mds ? `<p style="font-size:12px;">MDS: <span>${capitalizeFirstLetter(items[0].mds)}</span></p>` : ""}
            ${items[0]?.details ? `<p style="font-size:12px;">Details: <span>${capitalizeFirstLetter(items[0].details)}</span></p>` : ""}
          </span>
        </td>
        <td style="padding:4px; border-left: 1px solid #000; border-right: 1px solid #000; border-top: none; border-bottom: none;"></td>
        <td style="padding:4px; border-left: 1px solid #000; border-right: 1px solid #000; border-top: none; border-bottom: none;"></td>
        <td style="padding:4px; border-left: 1px solid #000; border-right: 1px solid #000; border-top: none; border-bottom: none;"></td>
      </tr>
      `
          : ""
      }
    `
      : "");

  const totalAmount = items.reduce(
    (sum, it) =>
      sum + Number(it?.actualQuantityReceived ?? 0) * Number(it?.unitCost ?? 0),
    0,
  );

  console.log;

  const formattedTotal =
    items[0]?.formatAmount ?? formatCurrencyPHP(totalAmount) ?? "";

  const overallComplete =
    items.length && items.every((i) => i.iarStatus === "complete");
  const overallPartial = items.some((i) => i.iarStatus === "partial");

  console.log("Overall Complete:", reportData, overallComplete);

  return `
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Inspection & Acceptance Report</title>
      <link rel="stylesheet" href="./assets/styles/main.css" />
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

    /* .page {
      width: 210mm;
      height: 297mm;
      margin: 0 auto;
      border: 1px solid #000;
      padding: 0.25in;
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
            width: 7%;
          }
          &:nth-child(3),
          &:nth-child(4) {
            width: 18%;
          }
          &:nth-child(5) {
            width: 16%;
          }
          &:nth-child(6),
          &:nth-child(7) {
            width: 11%;
          }
          &:nth-child(8) {
            width: 12%;
          }
        }
      }
      & th,
      & td {
        border: 1px solid #000;
        padding: 0px;
      }
      & th {
        white-space: nowrap;
      }

      & thead {
        & .tbl-headings th {
          padding: 1px 0px;
        }
        & tr:not(:last-child) > th {
          text-align: left;
          padding: 0px 6px;
        }
        & tr > th[colspan="8"] > div {
          display: flex;
          flex-direction: column;
          padding: 4px 0px;
          position: relative;
          gap: 0.5em;
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
              & h3 {
                font-size: 16px;
                font-weight: 600;
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
            grid-template-columns: 2fr 4fr 2fr;
            grid-template-rows: 2.5em;
            & > div:nth-child(2) {
              display: grid;
              justify-content: center;
              align-items: end;
            }
            & > div:last-child {
              display: grid;
              justify-content: end;
              align-items: start;
            }
          }

          & > div:nth-child(3) {
            position: absolute;
            top: 3px;
            right: 0px;
            font-family: serif;
            font-style: italic;
            font-weight: bold;
            font-size: 16px;
          }
        }
      }

      & tbody {
        & td {
          padding: 1px;
        }
      }

      & tfoot {
        & tr.total-row {
          & > td {
            padding: 1px 2px;
          }
        }
        & tr:not(.total-row) > td {
          padding: 20px 0px;
          & > div {
            display: flex;
            flex-direction: column;
            padding: 2px;
            & > div {
              display: flex;
              flex-direction: column;
              & > div {
                display: flex;
              }
              &:nth-child(2) {
                flex-direction: column;
                padding: 20px 35px;
                gap: 20px;
                align-items: flex-start;
                height: 150px;
                margin-top: 5px;
                > div {
                  flex-direction: row;
                  justify-content: space-evenly;
                  align-items: center;
                  width: 100%;
                  gap: 4px;
                  & > div {
                    flex-direction: row;
                    height: 50px;
                    aspect-ratio: 1 / 1;
                    border: 1px dotted black;
                  }
                  &:has(.sm-box) {
                    & > div {
                      width: 40px;
                      height: unset;
                      aspect-ratio: 3 / 2;
                    }
                    & > p {
                      width: 65px;
                    }
                  }
                }
              }
              &:nth-child(3) {
                margin-top: 10px;
                width: 75%;
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
              <td></td>
              <td></td>
            </tr>
            <tr>
              <th colspan="8">
                <div>
                  <div>
                    <div>
                      <img src="/chmsu-logo.png" style="margin-top:10px" alt="CHMSU Logo" />
                    </div>
                    <div>
                      <h4>REPUBLIC OF THE PHILIPPINES</h4>
                      <h3>CARLOS HILADO MEMORIAL STATE UNIVERSITY</h3>
                      <h4>INSPECTION & ACCEPTANCE REPORT</h4>
                    </div>
                    <div></div>
                  </div>
                  <div>
                    <div></div>
                    <div>No. ${reportData[0]?.iarId} </div>
                    <div>Page 1 of 1</div>
                  </div>
                  <div>Appendix 62</div>
                </div>
              </th>
            </tr>
            <tr>
              <th colspan="2">Supplier:</th>
              <th colspan="6">${reportData[0]?.PurchaseOrder?.supplier || ""}</th>
            </tr>
            <tr>
              <th colspan="2">PO # & Date:</th>
               <th>${reportData[0]?.PurchaseOrder?.poNumber || ""}</th>
              <th>${reportData[0]?.PurchaseOrder?.dateOfDelivery || ""}</th>
              <th>Invoice# & Date:</th>
              <th colspan="2">${invoiceText} </th>
               <th>${dateOfPaymentText}</th>
            </tr>
            <tr>
              <th colspan="3">Requisitioning Office/Department:</th>
              <th colspan="5">${reportData[0]?.PurchaseOrder?.placeOfDelivery || ""}</th>
            </tr>
            <tr class="tbl-headings">
              <th>Item #</th>
              <th>Unit</th>
              <th colspan="3">Description</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td></td>
              <td></td>
              <td colspan="4"></td>
              <td>Total</td>
             <td>${escapeHtml(String(formattedTotal))}</td>
            </tr>
            <tr>
             <td colspan="4">
                <div>
                  <div>Date Inspected:______</div>
                  <div>
                    <div>
                      <div></div>
                      <p>Inspected, verified and found in order as to quantity and specification</p>
                    </div>
                  </div>
                  <div>
                   ${capitalizeFirstLetter(signatories?.recieved_by) || ""}
                    <hr />
                    Inspection Officer
                  </div>
                </div>
              </td>
              <td colspan="4">
                <div>
                  <div>Date Received: _____</div>
                  <div style="display:flex; flex-direction:column; gap:6px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <div style=" height: 40px; aspect-ratio:3/2; flex: 0; border:1px dotted black; background:${overallComplete ? "#ccc" : "transparent"}; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold;">
                          ${overallComplete ? "✓" : ""}
                        </div>
                        <p style="margin:0; width:65px;">Complete</p>
                      </div>

                      <div style="display:flex; align-items:center; gap:8px;">
                        <div style=" height: 40px; aspect-ratio:3/2; flex: 0; border:1px dotted black; background:${overallPartial ? "#ccc" : "transparent"}; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold;">
                          ${overallPartial ? "✓" : ""}
                        </div>
                        <p style="margin:0; width:65px;">Partial</p>
                      </div>
                  </div>
                  <div>
                    ${capitalizeFirstLetter(signatories?.recieved_from) || ""}
                    <hr />
                     Property and Supply Management Officer
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
