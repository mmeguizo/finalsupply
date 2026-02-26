import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Import the Sequelize models
import PurchaseOrderItemsHistory from "../models/purchaseorderitemshistory.js"; // Import history model
import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { sequelize } from "../db/connectDB.js";
import { customAlphabet } from "nanoid";
import { omitId } from "../utils/helper.js";
import { Op, Sequelize } from "sequelize";
import { generateNewIcsId, resetIcsIdBatch } from "../utils/icsIdGenerator.js"; // Import the ICS ID generator function
import { generateNewIarId } from "../utils/iarIdGenerator.js"; // Import the IAR ID generator function
const nanoid = customAlphabet("1234567890meguizomarkoliver", 10);
const inspectionAcceptanceReportResolver = {
  Query: {
    inspectionAcceptanceReport: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        // const inspectionAcceptanceReportdata =
        //   await inspectionAcceptanceReport.findAll({
        //     where: { isDeleted: false },
        //     order: [["id", "DESC"]],
        //     include: [PurchaseOrder],
        //   });
        const rows = await inspectionAcceptanceReport.findAll({
          where: { isDeleted: false },
          order: [["id", "DESC"]],
          include: [
            { model: PurchaseOrder, required: true },
            {
              model: PurchaseOrderItems,
              as: "PurchaseOrderItem",
              // Include all fields you need in the client shape
              attributes: [
                "id",
                "purchaseOrderId",
                "itemName",
                "description",
                "generalDescription",
                "specification",
                "unit",
                "quantity",
                "unitCost",
                "amount",
                "category",
                "isDeleted",
                "actualQuantityReceived",
                "tag",
                "inventoryNumber",
                "itemGroupId",
                "isReceiptLine",
              ],
              required: false, // LEFT JOIN
            },
          ],
        });

        // Debug first few
        rows.slice(0, 5).forEach((r) => {
          const it = r.PurchaseOrderItem;
        });

        return rows;
      } catch (error) {
        console.error("Error fetching purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    inspectionAcceptanceReportForICS: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const inspectionAcceptanceReportdata =
          await inspectionAcceptanceReport.findAll({
            where: {
              isDeleted: false,
              tag: {
                [Op.or]: ["high", "low"],
              },
            },
            order: [["createdAt", "DESC"]],
            include: [
              { model: PurchaseOrder },
              // include PurchaseOrderItems using the alias used in your models / code
              {
                model: PurchaseOrderItems,
                as: "PurchaseOrderItem",
                required: false,
              },
            ],
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
    iarForReports: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const inspectionAcceptanceReportdata =
          await inspectionAcceptanceReport.findAll({
            // Explicitly select only the attributes required by the IARonly GraphQL type
            // Using snake_case for database columns
            attributes: [
              "id",
              "created_at",
              "iar_id",
              "category",
              "purchase_order_id",
            ],
            where: {
              isDeleted: false,
            },
            order: [
              ["created_at", "DESC"], // Order by created_at (snake_case)
              ["id", "DESC"], // Secondary sort for consistency
            ],
            include: [
              {
                model: PurchaseOrder, // Include the associated PurchaseOrder details
                attributes: ["po_number"], // Assuming 'po_number' is the correct
                // required : true // Ensures that only IARs with associated POs are returned
              },
            ],
          });

        if (
          !inspectionAcceptanceReportdata ||
          inspectionAcceptanceReportdata.length === 0
        ) {
          console.log("No data fetched from database, returning empty array.");
          return [];
        }

        const uniqueIARs = new Map();

        // Iterate through the fetched data to filter out unique iar_id values

        inspectionAcceptanceReportdata.forEach((item) => {
          // Access iar_id directly from dataValues
          const iarIdValue = item.dataValues.iar_id;
          console.log(item.dataValues.PurchaseOrder.dataValues.po_number);

          if (iarIdValue) {
            if (!uniqueIARs.has(iarIdValue)) {
              uniqueIARs.set(iarIdValue, item);
            }
          } else {
            // Log items being skipped if iar_id is falsy
            // console.log(`Skipping item ID: ${item.id} because iar_id is falsy: '${iarIdValue}'`);
          }
        });
        // console.log("--- UNIQUE IARS MAP CONTENT (before final map) ---");
        // console.log(`Number of unique items found: ${uniqueIARs.size}`);
        // console.log("--- END UNIQUE IARS MAP CONTENT ---");
        // Convert the Map values to an array of plain objects, accessing
        // created_at and iar_id from dataValues
        return Array.from(uniqueIARs.values()).map((item) => ({
          id: item.id,
          // CRITICAL FIX: Access created_at directly from dataValues
          createdAt: item.dataValues.created_at,
          category: item.dataValues.category, // Assuming 'category' is the correct field
          // CRITICAL FIX: Access iar_id directly from dataValues
          iarId: item.dataValues.iar_id,
          poNumber: item.dataValues.PurchaseOrder.dataValues.po_number, // Assuming 'po_number' is the correct field
        }));
      } catch (error) {
        console.error(
          "Error fetching unique inspection acceptance report data: ",
          error,
        );
        throw new Error(
          "Failed to retrieve unique inspection acceptance reports.",
        );
      }
    },
    getIARItemsByIarId: async (_, { iarId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        if (!iarId) {
          throw new Error("IAR ID is required."); // Ensure an iarId is provided
        }

        const iarItems = await inspectionAcceptanceReport.findAll({
          where: {
            iar_id: iarId, // Filter by the specific iar_id passed as an argument
            isDeleted: false, // Ensure you only get active records
          },
          order: [
            ["created_at", "ASC"], // Order by creation date, maybe ascending for consistency
            ["id", "ASC"], // Secondary sort
          ],
          include: [
            {
              model: PurchaseOrder, // Include the associated PurchaseOrder details
            },
          ],
          // If you don't want all fields for each item, you can specify them here:
          // attributes: ['id', 'itemName', 'description', 'quantity', 'actualQuantityReceived', 'category', 'createdAt'],
        });

        if (!iarItems || iarItems.length === 0) {
          // You might want to throw an error if no items are found for the IAR ID,
          // or simply return an empty array based on your frontend's expectation.
          // Returning an empty array usually handles "not found" gracefully.
          return [];
        }
        // console.log("--- IAR ITEMS ---");
        // console.log(iarItems);
        // console.log("--- END IAR ITEMS ---");
        // Sequelize automatically handles mapping snake_case database columns to camelCase
        // JavaScript properties in the returned model instances (e.g., iar_id becomes iarId,
        // created_at becomes createdAt), thanks to `underscored: true` in your model.
        // The data grid is expecting the full item details (ItemWithPurchaseOrder),
        // so you don't need to manually map to a simpler object unless specific fields are excluded.
        return iarItems;
      } catch (error) {
        console.error(`Error fetching items for IAR ID ${iarId}: `, error);
        throw new Error(`Failed to retrieve items for IAR ID ${iarId}.`);
      }
    },
  },

  Mutation: {
    updateICSInventoryIDs: async (_, { input }, context) => {
      const t = await sequelize.transaction();
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // 1. Fetch items to determine their tags
        const itemsToUpdate = await inspectionAcceptanceReport.findAll({
          where: { id: { [Op.in]: input.ids } },
          attributes: ["id", "tag"],
          transaction: t,
        });

        // 2. Group items by their tag ('low', 'high', etc.)
        const groupedByTag = itemsToUpdate.reduce((acc, item) => {
          const tag = item.tag || ""; // Handle items without a tag
          if (!acc[tag]) {
            acc[tag] = [];
          }
          acc[tag].push(item.id);
          return acc;
        }, {});

        // 3. Generate a unique ICS ID for each tag group and update the items
        for (const tag of Object.keys(groupedByTag)) {
          if (tag === "low" || tag === "high") {
            const idsInGroup = groupedByTag[tag];
            console.log(
              `Processing tag: ${tag} with items: [${idsInGroup.join(", ")}]`,
            );

            const newIcsId = await generateNewIcsId(tag);
            console.log(
              `Generated ICS ID: ${newIcsId} for tag "${tag}" and items: [${idsInGroup.join(
                ", ",
              )}]`,
            );

            await inspectionAcceptanceReport.update(
              { icsId: newIcsId },
              {
                where: { id: { [Op.in]: idsInGroup } },
                transaction: t,
              },
            );
          }
        }

        await t.commit();

        // Fetch the updated items to return them
        const items = await inspectionAcceptanceReport.findAll({
          where: {
            id: { [Op.in]: input.ids },
          },
          include: [PurchaseOrder],
        });

        return items;
      } catch (error) {
        await t.rollback();
        console.error("Error updating ICS IDs:", error);
        throw new Error(error.message || "Failed to update ICS IDs");
      }
    },
    updateIARStatus: async (_, { airId, iarStatus }, context) => {
      console.log("Updating IAR status:", { airId, iarStatus });

      const t = await sequelize.transaction();
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        if (!airId) {
          throw new Error("IAR ID is required.");
        }

        // Update all records that match the iar_id (snake_case column)
        const [updatedCount] = await inspectionAcceptanceReport.update(
          { iarStatus },
          {
            where: { iar_id: airId },
            transaction: t,
          },
        );

        // Fetch updated rows to return
        const updatedRows = await inspectionAcceptanceReport.findAll({
          where: { iar_id: airId },
          transaction: t,
        });

        await t.commit();

        return {
          ids: updatedRows.map((r) => r.id),
          iarStatus,
          updatedCount,
          message: "Status updated successfully for matching IAR records",
          success: true,
        };
      } catch (error) {
        await t.rollback();
        console.error("Error updating IAR status:", error);
        throw new Error(error.message || "Failed to update IAR status");
      }
    },
    appendToExistingIAR: async (_, { iarId, items }, context) => {
      const t = await sequelize.transaction();
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const user = context.req.user;

        if (!iarId) {
          throw new Error("IAR ID is required");
        }
        if (!Array.isArray(items) || items.length === 0) {
          throw new Error("No items provided");
        }

        // Load an existing IAR row to inherit document IDs (par/ics/ris)
        const existingIar = await inspectionAcceptanceReport.findOne({
          where: { iarId, isDeleted: false },
          order: [["createdAt", "DESC"]],
          transaction: t,
        });

        let appended = 0;
        for (const line of items) {
          const {
            purchaseOrderItemId,
            received,
            description,
            generalDescription,
            specification,
          } = line;
          if (!purchaseOrderItemId || !received || Number(received) <= 0)
            continue;

          // Lock the POI and validate remaining
          const poi = await PurchaseOrderItems.findByPk(purchaseOrderItemId, {
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          if (!poi || poi.isDeleted) continue;

          const remaining = Math.max(
            0,
            Number(poi.quantity || 0) - Number(poi.actualQuantityReceived || 0),
          );
          const delta = Math.min(remaining, Number(received));
          if (delta <= 0) continue;

          // Update POI actual received
          const beforeAqr = Number(poi.actualQuantityReceived || 0);
          const afterAqr = beforeAqr + delta;
          await PurchaseOrderItems.update(
            { actualQuantityReceived: afterAqr },
            { where: { id: poi.id }, transaction: t },
          );

          // Create IAR row reusing iarId and inheriting doc IDs if any
          const iarRow = await inspectionAcceptanceReport.create(
            {
              itemName: poi.itemName,
              description: description ?? poi.description,
              generalDescription: generalDescription ?? poi.generalDescription,
              specification: specification ?? poi.specification,
              unit: poi.unit || existingIar?.unit || null,
              quantity: poi.quantity,
              unitCost: poi.unitCost,
              amount: poi.amount,
              category: poi.category,
              tag: poi.tag,
              inventoryNumber: poi.inventoryNumber,
              iarId,
              purchaseOrderId: poi.purchaseOrderId,
              purchaseOrderItemId: poi.id,
              actualQuantityReceived: delta,
              createdBy: user.name || user.id,
              updatedBy: user.name || user.id,
              // inherit document IDs if present on existing IAR rows
              parId: existingIar?.parId || null,
              icsId: existingIar?.icsId || null,
              risId: existingIar?.risId || null,
            },
            { transaction: t },
          );

          // History entry
          await PurchaseOrderItemsHistory.create(
            {
              purchaseOrderItemId: poi.id,
              purchaseOrderId: poi.purchaseOrderId,
              itemName: poi.itemName || "",
              description: description ?? poi.description ?? null,
              previousQuantity: poi.quantity,
              newQuantity: poi.quantity,
              previousActualQuantityReceived: beforeAqr,
              newActualQuantityReceived: afterAqr,
              previousAmount: poi.amount,
              newAmount: poi.amount,
              iarId: iarRow.iarId || iarId,
              parId: iarRow.parId || null,
              risId: iarRow.risId || null,
              icsId: iarRow.icsId || null,
              changeType: "received_update",
              changedBy: user.name || user.id,
              changeReason: "Appended to existing IAR",
            },
            { transaction: t },
          );

          appended += 1;
        }

        await t.commit();
        return {
          success: true,
          iarId,
          updatedCount: appended,
          message:
            appended > 0
              ? `Appended ${appended} line(s) to IAR ${iarId}`
              : "No lines appended (nothing to receive or invalid input)",
        };
      } catch (error) {
        await t.rollback();
        console.error("appendToExistingIAR error:", error);
        throw new Error(error.message || "Failed to append to IAR");
      }
    },

    /**
     * Generate IAR from an existing PO.
     * This is the separate step where items get categorized (PAR/ICS/RIS),
     * tagged (low/high for ICS), and received quantities are set.
     * Creates IAR records and updates PO item received qty + delivery status.
     */
    generateIARFromPO: async (_, { purchaseOrderId, items }, context) => {
      const t = await sequelize.transaction();
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const user = context.req.user;

        if (!purchaseOrderId) {
          throw new Error("Purchase Order ID is required");
        }
        if (!Array.isArray(items) || items.length === 0) {
          throw new Error("No items provided");
        }

        // Validate PO exists
        const po = await PurchaseOrder.findByPk(purchaseOrderId, {
          transaction: t,
        });
        if (!po || po.isDeleted) {
          throw new Error("Purchase Order not found");
        }

        // Generate a single IAR ID for the entire batch
        const campus = po.campus || "Talisay";
        const autoIarId = await generateNewIarId(campus);

        let processedCount = 0;

        for (const line of items) {
          const { purchaseOrderItemId, category, tag, received } = line;

          if (!purchaseOrderItemId || !received || Number(received) <= 0)
            continue;

          // Lock the POI and validate
          const poi = await PurchaseOrderItems.findByPk(purchaseOrderItemId, {
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          if (!poi || poi.isDeleted) continue;
          if (poi.purchaseOrderId !== parseInt(purchaseOrderId)) {
            throw new Error(
              `Item ${purchaseOrderItemId} does not belong to PO ${purchaseOrderId}`,
            );
          }

          // Calculate remaining and clamp
          const remaining = Math.max(
            0,
            Number(poi.quantity || 0) - Number(poi.actualQuantityReceived || 0),
          );
          const delta = Math.min(remaining, Number(received));
          if (delta <= 0) continue;

          const beforeAqr = Number(poi.actualQuantityReceived || 0);
          const afterAqr = beforeAqr + delta;

          // Determine delivery status
          let deliveryStatus = "partial";
          if (afterAqr >= Number(poi.quantity || 0)) {
            deliveryStatus = "delivered";
          }

          // Update PO item: category, tag, received qty, delivery status
          await PurchaseOrderItems.update(
            {
              category: category || poi.category || "requisition issue slip",
              tag: tag || poi.tag || "",
              actualQuantityReceived: afterAqr,
              deliveryStatus,
              deliveredDate:
                deliveryStatus === "delivered" ? new Date() : poi.deliveredDate,
            },
            { where: { id: poi.id }, transaction: t },
          );

          // Create IAR record
          const iarRow = await inspectionAcceptanceReport.create(
            {
              itemName: poi.itemName || "",
              description: poi.description || "",
              generalDescription: poi.generalDescription || "",
              specification: poi.specification || "",
              unit: poi.unit || "",
              quantity: poi.quantity,
              unitCost: poi.unitCost,
              amount: poi.amount,
              category: category || poi.category || "requisition issue slip",
              tag: tag || poi.tag || "",
              inventoryNumber: poi.inventoryNumber || "",
              iarId: autoIarId,
              purchaseOrderId: parseInt(purchaseOrderId),
              purchaseOrderItemId: poi.id,
              actualQuantityReceived: delta,
              createdBy: user.name || user.id,
              updatedBy: user.name || user.id,
              parId: "",
              icsId: "",
              risId: "",
            },
            { transaction: t },
          );

          // History entry
          await PurchaseOrderItemsHistory.create(
            {
              purchaseOrderItemId: poi.id,
              purchaseOrderId: parseInt(purchaseOrderId),
              itemName: poi.itemName || "",
              description: poi.description || "",
              previousQuantity: poi.quantity,
              newQuantity: poi.quantity,
              previousActualQuantityReceived: beforeAqr,
              newActualQuantityReceived: afterAqr,
              previousAmount: poi.amount,
              newAmount: poi.amount,
              iarId: iarRow.iarId || autoIarId,
              parId: "",
              risId: "",
              icsId: "",
              changeType: "received_update",
              changedBy: user.name || user.id,
              changeReason: "IAR generated from Purchase Order",
            },
            { transaction: t },
          );

          processedCount += 1;
        }

        await t.commit();
        return {
          success: true,
          iarId: autoIarId,
          updatedCount: processedCount,
          message:
            processedCount > 0
              ? `Generated IAR ${autoIarId} with ${processedCount} item(s)`
              : "No items processed (nothing to receive or invalid input)",
        };
      } catch (error) {
        await t.rollback();
        console.error("generateIARFromPO error:", error);
        throw new Error(error.message || "Failed to generate IAR");
      }
    },

    createLineItemFromExisting: async (
      _,
      { sourceItemId, newItem },
      context,
    ) => {
      const t = await sequelize.transaction();
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const user = context.req.user;

        const {
          iarId,
          quantity,
          received,
          description,
          generalDescription,
          specification,
        } = newItem;

        if (!iarId) {
          throw new Error("IAR ID is required");
        }
        if (!quantity || quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }
        if (!received || received <= 0 || received > quantity) {
          throw new Error("Received must be between 1 and quantity");
        }

        // Lock and load the source PO item
        const sourcePoi = await PurchaseOrderItems.findByPk(sourceItemId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!sourcePoi || sourcePoi.isDeleted) {
          throw new Error("Source item not found");
        }

        // Ensure we have or generate an itemGroupId for linking
        let groupId = sourcePoi.itemGroupId;
        if (!groupId) {
          // If source doesn't have one, assign a new one and update source
          groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await PurchaseOrderItems.update(
            { itemGroupId: groupId },
            { where: { id: sourcePoi.id }, transaction: t },
          );
        }

        // Create a NEW PurchaseOrderItems row with the same groupId
        // Use the source item's original quantity, not the received amount
        const newPoi = await PurchaseOrderItems.create(
          {
            purchaseOrderId: sourcePoi.purchaseOrderId,
            itemName: sourcePoi.itemName,
            description: description || sourcePoi.description,
            generalDescription:
              generalDescription || sourcePoi.generalDescription,
            specification: specification || sourcePoi.specification,
            unit: sourcePoi.unit,
            quantity: sourcePoi.quantity, // Copy original quantity
            unitCost: sourcePoi.unitCost,
            amount:
              Number(sourcePoi.quantity || 0) * Number(sourcePoi.unitCost || 0),
            category: sourcePoi.category,
            tag: sourcePoi.tag,
            inventoryNumber: sourcePoi.inventoryNumber,
            actualQuantityReceived: received,
            itemGroupId: groupId, // Link to the same group
            isReceiptLine: true, // Mark as a receipt line
            createdBy: user.name || user.id,
            updatedBy: user.name || user.id,
          },
          { transaction: t },
        );

        // Load existing IAR to inherit doc IDs
        const existingIar = await inspectionAcceptanceReport.findOne({
          where: { iarId, isDeleted: false },
          order: [["createdAt", "DESC"]],
          transaction: t,
        });

        // Create IAR row for the new PO item
        const iarRow = await inspectionAcceptanceReport.create(
          {
            itemName: newPoi.itemName,
            description: newPoi.description,
            generalDescription: newPoi.generalDescription,
            specification: newPoi.specification,
            unit: newPoi.unit,
            quantity: newPoi.quantity,
            unitCost: newPoi.unitCost,
            amount: newPoi.amount,
            category: newPoi.category,
            tag: newPoi.tag,
            inventoryNumber: newPoi.inventoryNumber,
            iarId,
            purchaseOrderId: newPoi.purchaseOrderId,
            purchaseOrderItemId: newPoi.id,
            actualQuantityReceived: received,
            createdBy: user.name || user.id,
            updatedBy: user.name || user.id,
            // inherit document IDs if present
            parId: existingIar?.parId || null,
            icsId: existingIar?.icsId || null,
            risId: existingIar?.risId || null,
          },
          { transaction: t },
        );

        // Create history entry
        await PurchaseOrderItemsHistory.create(
          {
            purchaseOrderItemId: newPoi.id,
            purchaseOrderId: newPoi.purchaseOrderId,
            itemName: newPoi.itemName || "",
            description: newPoi.description,
            previousQuantity: 0,
            newQuantity: newPoi.quantity,
            previousActualQuantityReceived: 0,
            newActualQuantityReceived: received,
            previousAmount: 0,
            newAmount: newPoi.amount,
            iarId: iarRow.iarId || iarId,
            parId: iarRow.parId || null,
            risId: iarRow.risId || null,
            icsId: iarRow.icsId || null,
            changeType: "item_creation",
            changedBy: user.name || user.id,
            changeReason: `New line item created from source item ${sourceItemId} with itemGroupId ${groupId}`,
          },
          { transaction: t },
        );

        await t.commit();
        return {
          success: true,
          newItemId: newPoi.id,
          iarId,
          message: `Created new line item (ID: ${newPoi.id}) linked by itemGroupId: ${groupId}`,
        };
      } catch (error) {
        await t.rollback();
        console.error("createLineItemFromExisting error:", error);
        throw new Error(error.message || "Failed to create line item");
      }
    },

    // Update IAR-specific invoice, invoiceDate, income, mds, details
    updateIARInvoice: async (
      _,
      { iarId, invoice, invoiceDate, income, mds, details },
      context,
    ) => {
      const t = await sequelize.transaction();
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        if (!iarId) {
          throw new Error("IAR ID is required.");
        }

        // Build the update object with only provided fields
        const updateData = {};
        if (invoice !== undefined) updateData.invoice = invoice;
        if (invoiceDate !== undefined) updateData.invoiceDate = invoiceDate;
        if (income !== undefined) updateData.income = income;
        if (mds !== undefined) updateData.mds = mds;
        if (details !== undefined) updateData.details = details;

        // Update all records that match the iar_id
        const [updatedCount] = await inspectionAcceptanceReport.update(
          updateData,
          {
            where: { iarId },
            transaction: t,
          },
        );

        await t.commit();

        return {
          success: true,
          message: `Updated ${updatedCount} IAR record(s).`,
          iarId,
          invoice: invoice ?? null,
          invoiceDate: invoiceDate ?? null,
          income: income ?? null,
          mds: mds ?? null,
          details: details ?? null,
          updatedCount,
        };
      } catch (error) {
        await t.rollback();
        console.error("updateIARInvoice error:", error);
        throw new Error(error.message || "Failed to update IAR");
      }
    },

    // Split items by quantity and assign separate ICS IDs with per-split signatories
    splitAndAssignICS: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { itemSplits } = input;
        const allResultIds = [];

        // Reset ICS ID batch counter so sequential IDs are generated properly
        resetIcsIdBatch();

        const transaction = await sequelize.transaction();

        try {
          for (const itemSplit of itemSplits) {
            const { itemId, splits } = itemSplit;

            const original = await inspectionAcceptanceReport.findByPk(itemId, {
              transaction,
              include: [PurchaseOrder],
            });

            if (!original) {
              throw new Error(`Item with ID ${itemId} not found`);
            }

            if (splits.length === 0) {
              throw new Error("At least one split is required per item");
            }

            // Validate tag for ICS ID generation
            const tag = original.tag;
            if (!tag || (tag !== "high" && tag !== "low")) {
              throw new Error(
                `Item tag must be 'high' or 'low' for ICS ID generation. Got: '${tag}'`,
              );
            }

            // Generate a split group ID to track all pieces back to this original
            const splitGroupId = `SPL-${original.id}-${Date.now()}`;
            const originalItemId = original.id;
            const totalSplits = splits.length;

            // Calculate equal amount per split (divide original amount equally)
            const originalAmount = parseFloat(original.amount || 0);
            const equalAmountPerSplit = parseFloat(
              (originalAmount / totalSplits).toFixed(2),
            );
            // Handle rounding remainder: give any leftover cents to the first split
            const firstSplitAmount = parseFloat(
              (
                originalAmount -
                equalAmountPerSplit * (totalSplits - 1)
              ).toFixed(2),
            );

            // First split: update the original record
            const firstSplit = splits[0];
            const firstIcsId = await generateNewIcsId(tag);

            await original.update(
              {
                actualQuantityReceived: firstSplit.quantity,
                amount: firstSplitAmount,
                icsId: firstIcsId,
                icsReceivedFrom: firstSplit.receivedFrom,
                icsReceivedFromPosition: firstSplit.receivedFromPosition || "",
                icsReceivedBy: firstSplit.receivedBy,
                icsReceivedByPosition: firstSplit.receivedByPosition || "",
                icsDepartment: firstSplit.department || "",
                icsAssignedDate: new Date(),
                splitGroupId: splitGroupId,
                splitFromItemId: originalItemId,
                splitIndex: 1,
              },
              { transaction },
            );

            allResultIds.push(original.id);

            // Additional splits: clone the original record
            for (let i = 1; i < splits.length; i++) {
              const split = splits[i];
              const newIcsId = await generateNewIcsId(tag);
              const originalData = original.toJSON();

              const clonedRecord = await inspectionAcceptanceReport.create(
                {
                  iarId: originalData.iarId,
                  risId: originalData.risId,
                  parId: originalData.parId,
                  purchaseOrderId: originalData.purchaseOrderId,
                  purchaseOrderItemId: originalData.purchaseOrderItemId,
                  iarStatus: originalData.iarStatus,
                  description: originalData.description,
                  unit: originalData.unit,
                  quantity: originalData.quantity,
                  unitCost: originalData.unitCost,
                  category: originalData.category,
                  tag: originalData.tag,
                  isDeleted: 0,
                  createdBy: originalData.createdBy,
                  updatedBy: originalData.updatedBy,
                  inventoryNumber: originalData.inventoryNumber,
                  itemName: originalData.itemName,
                  invoice: originalData.invoice,
                  invoiceDate: originalData.invoiceDate,
                  income: originalData.income,
                  mds: originalData.mds,
                  details: originalData.details,
                  actualQuantityReceived: split.quantity,
                  amount: equalAmountPerSplit,
                  icsId: newIcsId,
                  icsReceivedFrom: split.receivedFrom,
                  icsReceivedFromPosition: split.receivedFromPosition || "",
                  icsReceivedBy: split.receivedBy,
                  icsReceivedByPosition: split.receivedByPosition || "",
                  icsDepartment: split.department || "",
                  icsAssignedDate: new Date(),
                  splitGroupId: splitGroupId,
                  splitFromItemId: originalItemId,
                  splitIndex: i + 1,
                },
                { transaction },
              );

              allResultIds.push(clonedRecord.id);
            }
          }

          await transaction.commit();

          const resultItems = await inspectionAcceptanceReport.findAll({
            where: { id: { [Op.in]: allResultIds } },
            include: [PurchaseOrder],
          });

          return resultItems;
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in splitAndAssignICS:", error);
        throw new Error(error.message || "Failed to split and assign ICS");
      }
    },

    // Create a single ICS assignment (saves immediately, clones from source)
    createSingleICSAssignment: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const {
          sourceItemId,
          quantity,
          department,
          receivedFrom,
          receivedFromPosition,
          receivedBy,
          receivedByPosition,
        } = input;

        // Fetch the source item
        const sourceItem = await inspectionAcceptanceReport.findByPk(
          sourceItemId,
          {
            include: [PurchaseOrder],
          },
        );

        if (!sourceItem) {
          throw new Error(`Source item with ID ${sourceItemId} not found`);
        }

        const currentReceived = sourceItem.actualQuantityReceived || 0;
        if (quantity > currentReceived) {
          throw new Error(
            `Quantity (${quantity}) exceeds available (${currentReceived})`,
          );
        }
        if (quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }

        const sourceData = sourceItem.toJSON();

        // Validate tag for ICS ID generation
        if (
          !sourceData.tag ||
          (sourceData.tag !== "high" && sourceData.tag !== "low")
        ) {
          throw new Error(
            `Item tag must be 'high' or 'low' for ICS ID generation. Got: '${sourceData.tag}'`,
          );
        }

        // Generate new ICS ID using the item's tag
        const newIcsId = await generateNewIcsId(sourceData.tag);

        // Use transaction for atomicity
        const transaction = await sequelize.transaction();

        try {
          // Create new record with the assigned quantity and ICS ID
          const newItem = await inspectionAcceptanceReport.create(
            {
              iarId: sourceData.iarId,
              risId: sourceData.risId,
              parId: sourceData.parId,
              purchaseOrderId: sourceData.purchaseOrderId,
              purchaseOrderItemId: sourceData.purchaseOrderItemId,
              iarStatus: sourceData.iarStatus,
              description: sourceData.description,
              unit: sourceData.unit,
              quantity: sourceData.quantity,
              unitCost: sourceData.unitCost,
              category: sourceData.category,
              tag: sourceData.tag,
              isDeleted: 0,
              createdBy: sourceData.createdBy,
              updatedBy: sourceData.updatedBy,
              inventoryNumber: sourceData.inventoryNumber,
              itemName: sourceData.itemName,
              invoice: sourceData.invoice,
              invoiceDate: sourceData.invoiceDate,
              income: sourceData.income,
              mds: sourceData.mds,
              details: sourceData.details,
              // Assignment-specific fields
              actualQuantityReceived: quantity,
              amount: quantity * parseFloat(sourceData.unitCost || 0),
              icsId: newIcsId,
              icsReceivedFrom: receivedFrom,
              icsReceivedFromPosition: receivedFromPosition || "",
              icsReceivedBy: receivedBy,
              icsReceivedByPosition: receivedByPosition || "",
              icsDepartment: department || "",
              icsAssignedDate: new Date(),
            },
            { transaction },
          );

          // Update source item: reduce actualQuantityReceived
          const newSourceQty = currentReceived - quantity;
          await sourceItem.update(
            { actualQuantityReceived: newSourceQty },
            { transaction },
          );

          await transaction.commit();

          // Fetch updated items with associations
          const updatedNewItem = await inspectionAcceptanceReport.findByPk(
            newItem.id,
            {
              include: [PurchaseOrder],
            },
          );
          const updatedSourceItem = await inspectionAcceptanceReport.findByPk(
            sourceItemId,
            {
              include: [PurchaseOrder],
            },
          );

          return {
            newItem: updatedNewItem,
            sourceItem: updatedSourceItem,
            generatedIcsId: newIcsId,
          };
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in createSingleICSAssignment:", error);
        throw new Error(error.message || "Failed to create ICS assignment");
      }
    },

    // Create a multi-item ICS assignment (multiple items share one ICS ID per end user)
    createMultiItemICSAssignment: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const {
          items,
          department,
          receivedFrom,
          receivedFromPosition,
          receivedBy,
          receivedByPosition,
        } = input;

        if (!items || items.length === 0) {
          throw new Error("At least one item is required");
        }

        // All items in a multi-ICS batch must share the same tag for ICS ID generation
        // Use the first item's tag to generate the shared ID
        const firstSource = await inspectionAcceptanceReport.findByPk(
          items[0].sourceItemId,
        );
        if (!firstSource) {
          throw new Error(
            `Source item with ID ${items[0].sourceItemId} not found`,
          );
        }
        const sharedTag = firstSource.tag;
        if (!sharedTag || (sharedTag !== "high" && sharedTag !== "low")) {
          throw new Error(
            `Item tag must be 'high' or 'low' for ICS ID generation. Got: '${sharedTag}'`,
          );
        }

        // Generate a single ICS ID for all items
        const sharedIcsId = await generateNewIcsId(sharedTag);

        const transaction = await sequelize.transaction();
        const newItemIds = [];
        const sourceItemIds = [];

        try {
          for (const entry of items) {
            const { sourceItemId, quantity } = entry;

            const sourceItem = await inspectionAcceptanceReport.findByPk(
              sourceItemId,
              {
                include: [PurchaseOrder],
                transaction,
              },
            );

            if (!sourceItem) {
              throw new Error(`Source item with ID ${sourceItemId} not found`);
            }

            const currentReceived = sourceItem.actualQuantityReceived || 0;
            if (quantity > currentReceived) {
              throw new Error(
                `Quantity (${quantity}) exceeds available (${currentReceived}) for item "${sourceItem.description}"`,
              );
            }
            if (quantity <= 0) {
              throw new Error("Quantity must be greater than 0");
            }

            const sourceData = sourceItem.toJSON();

            const newItem = await inspectionAcceptanceReport.create(
              {
                iarId: sourceData.iarId,
                risId: sourceData.risId,
                parId: sourceData.parId,
                purchaseOrderId: sourceData.purchaseOrderId,
                purchaseOrderItemId: sourceData.purchaseOrderItemId,
                iarStatus: sourceData.iarStatus,
                description: sourceData.description,
                unit: sourceData.unit,
                quantity: sourceData.quantity,
                unitCost: sourceData.unitCost,
                category: sourceData.category,
                tag: sourceData.tag,
                isDeleted: 0,
                createdBy: sourceData.createdBy,
                updatedBy: sourceData.updatedBy,
                inventoryNumber: sourceData.inventoryNumber,
                itemName: sourceData.itemName,
                invoice: sourceData.invoice,
                invoiceDate: sourceData.invoiceDate,
                income: sourceData.income,
                mds: sourceData.mds,
                details: sourceData.details,
                actualQuantityReceived: quantity,
                amount: quantity * parseFloat(sourceData.unitCost || 0),
                icsId: sharedIcsId,
                icsReceivedFrom: receivedFrom,
                icsReceivedFromPosition: receivedFromPosition || "",
                icsReceivedBy: receivedBy,
                icsReceivedByPosition: receivedByPosition || "",
                icsDepartment: department || "",
                icsAssignedDate: new Date(),
              },
              { transaction },
            );

            newItemIds.push(newItem.id);

            const newSourceQty = currentReceived - quantity;
            await sourceItem.update(
              { actualQuantityReceived: newSourceQty },
              { transaction },
            );

            sourceItemIds.push(sourceItemId);
          }

          await transaction.commit();

          const newItems = await inspectionAcceptanceReport.findAll({
            where: { id: { [Op.in]: newItemIds } },
            include: [PurchaseOrder],
          });
          const sourceItems = await inspectionAcceptanceReport.findAll({
            where: { id: { [Op.in]: sourceItemIds } },
            include: [PurchaseOrder],
          });

          return {
            newItems,
            sourceItems,
            generatedIcsId: sharedIcsId,
          };
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in createMultiItemICSAssignment:", error);
        throw new Error(
          error.message || "Failed to create multi-item ICS assignment",
        );
      }
    },

    // Add an item to an existing ICS ID
    addItemToExistingICS: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { sourceItemId, quantity, existingIcsId } = input;

        if (!existingIcsId) {
          throw new Error("Existing ICS ID is required");
        }

        const existingICSItem = await inspectionAcceptanceReport.findOne({
          where: { icsId: existingIcsId, isDeleted: false },
        });

        if (!existingICSItem) {
          throw new Error(
            `No existing item found with ICS ID "${existingIcsId}"`,
          );
        }

        const sourceItem = await inspectionAcceptanceReport.findByPk(
          sourceItemId,
          {
            include: [PurchaseOrder],
          },
        );

        if (!sourceItem) {
          throw new Error(`Source item with ID ${sourceItemId} not found`);
        }

        const currentReceived = sourceItem.actualQuantityReceived || 0;
        if (quantity > currentReceived) {
          throw new Error(
            `Quantity (${quantity}) exceeds available (${currentReceived})`,
          );
        }
        if (quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }

        const sourceData = sourceItem.toJSON();
        const transaction = await sequelize.transaction();

        try {
          const newItem = await inspectionAcceptanceReport.create(
            {
              iarId: sourceData.iarId,
              risId: sourceData.risId,
              parId: sourceData.parId,
              purchaseOrderId: sourceData.purchaseOrderId,
              purchaseOrderItemId: sourceData.purchaseOrderItemId,
              iarStatus: sourceData.iarStatus,
              description: sourceData.description,
              unit: sourceData.unit,
              quantity: sourceData.quantity,
              unitCost: sourceData.unitCost,
              category: sourceData.category,
              tag: sourceData.tag,
              isDeleted: 0,
              createdBy: sourceData.createdBy,
              updatedBy: sourceData.updatedBy,
              inventoryNumber: sourceData.inventoryNumber,
              itemName: sourceData.itemName,
              invoice: sourceData.invoice,
              invoiceDate: sourceData.invoiceDate,
              income: sourceData.income,
              mds: sourceData.mds,
              details: sourceData.details,
              actualQuantityReceived: quantity,
              amount: quantity * parseFloat(sourceData.unitCost || 0),
              icsId: existingIcsId,
              icsReceivedFrom: existingICSItem.icsReceivedFrom,
              icsReceivedFromPosition: existingICSItem.icsReceivedFromPosition,
              icsReceivedBy: existingICSItem.icsReceivedBy,
              icsReceivedByPosition: existingICSItem.icsReceivedByPosition,
              icsDepartment: existingICSItem.icsDepartment,
              icsAssignedDate: new Date(),
            },
            { transaction },
          );

          const newSourceQty = currentReceived - quantity;
          await sourceItem.update(
            { actualQuantityReceived: newSourceQty },
            { transaction },
          );

          await transaction.commit();

          const updatedNewItem = await inspectionAcceptanceReport.findByPk(
            newItem.id,
            {
              include: [PurchaseOrder],
            },
          );
          const updatedSourceItem = await inspectionAcceptanceReport.findByPk(
            sourceItemId,
            {
              include: [PurchaseOrder],
            },
          );

          return {
            newItem: updatedNewItem,
            sourceItem: updatedSourceItem,
            icsId: existingIcsId,
          };
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in addItemToExistingICS:", error);
        throw new Error(error.message || "Failed to add item to existing ICS");
      }
    },

    // Update an existing ICS assignment
    updateICSAssignment: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const {
          itemId,
          quantity,
          department,
          receivedFrom,
          receivedFromPosition,
          receivedBy,
          receivedByPosition,
        } = input;

        const item = await inspectionAcceptanceReport.findByPk(itemId);
        if (!item) {
          throw new Error(`Item with ID ${itemId} not found`);
        }

        // Build update object with only provided fields
        const updateData = {};
        if (quantity !== undefined && quantity !== null) {
          updateData.actualQuantityReceived = quantity;
          updateData.amount = quantity * parseFloat(item.unitCost || 0);
        }
        if (department !== undefined) updateData.icsDepartment = department;
        if (receivedFrom !== undefined)
          updateData.icsReceivedFrom = receivedFrom;
        if (receivedFromPosition !== undefined)
          updateData.icsReceivedFromPosition = receivedFromPosition;
        if (receivedBy !== undefined) updateData.icsReceivedBy = receivedBy;
        if (receivedByPosition !== undefined)
          updateData.icsReceivedByPosition = receivedByPosition;

        await item.update(updateData);

        // Return updated item with associations
        const updatedItem = await inspectionAcceptanceReport.findByPk(itemId, {
          include: [PurchaseOrder],
        });

        return updatedItem;
      } catch (error) {
        console.error("Error in updateICSAssignment:", error);
        throw new Error(error.message || "Failed to update ICS assignment");
      }
    },

    updateItemPurpose: async (_, { ids, purpose }, context) => {
      try {
        const [updatedCount] = await inspectionAcceptanceReport.update(
          { purpose },
          { where: { id: ids } },
        );
        return {
          success: true,
          message: `Updated purpose for ${updatedCount} item(s)`,
          updatedCount,
        };
      } catch (error) {
        console.error("Error in updateItemPurpose:", error);
        throw new Error(error.message || "Failed to update purpose");
      }
    },

    updateItemRemarks: async (_, { ids, remarks }, context) => {
      try {
        const [updatedCount] = await inspectionAcceptanceReport.update(
          { remarks },
          { where: { id: ids } },
        );
        return {
          success: true,
          message: `Updated remarks for ${updatedCount} item(s)`,
          updatedCount,
        };
      } catch (error) {
        console.error("Error in updateItemRemarks:", error);
        throw new Error(error.message || "Failed to update remarks");
      }
    },
  },
};

export default inspectionAcceptanceReportResolver;
