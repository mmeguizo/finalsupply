import { capitalizeFirstLetter, formatCurrencyPHP } from '../../utils/generalUtils';
import { escapeHtml, nl2br } from '../../utils/textHelpers';

/**
 * getNoCategoryPrintTemplate
 * --------------------------
 * Generates an HTML string for printing NC (No Category) issuance items.
 *
 * This is the same Appendix 62 IAR form layout, but uses `ncId` instead of `iarId`.
 *
 * Flow:
 * 1. Receives signatories, reportData (array of items), and optional purpose/details.
 * 2. Builds HTML item rows with description, spec, qty, unit cost, amount.
 * 3. Calculates total from qty × unitCost.
 * 4. Returns a complete HTML document string ready for `window.open().document.write()`.
 *
 * @param signatories  - Object with `recieved_by` (inspection officer) and `recieved_from` (supply officer)
 * @param reportData   - Single item or array of IAR items with NC assignment
 * @param purpose      - Optional purpose text to display on the form
 * @param details      - Optional additional details text
 */
export const getNoCategoryPrintTemplate = (
  signatories: any,
  reportData: any,
  purpose?: string,
  details?: string
) => {
  // Normalize input to array
  const items: any[] = Array.isArray(reportData) ? reportData : reportData ? [reportData] : [];

  const purchaseOrder = items[0]?.PurchaseOrder || {};
  const invoiceText = escapeHtml(String(items[0]?.invoice ?? purchaseOrder?.invoice ?? ''));
  const dateOfPaymentText = escapeHtml(
    String(items[0]?.invoiceDate ?? purchaseOrder?.dateOfPayment ?? '')
  );

  // Build item rows HTML
  const rowsHtml =
    items
      .map((it: any, idx: number) => {
        const desc = escapeHtml(it.description || it.PurchaseOrderItem?.description || '');
        const specHtml = it.PurchaseOrderItem?.specification
          ? nl2br(it.PurchaseOrderItem.specification)
          : '';
        const genDescHtml = it.PurchaseOrderItem?.generalDescription
          ? nl2br(it.PurchaseOrderItem.generalDescription)
          : '';

        const qty = escapeHtml(String(it.actualQuantityReceived ?? it.quantity ?? ''));
        const unit = escapeHtml(it.unit ?? '');
        const unitCost = escapeHtml(String(it.unitCost ?? it.PurchaseOrderItem?.unitCost ?? ''));
        const amount = escapeHtml(
          String(
            (it.actualQuantityReceived ?? it.quantity ?? 0) *
              (it.unitCost ?? it.PurchaseOrderItem?.unitCost ?? 0)
          )
        );

        return `
        <tr>
          <td style="text-align:center; padding:3px 4px; vertical-align:top; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;">${idx + 1}</td>
          <td style="text-align:center; padding:3px 4px; vertical-align:top; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;">${unit}</td>
          <td colspan="3" style="text-align:left; vertical-align:top; padding:4px 8px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;">
            ${desc}
            ${specHtml ? `<div style="margin-top:4px; font-size:12px; color:#555;">${specHtml}</div>` : ''}
            ${genDescHtml ? `<div style="margin-top:4px; font-size:12px; color:#555;">${genDescHtml}</div>` : ''}
          </td>
          <td style="text-align:center; padding:3px 6px; vertical-align:top; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;">${qty}</td>
          <td style="text-align:right; padding:3px 6px; vertical-align:top; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;">${formatCurrencyPHP(unitCost)}</td>
          <td style="text-align:right; padding:3px 6px; vertical-align:top; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;">${formatCurrencyPHP(amount)}</td>
        </tr>
      `;
      })
      .join('\n') +
    (items.length
      ? `
      <tr>
        <td style="padding:3px 4px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
        <td style="padding:3px 4px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
        <td colspan="3" style="padding:4px 8px; text-align:center; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;">
          <span style="font-size:12px; color:#333;">*****Nothing Follows*****</span>
        </td>
        <td style="padding:3px 6px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
        <td style="padding:3px 6px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
        <td style="padding:3px 6px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
      </tr>
      ${
        items[0]?.income || items[0]?.mds || items[0]?.details || purpose || details
          ? `
      <tr>
        <td style="padding:3px 4px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
        <td style="padding:3px 4px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
        <td colspan="3" style="padding:4px 8px; text-align:left; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;">
          <span style="font-size:12px; color:#333;">
            ${items[0]?.income ? `<p style="font-size:12px;">Income: <span>${capitalizeFirstLetter(items[0].income)}</span></p>` : ''}
            ${items[0]?.mds ? `<p style="font-size:12px;">MDS: <span>${capitalizeFirstLetter(items[0].mds)}</span></p>` : ''}
            ${items[0]?.details ? `<p style="font-size:12px;">Details: <span>${capitalizeFirstLetter(items[0].details)}</span></p>` : ''}
            ${purpose ? `<p style="font-size:12px;">Purpose: <span>${escapeHtml(purpose)}</span></p>` : ''}
            ${details ? `<p style="font-size:12px;">Additional Details: <span>${escapeHtml(details)}</span></p>` : ''}
          </span>
        </td>
        <td style="padding:3px 6px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
        <td style="padding:3px 6px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
        <td style="padding:3px 6px; border-left:1px solid #000; border-right:1px solid #000; border-top:none; border-bottom:none;"></td>
      </tr>
      `
          : ''
      }
    `
      : '');

  const totalAmount = items.reduce(
    (sum, it) => sum + Number(it?.actualQuantityReceived ?? 0) * Number(it?.unitCost ?? 0),
    0
  );

  const formattedTotal = formatCurrencyPHP(totalAmount) ?? '';

  const overallComplete = items.length > 0 && items.every((i) => i.iarStatus === 'complete');
  const overallPartial = items.some((i) => i.iarStatus === 'partial');

  return `
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>No Category Issuance Report</title>
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
                    <div>No. ${items[0]?.ncId ?? ''}</div>
                    <div>Page 1 of 1</div>
                  </div>
                  <div>Appendix 62</div>
                </div>
              </th>
            </tr>
            <tr>
              <th colspan="2">Supplier:</th>
              <th colspan="6">${escapeHtml(purchaseOrder?.supplier || '')}</th>
            </tr>
            <tr>
              <th colspan="2">PO # & Date:</th>
              <th>${escapeHtml(purchaseOrder?.poNumber || '')}</th>
              <th>${escapeHtml(purchaseOrder?.dateOfDelivery || '')}</th>
              <th>Invoice# & Date:</th>
              <th colspan="2">${invoiceText}</th>
              <th>${dateOfPaymentText}</th>
            </tr>
            <tr>
              <th colspan="3">Requisitioning Office/Department:</th>
              <th colspan="5">${escapeHtml(purchaseOrder?.placeOfDelivery || '')}</th>
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
                      <p>Inspected, verified and found OK<br/>as to quantity and specification</p>
                    </div>
                  </div>
                  <div>
                    ${capitalizeFirstLetter(signatories?.inspection_officer) || ''}
                    <hr />
                    Printed Name & Signature of Inspection Officer
                  </div>
                </div>
              </td>
              <td colspan="4">
                <div>
                  <div>Date Received: _____</div>
                  <div style="display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div style="height: 40px; aspect-ratio:3/2; flex: 0; border:1px dotted black; background:${overallComplete ? '#ccc' : 'transparent'}; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold;">
                        ${overallComplete ? '✓' : ''}
                      </div>
                      <p style="margin:0; width:65px;">Complete</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div style="height: 40px; aspect-ratio:3/2; flex: 0; border:1px dotted black; background:${overallPartial ? '#ccc' : 'transparent'}; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold;">
                        ${overallPartial ? '✓' : ''}
                      </div>
                      <p style="margin:0; width:65px;">Partial</p>
                    </div>
                  </div>
                  <div style="margin-top:10px; width:75%; text-align:center; margin:10px auto 0; display:flex; flex-direction:column; gap:3px;">
                    ${capitalizeFirstLetter(signatories?.recieved_from) || ''}
                    <hr />
                    ${escapeHtml(signatories?.recieved_from_designation || 'Supply Officer III')}
                  </div>
                  <div style="margin-top:20px; width:75%; text-align:center; margin:20px auto 0; display:flex; flex-direction:column; gap:3px;">
                    ${capitalizeFirstLetter(signatories?.recieved_by) || ''}
                    <hr />
                    Printed name & Signature of End-User
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
