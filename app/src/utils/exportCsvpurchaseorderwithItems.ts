export const exportPurchaseOrdersWithItems = (data: any) => {

  let allData: any;
  if (data.purchaseOrders === undefined) {
    const purchaseOrders = [];
    purchaseOrders.push(data);
    allData = purchaseOrders;
  } else {
    allData = data.purchaseOrders;
  }

  const results = allData
    .map((po: any) => {
      const poData = {
        "PO Number": po.poNumber,
        Supplier: po.supplier,
        "Delivery Date": new Date(po.dateOfDelivery).toLocaleDateString(),
        "Payment Date": new Date(po.dateOfPayment).toLocaleDateString(),
        "Total Amount": `${po.amount.toFixed(2)}`,
      };

      if (!po.items || po.items.length === 0) {
        return [
          {
            ...poData,
            Item: "",
            Description: "",
            Unit: "",
            Quantity: "",
            "Unit Cost": "",
            "Item Amount": "",
          },
        ];
      }

      return po.items.map((item: any, idx: any) => {
        return {
          ...poData,
          "PO Number": idx === 0 ? po.poNumber : "",
          Supplier: idx === 0 ? po.supplier : "",
          "Delivery Date":
            idx === 0 ? new Date(po.dateOfDelivery).toLocaleDateString() : "",
          "Payment Date":
            idx === 0 ? new Date(po.dateOfPayment).toLocaleDateString() : "",
          "Total Amount": idx === 0 ? `${po.amount.toFixed(2)}` : "",
          Item: item.item,
          Description: item.description,
          Unit: item.unit,
          Quantity: item.quantity,
          "Unit Cost": `${item.unitCost.toFixed(2)}`,
          "Item Amount": `${item.amount.toFixed(2)}`,
        };
      });
    })
    .flat();

  let csvContent = "data:text/csv;charset=utf-8,";
  const headers = Object.keys(results[0]);
  csvContent += headers.join(",") + "\n";

  let results2 = results.forEach((row: any) => {
    const rowContent = headers
      .map((header) => {
        const cell = row[header] !== undefined ? row[header].toString() : "";
        return `"${cell.replace(/"/g, '""')}"`;
      })
      .join(",");
    csvContent += rowContent + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Purchase_Order-${new Date().toISOString().slice(0, new Date().toISOString().indexOf("T"))}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
