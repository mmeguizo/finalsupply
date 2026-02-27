import { ApolloClient } from "@apollo/client";

export const handleSavePurchaseOrder = async (
  formData: any,
  editingPO: any,
  updatePurchaseOrder: any,
  addPurchaseOrder: any,
  handleRowClick: any,
  setSelectedPO: (po: any) => void,
  handleCloseModal: () => void,
  setIsSubmitting: (isSubmitting: boolean) => void,
): Promise<{ success: boolean; message: string }> => {
  setIsSubmitting(true);
  try {
    //remove id , typname and iarId

    // Validate that if items are provided, at least one item has meaningful data
    // Require campus when creating a new purchase order
    if (!editingPO) {
      if (!formData.campus || String(formData.campus).trim() === "") {
        return {
          success: false,
          message: "Please select a campus for this Purchase Order.",
        };
      }
    }

    if (
      formData.items &&
      Array.isArray(formData.items) &&
      formData.items.length > 0
    ) {
      // const hasAtLeastOneValidItem = formData.items.some((item: any) => {
      //   const itemNameIsValid = item.itemName && item.itemName.trim() !== '';
      //   const quantityIsValid = typeof item.quantity === 'number' && item.quantity > 0;
      //   // Add more checks here if needed (e.g., for unitCost)
      //   return itemNameIsValid || quantityIsValid;
      // });
      for (const [index, item] of formData.items.entries()) {
        const itemNameIsValid = item.itemName && item.itemName.trim() !== "";
        const quantityIsValid =
          typeof item.quantity === "number" && item.quantity > 0;

        // Category & tag validation only applies when editing existing (non-temp) items
        // New items (id === "temp") have no category yet — it's set in the Generate IAR step
        if (editingPO && item.id && item.id !== "temp") {
          const categoryIsValid = item.category && item.category.trim() !== "";

          if (!categoryIsValid) {
            return {
              success: false,
              message: `Item ${index + 1} (Description: "${item.description || "N/A"}") must have a category selected.`,
            };
          }

          if (item.category === "inventory custodian slip") {
            if (item.tag === "" || !item.tag) {
              return {
                success: false,
                message: `Item ${index + 1} (Description: "${item.description || "N/A"}") must have a tag selected.`,
              };
            }
          }
        }

        // An item is considered invalid if it has a category but lacks both a name and a positive quantity.
        if (!itemNameIsValid && !quantityIsValid) {
          return {
            success: false,
            message: `Item ${index + 1} (Description: "${item.description || "N/A"}") must have an item name or a quantity greater than 0.`,
          };
        }
      }

      // if (!hasAtLeastOneValidItem) {
      //   return { success: false, message: "Cannot save purchase order: provided items are empty or invalid. Please ensure at least one item has a Name or Quantity." };
      // }
    }

    const cleanedItems = formData.items.map((item: any) => {
      const { __typename, iarId, ...cleanItem } = item;
      return cleanItem;
    });
    const { __typename, ...cleanFormData } = formData;
    cleanFormData.items = cleanedItems;
    console.log({ CLEANEDFORMDATA: cleanFormData });
    let updatedPO: any;
    if (editingPO) {
      console.log(editingPO.id);
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
        // Use the returned id to select the PO row — the useEffect in purchaseorder.tsx
        // will sync selectedPO with the fully-fetched refetch data (which includes all
        // fields like deliveryStatus, tag, iarId) once the refetch completes.
        handleRowClick(data.id);
        updatedPO = data;
        handleCloseModal();
        return {
          success: true,
          message: `Purchase order #${formData.poNumber} updated successfully`,
        };
      } catch (error: any) {
        console.error("Error updating purchase order:", error);
        return {
          success: false,
          message: error.message || "Error updating purchase order",
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
          message: `Purchase order #${formData.poNumber} added successfully`,
        };
      } catch (error: any) {
        console.error("Error adding purchase order:", error);
        return {
          success: false,
          message: error.message || "Error adding purchase order",
        };
      }
    }
  } catch (err: any) {
    console.error("Error saving purchase order:", err);
    return {
      success: false,
      message: err.message || "An unexpected error occurred",
    };
  } finally {
    setIsSubmitting(false);
  }
};
// export const createMemoizedPoColumns = (handleOpenEditModal: any) =>
//   React.useMemo(() => createPoColumns(handleOpenEditModal), [handleOpenEditModal]);
