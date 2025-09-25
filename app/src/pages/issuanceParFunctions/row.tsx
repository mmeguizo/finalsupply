const groupedRowsFunction = (data: any) => {
  const groupedData = data.propertyAcknowledgmentReportForView.reduce(
    (acc: any, item: any) => {
      const poNumber = item.PurchaseOrder?.poNumber;
      if (!acc[poNumber]) {
        acc[poNumber] = [];
      }
      acc[poNumber].push(item);
      return acc;
    },
    {}
  );
  return groupedData;
};

const ObjectEntriesParFunction = (obj: any) => {
  return Object.entries(obj).map(([poNumber, items]: any) => ({
    id: items[0].PurchaseOrder?.id || items[0].id,
    poNumber: poNumber,
    supplier: items[0].PurchaseOrder?.supplier,
    dateOfDelivery: items[0].PurchaseOrder?.dateOfDelivery,
    itemCount: items.length,
    items: items, // Store all items for this PO
  }));
};

const filteredGroupRows = (rows: any, searchQuery: string) => {
  const lowerCaseQuery = searchQuery.toLowerCase();
  return rows.filter((row: any) => {
    if (row.poNumber?.toLowerCase().includes(lowerCaseQuery)) {
        return true;
    }
    if(row.supplier?.toLowerCase().includes(lowerCaseQuery)){
        return true;
    }
    return row.items.some((item: any) => {
        return (
            (item.parId && item.parId.toLowerCase().includes(lowerCaseQuery)) ||
            (item.description && item.description.toLowerCase().includes(lowerCaseQuery)) ||
            (item.unit && item.unit.toLowerCase().includes(lowerCaseQuery)) ||
            (item.category && item.category.toLowerCase().includes(lowerCaseQuery)) ||
            (item.tag && item.tag.toLowerCase().includes(lowerCaseQuery))
        );
    })
  });
};

export { ObjectEntriesParFunction, groupedRowsFunction, filteredGroupRows };
