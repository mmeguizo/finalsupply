
export const getInspectionReportTemplateForPrinting = (signatories: any, reportData: any) => {
  const itemsArray = Array.isArray(reportData)
    ? reportData.filter(item => item !== null && item !== undefined)
    : [];

  const firstItem = itemsArray[0];
  const purchaseOrder = firstItem?.PurchaseOrder;

  const supplier = purchaseOrder?.supplier || '';
  const poNumber = purchaseOrder?.poNumber || '';
  const invoice = purchaseOrder?.invoice || '';
  const department = purchaseOrder?.placeOfDelivery || '';

  const poDate = purchaseOrder.dateOfPayment || '';
  // const poDate = purchaseOrder?.dateOfPayment ? formatTimestampToDateTimeForPrinting(purchaseOrder.dateOfPayment) : '';
  const invoiceDate = purchaseOrder?.dateOfDelivery || '';
  // const invoiceDate = purchaseOrder?.dateOfDelivery ? formatTimestampToDateTimeForPrinting(purchaseOrder.dateOfDelivery) : '';
  const dateInspected = purchaseOrder?.dateOfDelivery || '';
  // const dateInspected = purchaseOrder?.dateOfDelivery ? formatTimestampToDateTimeForPrinting(purchaseOrder.dateOfDelivery) : '';
  const dateReceived = purchaseOrder?.dateOfDelivery ||  '';
  // const dateReceived = purchaseOrder?.dateOfDelivery ? formatTimestampToDateTimeForPrinting(purchaseOrder.dateOfDelivery) : '';

  const airId = reportData[0]?.iarId
  || '';

  const totalAmount = itemsArray.reduce((sum, item) => {
    return sum + (item?.amount || 0);
  }, 0);
  const formatTotalAmount = `₱${totalAmount.toFixed(2)}`;

  const isComplete = purchaseOrder?.status === "completed";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Inspection & Acceptance Report</title>
      <style>
        /* Normalize/Reset styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-weight: normal;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          font-size: 14px;
        }

        /* Table styles */
        table {
          width: 100%;
          height: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          border: 1px solid #000;
        }

        table th, table td {
          border: 1px solid #000;
          padding: 0px;
        }
        table th {
          white-space: nowrap;
          text-align: left;
        }

        /* Sizing row for column widths */
        table tr.sizing-row {
          visibility: collapse;
          height: 0;
        }
        table tr.sizing-row td:nth-child(1), table tr.sizing-row td:nth-child(2) { width: 7%; }
        table tr.sizing-row td:nth-child(3), table tr.sizing-row td:nth-child(4) { width: 18%; }
        table tr.sizing-row td:nth-child(5) { width: 16%; }
        table tr.sizing-row td:nth-child(6), table tr.sizing-row td:nth-child(7) { width: 11%; }
        table tr.sizing-row td:nth-child(8) { width: 12%; }

        /* Table Headings */
        table thead .tbl-headings th { padding: 1px 0px; text-align: center; }
        table thead tr:not(.tbl-headings):not(.sizing-row) th { text-align: left; padding: 0px 6px; }

        /* Header section (logo, university info, report title) */
        table thead tr > th[colspan="8"] > div {
          display: flex;
          flex-direction: column;
          padding: 4px 0px;
          position: relative;
          gap: 0.5em;
        }
        table thead tr > th[colspan="8"] > div > div:nth-child(1) {
          flex-grow: 1;
          display: grid;
          grid-template-columns: 2fr 4fr 2fr;
          grid-template-rows: 90px;
          align-items: center;
          text-align: center;
        }
        table thead tr > th[colspan="8"] > div > div:nth-child(1) > div:nth-child(2) {
          display: grid;
          place-items: center;
        }
        table thead tr > th[colspan="8"] > div > div:nth-child(1) > div:nth-child(2) h4 { font-size: 14px; font-weight: normal; }
        table thead tr > th[colspan="8"] > div > div:nth-child(1) > div:nth-child(2) h3 { font-size: 16px; font-weight: 600; }
        
        /* Specific image styling for the logo */
        .chmsu-logo-print {
          width: 100px; /* Adjust this value as needed */
          height: auto; /* Maintain aspect ratio */
          object-fit: contain;
          margin-top: 10px; /* Keep the margin-top */
        }
        /* Override the general image rule if it's still being applied */
        table thead tr > th[colspan="8"] > div > div:nth-child(1) img:not(.chmsu-logo-print) {
             /* Add rules here if you have other images in this block that need different sizing */
        }


        /* RIS No. and Page */
        table thead tr > th[colspan="8"] > div > div:nth-child(2) {
          flex-grow: 1;
          display: grid;
          grid-template-columns: 2fr 4fr 2fr;
          grid-template-rows: 2.5em;
        }
        table thead tr > th[colspan="8"] > div > div:nth-child(2) > div:nth-child(2) {
          display: grid;
          justify-content: center;
          align-items: end;
        }
        table thead tr > th[colspan="8"] > div > div:nth-child(2) > div:last-child {
          display: grid;
          justify-content: end;
          align-items: start;
        }

        /* Appendix */
        table thead tr > th[colspan="8"] > div > div:nth-child(3) {
          position: absolute;
          top: 3px;
          right: 0px;
          font-family: serif;
          font-style: italic;
          font-weight: bold;
          font-size: 16px;
        }

        /* Table Body */
        table tbody td { padding: 1px; text-align: left; }
        table tbody td:nth-child(1), table tbody td:nth-child(2),
        table tbody td:nth-child(6), table tbody td:nth-child(7), table tbody td:nth-child(8) {
            text-align: center;
        }

        /* Table Foot (Total row) */
        table tfoot tr.total-row td { padding: 1px 2px; }
        table tfoot tr.total-row td:last-child { text-align: center; }

        /* Signatories and Status boxes */
        table tfoot tr:not(.total-row) > td { padding: 20px 0px; vertical-align: top; }
        table tfoot tr:not(.total-row) > td > div {
          display: flex;
          flex-direction: column;
          padding: 2px;
        }
        table tfoot tr:not(.total-row) > td > div > div { display: flex; flex-direction: column; }
        table tfoot tr:not(.total-row) > td > div > div > div { display: flex; }
        table tfoot tr:not(.total-row) > td > div > div:nth-child(2) {
          flex-direction: column;
          padding: 20px 35px;
          gap: 20px;
          align-items: flex-start;
          height: 150px;
          margin-top: 5px;
        }
        table tfoot tr:not(.total-row) > td > div > div:nth-child(2) > div {
          flex-direction: row;
          justify-content: space-evenly;
          align-items: center;
          width: 100%;
          gap: 4px;
        }
        table tfoot tr:not(.total-row) > td > div > div:nth-child(2) > div > div {
          flex-direction: row;
          height: 50px;
          aspect-ratio: 1 / 1;
          border: 1px dotted black;
        }

        /* Specific styles for sm-box and its text */
        .sm-box {
          width: 40px;
          height: unset;
          aspect-ratio: 3 / 2;
          border: 1px dotted black;
          display: block;
        }
        .sm-box + p {
          width: 65px;
          margin-left: 5px;
        }

        table tfoot tr:not(.total-row) > td > div:nth-child(3) {
          margin-top: 10px;
          width: 75%;
          text-align: center;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        table tfoot hr {
            width: 100%;
            margin: 5px 0;
            border: none;
            border-top: 1px solid #000;
        }

        /* Print-specific media queries */
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          html, body {
            visibility: visible !important;
          }
          .page {
            visibility: visible !important;
            position: static !important;
            width: auto;
            height: auto;
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <table>
          <thead>
            <tr class="sizing-row">
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr>
              <th colspan="8">
                <div>
                  <div>
                    <div>
                      <img src="chmsu-logo.png" class="chmsu-logo-print" style="margin-top:20px" alt="CHMSU Logo" />
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
                    <div>No. ${airId}</div>
                    <div>Page 1 of 1</div>
                  </div>
                  <div>Appendix 62</div>
                </div>
              </th>
            </tr>
            <tr>
              <th colspan="2">Supplier:</th>
              <th colspan="6">${supplier}</th>
            </tr>
            <tr>
              <th colspan="2">PO # & Date:</th>
                <th>${poNumber}</th>
              <th>${poDate}</th>
              <th>Invoice & Date:</th>
              <th colspan="2">${invoice}</th>
                <th>${invoiceDate}</th>
            </tr>
            <tr>
              <th colspan="3">Office/Department:</th>
              <th colspan="5">${department}</th>
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
            ${itemsArray.map((item: any, index: any) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.unit || ''}</td>
                <td colspan="3">${item.description || ''}</td>
                <td>${item.quantity || ''}</td>
                <td>${item.unitCost || ''}</td>
                <td>${item.amount || ''}</td>
              </tr>
            `).join('')}
            ${itemsArray.length === 0 ? `
              <tr>
                <td></td>
                <td></td>
                <td colspan="3"></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ` : ''}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td></td>
              <td></td>
              <td colspan="4"></td>
              <td>Total</td>
              <td>${formatTotalAmount}</td>
            </tr>
            <tr>
              <td colspan="4">
                <div>
                  <div>Date Inspected: ${dateInspected}</div>
                  <div>
                    <div>
                      <div></div>
                      <p>Inspected, verified and found in order as to quantity and specification</p>
                    </div>
                  </div>
                  <div>
                    ${signatories?.inspectionOfficer || 'Inspection Officer'}
                    <hr />
                    Inspection Officer
                  </div>
                </div>
              </td>
              <td colspan="4">
                <div>
                  <div>Date Received: ${dateReceived}</div>
                  <div>
                    <div>
                      <div class="sm-box" style="background-color: ${isComplete ? '#ccc' : 'transparent'};"></div>
                      <p>Complete</p>
                    </div>
                    <div>
                      <div class="sm-box" style="background-color: ${!isComplete ? '#ccc' : 'transparent'};"></div>
                      <p>Partial</p>
                    </div>
                  </div>
                  <div>
                    ${signatories?.supplyOfficer || 'Property and Supply Management Officer'}
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