import { useState, useEffect } from "react";
import {
  PurchaseOrderFormData,
  PurchaseOrderItem,
} from "../types/purchaseOrder";

export const usePurchaseOrderForm = (purchaseOrder: any | null) => {
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    ponumber: purchaseOrder?.ponumber || "",
    supplier: purchaseOrder?.supplier || "",
    address: purchaseOrder?.address || "",
    placeofdelivery: purchaseOrder?.placeofdelivery || "",
    dateofpayment: purchaseOrder?.dateofpayment
      ? new Date(Number(purchaseOrder.dateofpayment))
      : null,
    items: purchaseOrder?.items || [],
    amount: purchaseOrder?.amount || 0,
    status: purchaseOrder?.status || "",
    invoice: purchaseOrder?.invoice || "",
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [actualQuantityfromDb, setActualQuantityfromDb] = useState(0);

  useEffect(() => {
    setAddingItem(false);
    setHasSubmitted(false);
    if (purchaseOrder) {
      setFormData({
        ponumber: purchaseOrder.ponumber || "",
        supplier: purchaseOrder.supplier || "",
        address: purchaseOrder.address || "",
        placeofdelivery: purchaseOrder.placeofdelivery || "",
        dateofpayment: purchaseOrder.dateofpayment
          ? new Date(Number(purchaseOrder.dateofpayment))
          : null,
        items:
          purchaseOrder.items.map((item: any) => {
            setActualQuantityfromDb(item.actualQuantityReceived);
            return {
              ...item,
              actualQuantityReceived:
                purchaseOrder.status === "completed"
                  ? item.actualQuantityReceived
                  : 0,
            };
          }) || [],
        amount: purchaseOrder.amount || 0,
        status: purchaseOrder.status || "",
        invoice: purchaseOrder.invoice || "",
      });
    } else {
      setFormData({
        ponumber: "",
        supplier: "",
        address: "",
        placeofdelivery: "",
        dateofpayment: null,
        amount: 0,
        items: [],
        status: "",
        invoice: "",
      });
    }
  }, [purchaseOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date: Date | null, fieldName: string) => {
    setFormData({
      ...formData,
      [fieldName]: date,
    });
  };

  const addItem = () => {
    setAddingItem(true);
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          category: "",
          item: "",
          description: "",
          unit: "",
          quantity: 0,
          unitCost: 0,
          amount: 0,
          actualQuantityReceived: 0,
        },
      ],
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    if (field === "quantity" || field === "unitCost") {
      updatedItems[index].amount =
        Number(updatedItems[index].quantity) *
        Number(updatedItems[index].unitCost);
    }

    console.log(updatedItems);

    const allItemsComplete = updatedItems.every((item) => {
      return (
        Number(item.quantity) ===
          Number(item.actualQuantityReceived + actualQuantityfromDb) &&
        item.quantity > 0
      );
    });

    setFormData({
      ...formData,
      items: updatedItems,
      status: allItemsComplete ? "completed" : "pending",
    });
  };

  const isFieldDisabled = (existingValue: any) => {
    if (purchaseOrder && existingValue && !addingItem) {
      return true;
    }
    return false;
  };

  const onSubmit = (handleSave: (formData: any) => void) => {
    const cleanedItems = formData.items.map((item) => {
      const { ...cleanItem } = item;
      return cleanItem;
    });

    const formattedData = {
      ...formData,
      items: cleanedItems,
      dateofpayment: formData.dateofpayment
        ? formData.dateofpayment.getTime().toString()
        : null,
      ponumber: parseInt(formData.ponumber),
    };

    const { ...cleanData } = formattedData;
    console.log({cleanData});

    setHasSubmitted(true);
    setAddingItem(false);
    handleSave(cleanData);
  };

  return {
    formData,
    hasSubmitted,
    addingItem,
    actualQuantityfromDb,
    handleChange,
    handleDateChange,
    addItem,
    updateItem,
    isFieldDisabled,
    onSubmit,
  };
};
