export const printSelectedPurchaseOrdersWithItems = (purchaseOrders) => {
  let data: any;

  console.log(typeof purchaseOrders, "printSelectedPurchaseOrdersWithItems");
  console.log(purchaseOrders, "printSelectedPurchaseOrdersWithItems");
  console.log(purchaseOrders.length, "printSelectedPurchaseOrdersWithItems");

  if (typeof purchaseOrders === "object" && !purchaseOrders.purchaseOrders) {
    // put the object into an array
    data = [purchaseOrders];
  } else {
    // put the array into an object
    data = purchaseOrders.purchaseOrders;
  }

  console.log(typeof purchaseOrders, "printSelectedPurchaseOrdersWithItems");
  console.log(purchaseOrders, "printSelectedPurchaseOrdersWithItems");
  console.log(purchaseOrders.length, "printSelectedPurchaseOrdersWithItems");

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
        .text-right { text-align: right; }
        h2 { margin-top: 20px; }
        .po-section { margin-bottom: 40px; page-break-after: always; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print();" style="padding: 10px; margin-bottom: 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Purchase Orders</button>
  `;

  data.forEach((po) => {
    htmlContent += `
      <div class="po-section">
        <h2>Purchase Order #${po.poNumber}</h2>
        <table>
          <tbody>
            <tr><td><strong>Supplier:</strong></td><td>${po.supplier}</td></tr>
            <tr><td><strong>Address:</strong></td><td>${po.address}</td></tr>
            <tr><td><strong>Telephone:</strong></td><td>${po.telephone}</td></tr>
            <tr><td><strong>Place of Delivery:</strong></td><td>${po.placeOfDelivery}</td></tr>
            <tr><td><strong>Delivery Date:</strong></td><td>${new Date(po.dateOfDelivery).toLocaleDateString()}</td></tr>
            <tr><td><strong>Payment Date:</strong></td><td>${new Date(po.dateOfPayment).toLocaleDateString()}</td></tr>
            <tr><td><strong>Delivery Terms:</strong></td><td>${po.deliveryTerms}</td></tr>
            <tr><td><strong>Payment Terms:</strong></td><td>${po.paymentTerms}</td></tr>
            <tr><td><strong>Status:</strong></td><td>${po.status}</td></tr>
            <tr><td><strong>Invoice:</strong></td><td>${po.invoice || "N/A"}</td></tr>
            <tr><td><strong>Total Amount:</strong></td><td>PHP ${po.amount.toFixed(2)}</td></tr>
          </tbody>
        </table>

        ${
          po.items && po.items.length > 0
            ? `
          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item #</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Received</th>
                <th>Unit Cost</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${po.items
                .map(
                  (item: any) => `
                <tr>
                  <td>${item.itemName}</td>
                  <td>${item.description}</td>
                  <td>${item.unit}</td>
                  <td>${item.quantity}</td>
                  <td>${item.actualQuantityReceived}</td>
                  <td class="text-right">PHP ${item.unitCost.toFixed(2)}</td>
                  <td class="text-right">PHP ${item.amount.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `
            : `<p>No items found for this purchase order.</p>`
        }
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
