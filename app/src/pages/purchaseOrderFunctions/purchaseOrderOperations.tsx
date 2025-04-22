import { ApolloClient } from "@apollo/client";

export const handleSavePurchaseOrder = async (
  formData: any,
  editingPO: any,
  updatePurchaseOrder: any,
  addPurchaseOrder: any,
  handleRowClick: any,
  setSelectedPO: (po: any) => void,
  handleCloseModal: () => void,
  setIsSubmitting: (isSubmitting: boolean) => void
) => {
  setIsSubmitting(true);
  try {
    const cleanedItems = formData.items.map((item: any) => {
      const { __typename, ...cleanItem } = item;
      return cleanItem;
    });

    const { __typename, ...cleanFormData } = formData;
    cleanFormData.items = cleanedItems;
    let updatedPO: any;

    if (editingPO) {
      const results = await updatePurchaseOrder({
        variables: {
          input: {
            id: parseInt(editingPO.id),
            ...cleanFormData,
          },
        },
      });
      let data = results.data.updatePurchaseOrder;
      handleRowClick(data.id);
      updatedPO = data;
    } else {
      const results = await addPurchaseOrder({
        variables: { input: formData },
      });
      updatedPO = results.data.addPurchaseorder;
    }

    setSelectedPO(updatedPO);
    handleCloseModal();
  } catch (err) {
    console.error("Error saving purchase order:", err);
  } finally {
    setIsSubmitting(false);
  }
};

// export const createMemoizedPoColumns = (handleOpenEditModal: any) =>
//   React.useMemo(() => createPoColumns(handleOpenEditModal), [handleOpenEditModal]);