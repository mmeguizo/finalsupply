export const printPurchaseOrdersWithItems = (data: any) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print purchase orders.");
    return;
  }

  let htmlContent = `
    <html>
    <head>
      <title>Purchase Orders</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .po-header { background-color: #f8f8f8; font-weight: bold; }
        .item-row { }
        .page-break { page-break-after: always; }
        .text-right { text-align: right; }
        h2 { margin-top: 0; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print();" style="padding: 10px; margin-bottom: 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Purchase Orders</button>
      <h2>Purchase Orders with Items</h2>
  `;

  const purchaseOrders = data?.purchaseorders || [];

  purchaseOrders.forEach((po: any, poIndex: number) => {
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th colspan="2">Purchase Order Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PO Number:</td>
            <td>${po.ponumber}</td>
          </tr>
          <tr>
            <td>Supplier:</td>
            <td>${po.supplier}</td>
          </tr>
          <tr>
            <td>Delivery Date:</td>
            <td>${new Date(Number(po.dateofdelivery)).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>Payment Date:</td>
            <td>${new Date(Number(po.dateofpayment)).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>Total Amount:</td>
            <td>PHP ${po.amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    `;

    if (po.items && po.items.length > 0) {
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Unit Cost</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
      `;

      po.items.forEach((item: any) => {
        htmlContent += `
          <tr>
            <td>${item.item}</td>
            <td>${item.description}</td>
            <td>${item.unit}</td>
            <td>${item.quantity}</td>
            <td class="text-right">PHP ${item.unitcost.toFixed(2)}</td>
            <td class="text-right">PHP ${item.amount.toFixed(2)}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    } else {
      htmlContent += `<p>No items found for this purchase order.</p>`;
    }

    if (poIndex < purchaseOrders.length - 1) {
      htmlContent += `<div class="page-break"></div>`;
    }
  });

  htmlContent += `
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
