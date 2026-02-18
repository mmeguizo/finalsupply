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
  return Object.entries(obj).map(([poNumber, items]: any) => {
    // Filter out items with actualQuantityReceived = 0 (fully split/assigned)
    // but keep items that have a PAR ID assigned (they are valid rows)
    const visibleItems = items.filter((item: any) => 
      (item.actualQuantityReceived ?? 0) > 0 || item.parId
    );
    return {
      id: items[0].PurchaseOrder?.id || items[0].id,
      poNumber: poNumber,
      supplier: items[0].PurchaseOrder?.supplier,
      dateOfDelivery: items[0].PurchaseOrder?.dateOfDelivery,
      itemCount: visibleItems.length,
      items: visibleItems, // Store only visible items for this PO
    };
  }).filter(row => row.items.length > 0); // Remove POs with no visible items
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
