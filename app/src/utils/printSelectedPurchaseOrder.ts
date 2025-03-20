export const printSelectedPurchaseOrdersWithItems = (po: any) => {
  //   if (!po) {
  //     alert("No purchase order selected!");
  //     return;
  //   }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print purchase orders.");
    return;
  }

  let htmlContent = `
      <html>
      <head>
        <title>Purchase Order #${po.ponumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .text-right { text-align: right; }
          h2 { margin-top: 0; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print();" style="padding: 10px; margin-bottom: 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Purchase Order</button>
        <h2>Purchase Order #${po.ponumber}</h2>
        
        <table>
          <tbody>
            <tr><td><strong>Supplier:</strong></td><td>${po.supplier}</td></tr>
            <tr><td><strong>Delivery Date:</strong></td><td>${new Date(Number(po.dateofdelivery)).toLocaleDateString()}</td></tr>
            <tr><td><strong>Payment Date:</strong></td><td>${new Date(Number(po.dateofpayment)).toLocaleDateString()}</td></tr>
            <tr><td><strong>Total Amount:</strong></td><td>PHP ${po.amount.toFixed(2)}</td></tr>
          </tbody>
        </table>
    `;

  if (po.items && po.items.length > 0) {
    htmlContent += `
        <h3>Items</h3>
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

  htmlContent += `
      </body>
      </html>
    `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
