import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Import the Sequelize models
import PurchaseOrderItemsHistory from "../models/purchaseorderitemshistory.js"; // Import history model
import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { customAlphabet } from "nanoid";
import { omitId } from "../utils/helper.js";
import { sequelize } from "../db/connectDB.js";
import { Op } from "sequelize"; // add if not present
const nanoid = customAlphabet("1234567890meguizomarkoliver", 10);
import { generateNewIarId } from "../utils/iarIdGenerator.js";
import { generateNewRisId } from "../utils/risIdGenerator.js";
import { generateNewParId } from "../utils/parIdGenerator.js";
import { generateNewIcsId } from "../utils/icsIdGenerator.js";
const purchaseorderResolver = {
  Query: {
    purchaseOrders: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch all purchase orders using Sequelize
        const purchaseorders = await PurchaseOrder.findAll({
          where: { isDeleted: false }, // Only get active purchase orders
          order: [["createdAt", "DESC"]], // Sort by date descending
        });

        return purchaseorders;
      } catch (error) {
        console.error("Error fetching purchase orders: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    purchaseOrderItems: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch all purchase order items using Sequelize
        const purchaseordersItems = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
        });

        return purchaseordersItems;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    allPurchaseOrderItems: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch all purchase order items using Sequelize
        const purchaseordersItems = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });
        return purchaseordersItems;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    allICSPurchaseOrderItems: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch all purchase order items using Sequelize
        const purchaseordersItems = await PurchaseOrderItems.findAll({
          where: { isDeleted: false, category: "inventory custodian slip" },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });
        return purchaseordersItems;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    getAllTotalPurchaseOrderAmount: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        let totalItemAmount = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
        });
        let totalAmount = totalItemAmount.reduce((sum, item) => {
          return sum + (Number(item.amount) || 0);
        }, 0);
        return totalAmount; // Return the total amoun
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    getTotalPurchaseOrderItems: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        let totalItemAmount = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
        });
        let totalAmount = totalItemAmount.length;
        return totalAmount; // Return the total amoun
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    getTotalPurchaseOrders: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        let totalItemAmount = await PurchaseOrder.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
        });
        let totalAmount = totalItemAmount.length;
        return totalAmount; // Return the total amoun
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    getPurchaseOrderForBarCharts: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        let totalItemAmount = await PurchaseOrder.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrderItems],
        });

        return totalItemAmount; // Return the total amoun
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    getAllCategory: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        let allCategory = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
        });
        return allCategory;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    purchaseOrderHistory: async (_, { purchaseOrderId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const purchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId, {
          include: [PurchaseOrderItems],
        });

        const itemsID = purchaseOrder.PurchaseOrderItems.map((item) => item.id);
        const history = await PurchaseOrderItemsHistory.findAll({
          where: { purchaseOrderItemId: itemsID },
          order: [["createdAt", "DESC"]],
        });

        return history;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    purchaseOrderItemsHistoryAll: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const history = await PurchaseOrderItemsHistory.findAll({
          order: [["createdAt", "DESC"]],
        });
        return history;
      } catch (error) {
        console.error("Error fetching all purchase order items history: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    inspectionAcceptanceReport: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const inspectionAcceptanceReportdata =
          await inspectionAcceptanceReport.findAll({
            where: { isDeleted: false },
            order: [["createdAt", "DESC"]],
            include: [PurchaseOrder],
          });

        if (!inspectionAcceptanceReportdata) {
          throw new Error("Purchase order not found");
        }
        return inspectionAcceptanceReportdata;
      } catch (error) {
        console.error("Error fetching purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },
  PurchaseOrderItemHistory: {},

  Mutation: {
    addPurchaseOrder: async (_, { input }, context) => {

      console.log("addPurchaseOrder", input, context.req.user);

      const batchIarId = nanoid();
      const autoIiarIds = await generateNewIarId(input.campus);
      // Define valid categories at a higher scope if used for both PO and POItems
      const validCategories = [
        "property acknowledgement reciept",
        "inventory custodian slip",
        "requisition issue slip",
      ];

      const t = await sequelize.transaction(); // Start a transaction

      try {
        const user = context.req.user;
  const { items, campus, ...poRestData } = input;

        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Items are optional - purchase order can be created without items

        // Check if a purchase order with the same ponumber already exists
        const existingPO = await PurchaseOrder.findOne({
          where: { poNumber: input.poNumber, isDeleted: false },
        });

        if (existingPO) {
          throw new Error(
            `Purchase order with number ${input.poNumber} already exists`
          );
        }

        // Ensure poRestData.category has a valid default if it's not set or invalid
        if (
          !poRestData.category ||
          !validCategories.includes(poRestData.category)
        ) {
          poRestData.category = "requisition issue slip"; // Default for PurchaseOrder category
        }

        // Create new purchase order
        const newPurchaseorder = await PurchaseOrder.create(
          {
            ...poRestData,
            campus: campus || null,
          },
          { transaction: t }
        ); // Use transaction

        // If items exist, create purchase order items
        if (items && Array.isArray(items) && items.length > 0) {
          // Use a single ICS ID for the entire batch, regardless of tag (high/low)
          let batchIcsId = "";
          // Validate that if items are provided, at least one item has meaningful data
          const hasAtLeastOneValidItem = items.some((item) => {
            const itemNameIsValid =
              item.itemName && item.itemName.trim() !== "";
            const quantityIsValid =
              typeof item.quantity === "number" && item.quantity > 0;
            // You could add more checks here if needed, e.g., for unitCost
            return itemNameIsValid || quantityIsValid;
          });

          if (!hasAtLeastOneValidItem) {
            throw new Error(
              "Cannot process purchase order: provided items are empty or invalid. Please ensure at least one item has a name or quantity."
            );
          }
          //generate ids right away

          for (const item of items) {
            const { id: poId, ...cleanedItems } = item;

            // Validate and set default for item category if necessary
            if (!validCategories.includes(cleanedItems.category)) {
              cleanedItems.category = "requisition issue slip";
            }

            const newPOI = await PurchaseOrderItems.create(
              {
                ...cleanedItems,
                actualQuantityReceived: item.currentInput,
                purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
                itemGroupId: nanoid(), // stable grouping key for UI aggregation
              },
              { transaction: t }
            ); // Use transaction

            // Only create IAR and History if currentInput is provided and greater than 0
            if (item.currentInput && Number(item.currentInput) > 0) {
              let icsId = "";
              let parId = "";
              let risId = "";
              // derive campus suffix
              const campusSuffixMap = {
                Talisay: 'T',
                Alijis: 'A',
                Binalbagan: 'B',
                'Fortune Town': 'F',
              };
              const campusSuffix = campusSuffixMap[campus] || '';
              if (cleanedItems.tag === "high" || cleanedItems.tag === "low") {
                if (!batchIcsId) {
                  batchIcsId = await generateNewIcsId(cleanedItems.tag);
                }
                icsId = campusSuffix ? `${batchIcsId}${campusSuffix}` : batchIcsId;
              }
              if (
                cleanedItems.category === "property acknowledgement reciept"
              ) {
                const gen = await generateNewParId();
                parId = campusSuffix ? `${gen}${campusSuffix}` : gen;
              }
              if (cleanedItems.category === "requisition issue slip") {
                const gen = await generateNewRisId();
                risId = campusSuffix ? `${gen}${campusSuffix}` : gen;
              }

              const iarRow = await inspectionAcceptanceReport.create(
                {
                  ...cleanedItems,
                  iarId: autoIiarIds || batchIarId, // Use the same IAR ID for all items in this batch
                  actualQuantityReceived: item.currentInput, // Already checked it's > 0
                  purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
                  purchaseOrderItemId: newPOI.id, // Link items to the new purchase order
                  createdBy: user.name || user.id, // Track who created the IAR
                  updatedBy: user.name || user.id, // Track who updated the IAR
                  parId: parId || "", // Use the same PAR ID for all items in this batch
                  icsId: icsId || "",
                  risId: risId || "",
                },
                { transaction: t }
              ); // Use transaction

              await PurchaseOrderItemsHistory.create(
                {
                  purchaseOrderItemId: newPOI.id,
                  purchaseOrderId: newPurchaseorder.id,
                  itemName: cleanedItems.itemName || "",
                  description: cleanedItems.description || "",
                  previousQuantity: 0,
                  newQuantity: item.quantity,
                  previousActualQuantityReceived: 0,
                  newActualQuantityReceived: item.currentInput, // Already checked it's > 0
                  previousAmount: 0,
                  newAmount: item.amount,
                  iarId: iarRow.iarId || null,
                  parId: iarRow.parId || null,
                  risId: iarRow.risId || null,
                  icsId: iarRow.icsId || null,
                  changeType: "quantity_update", // Or "received_update" if more appropriate for initial
                  changedBy: user.name || user.id,
                  changeReason: "Initial item creation with received quantity",
                },
                { transaction: t }
              );
            }
          }
        }
        await t.commit(); // Commit the transaction if everything was successful
        // Fetch the newly created purchase order with its items
        const purchaseOrderWithItems = await PurchaseOrder.findOne({
          where: { id: newPurchaseorder.id },
          include: [PurchaseOrderItems],
        });

        return purchaseOrderWithItems;
      } catch (error) {
        if (t) {
          await t.rollback(); // Rollback the transaction in case of error
        }
        console.error("Error adding purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    updatePurchaseOrder: async (_, { input }, context) => {
      const user = context.req.user;
      const batchIarId = nanoid();
      const autoIiarIds = await generateNewIarId(input.campus);
      // Define valid categories, similar to addPurchaseOrder
      const validCategories = [
        "property acknowledgement reciept",
        "inventory custodian slip",
        "requisition issue slip",
      ];

      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
  const { id: poId, items, markingComplete, campus, ...poUpdates } = input; // Use poId for clarity

        const findIfExists = await PurchaseOrder.findOne({
          where: { id: poId },
        });
        if (!findIfExists) {
          throw new Error("Purchase order not found");
        }
        // Update the purchase order details
        // Update the purchase order
        const [_, affectedRows] = await PurchaseOrder.update({ ...poUpdates, campus: campus ?? poUpdates.campus }, {
          where: { id: poId },
        });

        if (markingComplete) {
          // If marking complete, we might update the PO status and log history.
          // The original logic tied history to the first item.
          await PurchaseOrder.update(
            { status: "Completed", completed_status_date: new Date() }, // Assuming 'status' and 'completed_status_date' are fields
            { where: { id: poId } }
          );

          const poForHistory = await PurchaseOrder.findByPk(poId, {
            include: [PurchaseOrderItems],
          });

          // Log history for marking complete, if items exist to associate with
          if (
            poForHistory &&
            poForHistory.PurchaseOrderItems &&
            poForHistory.PurchaseOrderItems.length > 0
          ) {
            const firstItemForHistory = poForHistory.PurchaseOrderItems[0];
            await PurchaseOrderItemsHistory.create({
              purchaseOrderItemId: firstItemForHistory.id,
              previousQuantity: firstItemForHistory.quantity, // Snapshot
              newQuantity: firstItemForHistory.quantity, // Snapshot
              previousActualQuantityReceived:
                firstItemForHistory.actualQuantityReceived, // Snapshot
              newActualQuantityReceived:
                firstItemForHistory.actualQuantityReceived, // Snapshot
              previousAmount: firstItemForHistory.amount, // Snapshot
              newAmount: firstItemForHistory.amount, // Snapshot
              changeType: "po_completed", // More specific type
              changedBy: user.name || user.id,
              changeReason: "Purchase Order Marked Complete",
            });
          }
          // If markingComplete is an exclusive action, an early return might be appropriate here.
          // Current logic allows item processing even if markingComplete is true.
        }

        // Handle items if provided
        if (items && Array.isArray(items) && items.length > 0) {
          // Use a single ICS ID for the entire update batch, regardless of tag
          let batchIcsId = "";
          // Generate a single IAR ID for all items in this batch

          const hasAtLeastOneValidItem = items.some((item) => {
            const itemNameIsValid =
              item.itemName && item.itemName.trim() !== "";
            const quantityIsValid =
              typeof item.quantity === "number" && item.quantity > 0;
            // You could add more checks here if needed, e.g., for unitCost
            return itemNameIsValid || quantityIsValid;
          });
          if (!hasAtLeastOneValidItem) {
            throw new Error(
              "Cannot process purchase order: provided items are empty or invalid. Please ensure at least one item has a name or quantity."
            );
          }

          for (const item of items) {
            if (item.id !== "temp") {
              const currentItem = await PurchaseOrderItems.findOne({
                where: { id: item.id, purchaseOrderId: poId },
              });
              if (!currentItem) {
                console.warn(`Item with id ${item.id} not found for PO ${poId}. Skipping.`);
                continue;
              }

              const itemUpdates = {};
              let detailsChanged = false;
              [
                "itemName",
                "description",
                "generalDescription",
                "specification",
                "unit",
                "category",
                "tag",
                "inventoryNumber",
              ].forEach((field) => {
                if (item[field] !== undefined && item[field] !== currentItem[field]) {
                  itemUpdates[field] = item[field];
                  detailsChanged = true;
                }
              });

              if (item.quantity !== undefined && Number(item.quantity) !== currentItem.quantity) {
                itemUpdates.quantity = Number(item.quantity);
                detailsChanged = true;
              }
              if (item.unitCost !== undefined && Number(item.unitCost) !== currentItem.unitCost) {
                itemUpdates.unitCost = Number(item.unitCost);
                detailsChanged = true;
              }

              const newQuantity =
                itemUpdates.quantity !== undefined ? itemUpdates.quantity : currentItem.quantity;
              const newUnitCost =
                itemUpdates.unitCost !== undefined ? itemUpdates.unitCost : currentItem.unitCost;
              const recalculatedAmount = newQuantity * newUnitCost;
              if (detailsChanged && recalculatedAmount !== currentItem.amount) {
                itemUpdates.amount = recalculatedAmount;
              }

              const receivedQty =
                item.currentInput && Number(item.currentInput) > 0
                  ? Number(item.currentInput)
                  : 0;

              if (receivedQty > 0) {
                const prevAqr = Number(currentItem.actualQuantityReceived || 0);
                const maxAllowable = Number(
                  itemUpdates.quantity !== undefined ? itemUpdates.quantity : currentItem.quantity
                );
                const newAqr = Math.min(prevAqr + receivedQty, maxAllowable);

                // Doc IDs generation
                let parIdGen = "";
                let risIdGen = "";
                let icsIdGen = "";
                const campusSuffixMap = { Talisay: "T", Alijis: "A", Binalbagan: "B", "Fortune Town": "F" };
                const poRecord = findIfExists;
                const campusValue = campus ?? poRecord?.campus ?? "";
                const campusSuffix = campusSuffixMap[campusValue] || "";

                const effectiveCategory =
                  itemUpdates.category !== undefined ? itemUpdates.category : currentItem.category;
                const effectiveTag = itemUpdates.tag !== undefined ? itemUpdates.tag : currentItem.tag;

                if (effectiveCategory === "property acknowledgement reciept") {
                  const gen = await generateNewParId();
                  parIdGen = campusSuffix ? `${gen}${campusSuffix}` : gen;
                }
                if (effectiveCategory === "requisition issue slip") {
                  const gen = await generateNewRisId();
                  risIdGen = campusSuffix ? `${gen}${campusSuffix}` : gen;
                }
                if (effectiveTag === "high" || effectiveTag === "low") {
                  if (!batchIcsId) {
                    batchIcsId = await generateNewIcsId(effectiveTag);
                  }
                  icsIdGen = campusSuffix ? `${batchIcsId}${campusSuffix}` : batchIcsId;
                }

                // Apply updates + increment actualQuantityReceived
                await PurchaseOrderItems.update(
                  { ...itemUpdates, actualQuantityReceived: newAqr },
                  { where: { id: currentItem.id, purchaseOrderId: poId } }
                );

                // IAR row (represents this receipt only)
                const iarRow = await inspectionAcceptanceReport.create({
                  itemName: itemUpdates.itemName ?? currentItem.itemName,
                  description: itemUpdates.description ?? currentItem.description,
                  generalDescription:
                    itemUpdates.generalDescription ?? currentItem.generalDescription,
                  specification: itemUpdates.specification ?? currentItem.specification,
                  unit: itemUpdates.unit ?? currentItem.unit,
                  category: effectiveCategory,
                  tag: effectiveTag,
                  inventoryNumber:
                    itemUpdates.inventoryNumber ?? currentItem.inventoryNumber,
                  quantity: receivedQty, // this receipt batch
                  unitCost: itemUpdates.unitCost ?? currentItem.unitCost,
                  amount: receivedQty * (itemUpdates.unitCost ?? currentItem.unitCost),
                  actualQuantityReceived: receivedQty,
                  iarId: autoIiarIds || batchIarId,
                  purchaseOrderId: poId,
                  purchaseOrderItemId: currentItem.id,
                  createdBy: user.name || user.id,
                  updatedBy: user.name || user.id,
                  parId: parIdGen || null,
                  icsId: icsIdGen || null,
                  risId: risIdGen || null,
                });

                // History (received_update, aggregated line)
                await PurchaseOrderItemsHistory.create({
                  purchaseOrderItemId: currentItem.id,
                  purchaseOrderId: poId,
                  itemName: itemUpdates.itemName ?? currentItem.itemName ?? "",
                  description: itemUpdates.description ?? currentItem.description ?? "",
                  previousQuantity: currentItem.quantity,
                  newQuantity: newQuantity,
                  previousActualQuantityReceived: prevAqr,
                  newActualQuantityReceived: newAqr,
                  previousAmount: currentItem.amount,
                  newAmount:
                    itemUpdates.amount !== undefined ? itemUpdates.amount : currentItem.amount,
                  iarId: iarRow.iarId || null,
                  parId: parIdGen || null,
                  risId: risIdGen || null,
                  icsId: icsIdGen || null,
                  changeType: "received_update",
                  changedBy: user.name || user.id,
                  changeReason:
                    item.changeReason ||
                    (detailsChanged
                      ? "Received qty + details update"
                      : "Received quantity"),
                });

                continue;
              }

              if (detailsChanged) {
                await PurchaseOrderItems.update(itemUpdates, {
                  where: { id: item.id, purchaseOrderId: poId },
                });
                await PurchaseOrderItemsHistory.create({
                  purchaseOrderItemId: currentItem.id,
                  purchaseOrderId: poId,
                  itemName: itemUpdates.itemName ?? currentItem.itemName ?? "",
                  description: itemUpdates.description ?? currentItem.description ?? "",
                  previousQuantity: currentItem.quantity,
                  newQuantity: newQuantity,
                  previousActualQuantityReceived: currentItem.actualQuantityReceived,
                  newActualQuantityReceived: currentItem.actualQuantityReceived,
                  previousAmount: currentItem.amount,
                  newAmount:
                    itemUpdates.amount !== undefined ? itemUpdates.amount : currentItem.amount,
                  changeType: "item_details_update",
                  changedBy: user.name || user.id,
                  changeReason: item.changeReason || "Updated item details",
                });
              }
            } else {
              // New item path unchanged
              const { id, ...cleanedItems } = item;
              if (!validCategories.includes(cleanedItems.category)) {
                cleanedItems.category = "requisition issue slip";
              }
              const newPOI = await PurchaseOrderItems.create({
                itemName: item.itemName || "",
                description: item.description || "",
                generalDescription: item.generalDescription || "",
                specification: item.specification || "",
                unit: item.unit || "",
                quantity: item.quantity ? item.quantity : 0,
                unitCost: item.unitCost ? item.unitCost : 0,
                amount: item.amount ? item.amount : 0,
                category: item.category || "requisition issue slip",
                tag: item.tag || "none",
                inventoryNumber: item.inventoryNumber || "none",
                actualQuantityReceived: item?.currentInput ? item.currentInput : 0,
                purchaseOrderId: poId || id,
                itemGroupId: nanoid(),
              });

              if (item.currentInput && Number(item.currentInput) > 0) {
                let icsId = "";
                let parId = "";
                let risId = "";
                const campusSuffixMap = { Talisay: "T", Alijis: "A", Binalbagan: "B", "Fortune Town": "F" };
                const poRecord = await PurchaseOrder.findByPk(poId);
                const campusValue = campus ?? poRecord?.campus ?? "";
                const campusSuffix = campusSuffixMap[campusValue] || "";

                if (cleanedItems.tag === "high" || cleanedItems.tag === "low") {
                  if (!batchIcsId) {
                    batchIcsId = await generateNewIcsId(cleanedItems.tag);
                  }
                  icsId = campusSuffix ? `${batchIcsId}${campusSuffix}` : batchIcsId;
                }
                if (item.category === "property acknowledgement reciept") {
                  const gen = await generateNewParId();
                  parId = campusSuffix ? `${gen}${campusSuffix}` : gen;
                }
                if (item.category === "requisition issue slip") {
                  const gen = await generateNewRisId();
                  risId = campusSuffix ? `${gen}${campusSuffix}` : gen;
                }

                const iarRow = await inspectionAcceptanceReport.create({
                  ...cleanedItems,
                  iarId: autoIiarIds || batchIarId,
                  actualQuantityReceived: item?.currentInput ? item.currentInput : 0,
                  purchaseOrderId: poId,
                  purchaseOrderItemId: newPOI.id,
                  createdBy: user.name || user.id,
                  updatedBy: user.name || user.id,
                  parId: parId || "",
                  icsId: icsId || "",
                  risId: risId || "",
                });

                await PurchaseOrderItemsHistory.create({
                  purchaseOrderItemId: newPOI.id,
                  purchaseOrderId: poId,
                  itemName: cleanedItems.itemName || "",
                  description: cleanedItems.description || "",
                  previousQuantity: 0,
                  newQuantity: item.quantity ? item.quantity : 0,
                  previousActualQuantityReceived: 0,
                  newActualQuantityReceived: item?.currentInput ? item.currentInput : 0,
                  previousAmount: 0,
                  newAmount: item.amount ? item.amount : 0,
                  iarId: iarRow.iarId || null,
                  parId: iarRow.parId || null,
                  risId: iarRow.risId || null,
                  icsId: iarRow.icsId || null,
                  changeType: "item_creation",
                  changedBy: user.name || user.id,
                  changeReason: "Initial item creation",
                });
              }
            }
          }
        }
        // Fetch the newly created purchase order with its items
        const purchaseOrderWithItems = await PurchaseOrder.findOne({
          where: { id: poId },
          include: [PurchaseOrderItems],
        });

        return purchaseOrderWithItems;
      } catch (error) {
        console.error("Error updating purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    addPurchaseOrderItem: async (_, { purchaseOrderId, item }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Check if the purchase order exists
        const purchaseorder = await PurchaseOrder.findOne({
          where: { id: purchaseOrderId, isDeleted: false },
        });
        if (!purchaseorder) {
          throw new Error("Purchase order not found");
        }

        item.amount = item.unitCost * item.quantity; // Calculate the amount
        // Create the purchase order item
        await PurchaseOrderItems.create({
          ...item,
          purchaseOrderId,
        });

        const updatedPurchaseOrder = await PurchaseOrder.findOne({
          where: { id: purchaseOrderId },
          include: [PurchaseOrderItems], // assuming you're using Sequelize or something similar
        });

        return updatedPurchaseOrder;
      } catch (error) {
        console.error("Error adding purchase order item: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    // Add this new mutation to revert all receipts for a batch (iarId)
    async revertIARBatch(_, { iarId, reason }, context) {
      const t = await sequelize.transaction();
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const user = context.req.user;

        // Load all IAR rows for this batch
        const iars = await inspectionAcceptanceReport.findAll({
          where: { iarId, isDeleted: false },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!iars || iars.length === 0) {
          throw new Error("IAR batch not found or already reverted");
        }

        console.log(`[revertIARBatch] Found ${iars.length} IAR rows for iarId=${iarId}`);

        // Group by purchaseOrderItemId to minimize updates
        const grouped = iars.reduce((acc, iar) => {
          const key = iar.purchaseOrderItemId;
          acc[key] = acc[key] || { rows: [], total: 0 };
          acc[key].rows.push(iar);
          acc[key].total += Number(iar.actualQuantityReceived || 0);
          return acc;
        }, {});

        // For each item, reduce actualQuantityReceived and log history
        for (const [poiId, info] of Object.entries(grouped)) {
          const poi = await PurchaseOrderItems.findByPk(poiId, {
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          if (!poi) continue;

          const beforeAqr = Number(poi.actualQuantityReceived || 0);
          const delta = Math.min(beforeAqr, Number(info.total || 0));
          // If the item is an ICS category, fully zero out AQR on revert of this batch
          const isIcsCategory = (poi.category || '').toLowerCase() === 'inventory custodian slip';
          const afterAqr = isIcsCategory ? 0 : Math.max(0, beforeAqr - delta);

          // Capture latest doc IDs before we null them out on IAR table
          const latestIar = await inspectionAcceptanceReport.findOne({
            where: { purchaseOrderItemId: poi.id, isDeleted: false },
            order: [["createdAt", "DESC"]],
            transaction: t,
          });

          // Update item AQR
          const [poiUpdated] = await PurchaseOrderItems.update(
            { actualQuantityReceived: afterAqr },
            { where: { id: poi.id }, transaction: t }
          );
          console.log(`[revertIARBatch] Updated PO Item ${poi.id}: AQR ${beforeAqr} -> ${afterAqr} (rows=${poiUpdated})`);

          // History
          await PurchaseOrderItemsHistory.create(
            {
              purchaseOrderItemId: poi.id,
              purchaseOrderId: poi.purchaseOrderId,
              itemName: poi.itemName,
              description: poi.description,
              previousQuantity: poi.quantity,
              newQuantity: poi.quantity,
              previousActualQuantityReceived: beforeAqr,
              newActualQuantityReceived: afterAqr,
              previousAmount: poi.amount,
              newAmount: poi.amount,
              iarId: latestIar?.iarId || null,
              parId: latestIar?.parId || null,
              risId: latestIar?.risId || null,
              icsId: latestIar?.icsId || null,
              // Use existing ENUM value to avoid DB error
              changeType: "received_update",
              changedBy: user.name || user.id,
              changeReason: reason || `Reverted IAR batch ${iarId}`,
            },
            { transaction: t }
          );
        }

        // Soft-delete IAR rows and clear doc IDs (par/ics/ris)
        const [iarUpdated] = await inspectionAcceptanceReport.update(
          {
            isDeleted: 1, // explicit tinyint for MySQL
            actualQuantityReceived: 0,
            parId: null,
            icsId: null,
            risId: null,
            updatedBy: user.name || user.id,
          },
          { where: { iarId, isDeleted: 0 }, transaction: t }
        );
        console.log(`[revertIARBatch] Soft-deleted IAR rows for iarId=${iarId} (rows=${iarUpdated})`);

        await t.commit();
        return {
          success: true,
          message: `IAR batch ${iarId} reverted.`,
          iarId,
          affectedCount: iars.length,
        };
      } catch (e) {
        await t.rollback();
        console.error("revertIARBatch error:", e);
        throw new Error(e.message || "Failed to revert IAR batch");
      }
    },
  },

  // Custom
  // Field resolvers to connect purchase orders with their items
  PurchaseOrder: {
    items: async (parent) => {
      try {
        // Fetch all rows for this PO
        const rows = await PurchaseOrderItems.findAll({
          where: { purchaseOrderId: parent.id, isDeleted: false },
          order: [["createdAt", "ASC"]],
        });

        // If there are no rows or only one, return as-is
        if (!rows || rows.length <= 1) return rows;

        // Group logically-same items: prefer stable itemGroupId when present,
        // otherwise fall back to a heuristic signature.
        const groups = new Map();
        for (const r of rows) {
          const key = r.itemGroupId && String(r.itemGroupId).trim() !== ""
            ? `group:${r.itemGroupId}`
            : [
                r.itemName || "",
                r.unit || "",
                Number(r.unitCost || 0).toString(),
                r.category || "",
                r.tag || "",
                r.inventoryNumber || "",
              ].join("|");

          if (!groups.has(key)) {
            groups.set(key, {
              base: r, // earliest row (ordered ASC)
              totalReceived: Number(r.actualQuantityReceived || 0),
              latestSpecs: {
                description: r.description,
                specification: r.specification,
                generalDescription: r.generalDescription,
              },
              latestCreatedAt: new Date(r.createdAt || 0).getTime(),
            });
          } else {
            const g = groups.get(key);
            g.totalReceived += Number(r.actualQuantityReceived || 0);
            const t = new Date(r.createdAt || 0).getTime();
            if (t > g.latestCreatedAt) {
              g.latestSpecs = {
                description: r.description,
                specification: r.specification,
                generalDescription: r.generalDescription,
              };
              g.latestCreatedAt = t;
            }

            // Choose base as the one with non-zero amount when available
            if (Number(g.base.amount || 0) === 0 && Number(r.amount || 0) > 0) {
              g.base = r;
            }
          }
        }

        // Build a normalized array: one row per logical item
        const merged = Array.from(groups.values()).map((g) => {
          // Clone the base data without mutating Sequelize instances
          const base = g.base.get ? g.base.get({ plain: true }) : { ...g.base };
          return {
            ...base,
            description: g.latestSpecs.description,
            specification: g.latestSpecs.specification,
            generalDescription: g.latestSpecs.generalDescription,
            actualQuantityReceived: g.totalReceived,
          };
        });

        return merged;
      } catch (error) {
        console.error("Error fetching purchase order items:", error);
        throw new Error("Failed to load purchase order items");
      }
    },
    amount: async (parent) => {
      try {
        const items = await PurchaseOrderItems.findAll({
          where: { purchaseOrderId: parent.id, isDeleted: false },
        });

        const total = items.reduce((sum, item) => {
          return sum + (Number(item.amount) || 0);
        }, 0);

        return total;
      } catch (error) {
        console.error(`Error calculating amount for PO: ${parent.id}`, error);
        return parent.amount || 0;
      }
    },
  },

  //  updatePurchaseOrder: async (_, { input }, context) => {
};

export default purchaseorderResolver;
