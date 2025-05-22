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
): Promise<{ success: boolean; message: string }> => {
  setIsSubmitting(true);
  try {
      //remove id , typname and iarId
    const cleanedItems = formData.items.map((item: any) => {
      const { __typename, iarId, ...cleanItem } = item;
      return cleanItem;
    });
    console.log(cleanedItems, "cleanedItems");
    const { __typename, ...cleanFormData } = formData;
    cleanFormData.items = cleanedItems;
    let updatedPO: any;
    if (editingPO) {
      try {
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
        
        setSelectedPO(updatedPO);
        handleCloseModal();
        return {
          success: true,
          message: `Purchase order #${formData.poNumber} updated successfully`
        };
      } catch (error: any) {
        console.error("Error updating purchase order:", error);
        return {
          success: false,
          message: error.message || "Error updating purchase order"
        };
      }
    } else {
      try {
        const results = await addPurchaseOrder({
          variables: { input: formData },
        });
        updatedPO = results.data.addPurchaseorder;
        
        setSelectedPO(updatedPO);
        handleCloseModal();
        return {
          success: true,
          message: `Purchase order #${formData.poNumber} added successfully`
        };
      } catch (error: any) {
        console.error("Error adding purchase order:", error);
        return {
          success: false,
          message: error.message || "Error adding purchase order"
        };
      }
    }
  } catch (err: any) {
    console.error("Error saving purchase order:", err);
    return {
      success: false,
      message: err.message || "An unexpected error occurred"
    };
  } finally {
    setIsSubmitting(false);
  }
};
// export const createMemoizedPoColumns = (handleOpenEditModal: any) =>
//   React.useMemo(() => createPoColumns(handleOpenEditModal), [handleOpenEditModal]);