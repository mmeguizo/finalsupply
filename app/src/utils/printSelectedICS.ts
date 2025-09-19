export const printSelectedICS = (icsData: any) => {
    let data: any;
    if (typeof icsData === "object" && !icsData.icsData) {
        // put the object into an array
        data = [icsData];
    } else {
        // put the array into an object
        data = icsData.icsData;
    }
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print Inventory Custodian Slip.");
    return;
  }

  let htmlContent = `
    <html>
    <head>
      <title>Inventory Custodian Slip</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f2f2f2; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        h2 { margin-top: 20px; }
        .ics-section { margin-bottom: 40px; page-break-after: always; }
        .header { display: flex; align-items: center; justify-content: space-between; }
        .header-center { text-align: center; flex: 2; }
        .header-left, .header-right { flex: 1; }
        .header-right { text-align: right; }
        .uppercase { text-transform: uppercase; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .divider { border-top: 1px solid #000; margin: 5px 0; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 20px; }
        .signature-box { width: 48%; text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 50px; width: 80%; display: inline-block; }
        .note { font-size: 10px; font-style: italic; margin-top: 20px; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print();" style="padding: 10px; margin-bottom: 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Inventory Custodian Slip</button>
  `;

  data.forEach((ics: any) => {
    htmlContent += `
      <div class="ics-section">
        <div class="header">
          <div class="header-left">
            <img src="/chmsu-logo.png" alt="CHMSU Logo" style="width: 90px; height: 90px; object-fit: contain;">
          </div>
          <div class="header-center">
            <p class="uppercase" style="font-size: 14px; margin-bottom: 5px;">Republic of the Philippines</p>
            <p class="uppercase bold" style="font-size: 16px; margin-bottom: 5px;">Carlos Hilado Memorial State University</p>
            <p class="uppercase bold" style="font-size: 16px; margin-bottom: 5px;">Inventory Custodian Slip</p>
          </div>
          <div class="header-right">
            <p class="italic bold" style="font-size: 14px; margin-bottom: 5px;">Appendix 59</p>
            <p style="font-size: 12px; margin-bottom: 15px;">page 1/1</p>
            <div>
              <span class="bold" style="font-size: 12px;">ICS No: </span>
              <span style="border-bottom: 1px solid #000; padding-bottom: 2px;">${ics.PurchaseOrder.poNumber || ""}</span>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 15px; margin-bottom: 15px;">
          <p style="font-size: 14px; margin: 5px 0;">Entity Name: Carlos Hilado Memorial State University</p>
          <p style="font-size: 14px; margin: 5px 0;">Date: ${ics.PurchaseOrder?.dateOfDelivery || ""}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="2">Quantity</th>
              <th rowspan="2">Unit</th>
              <th colspan="2">Amount</th>
              <th rowspan="2" colspan="2">Description</th>
              <th>Inventory</th>
              <th>Estimated</th>
            </tr>
            <tr>
              <th>Unit Cost</th>
              <th>Total Cost</th>
              <th>Item No.</th>
              <th>Useful Life</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">${ics.quantity || ""}</td>
              <td class="text-center">${ics.unit || ""}</td>
              <td class="text-right">${ics.formatUnitCost || ics.unitCost || ""}</td>
              <td class="text-right">${ics.formatAmount || ics.amount || ""}</td>
              <td colspan="2">${ics.description || ""}</td>
              <td class="text-center">${ics.id || ""}</td>
              <td class="text-center">5 years</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right bold">Total</td>
              <td class="text-right">${ics.formatAmount || ics.amount || ""}</td>
              <td colspan="4"></td>
            </tr>
          </tbody>
        </table>

        <p style="font-size: 12px; font-weight: lighter; margin: 15px 0;">
          I hereby acknowledge receipt of the following property/ies issued for my use and for which I am responsible:
        </p>

        <div class="signature-section">
          <div class="signature-box">
            <p class="bold">Received from:</p>
            <div style="margin: 30px 0;">
              <div class="divider"></div>
              <p class="bold">${ics.PurchaseOrder?.supplier || ""}</p>
              <div class="divider"></div>
            </div>
            <p>Signature over Printed Name</p>
            <p>Position/Office</p>
            <p>Date: ${ics.PurchaseOrder?.dateOfDelivery || ""}</p>
          </div>
          
          <div class="signature-box">
            <p class="bold">Received by:</p>
            <div style="margin: 30px 0;">
              <div class="divider"></div>
              <p class="bold">Custodian</p>
              <div class="divider"></div>
            </div>
            <p>Signature over Printed Name</p>
            <p>Position/Office</p>
            <p>Date: ${ics.PurchaseOrder?.dateOfPayment || ""}</p>
          </div>
        </div>

        <p class="note">
          Note: This form shall be accomplished in triplicate. The original copy shall be retained by the Supply and/or Property Division/Unit, the duplicate copy for the Accounting Division/Unit and the triplicate copy for the end-user/Accountable Officer.
        </p>
      </div>
    `;
  });

  htmlContent += `
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};