import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Import the Sequelize models
import PurchaseOrderItemsHistory from "../models/purchaseorderitemshistory.js"; // Import history model
import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { sequelize } from "../db/connectDB.js";
import { customAlphabet } from "nanoid";
import { omitId } from "../utils/helper.js";
import { Op, Sequelize } from "sequelize";
import { generateNewIcsId } from "../utils/icsIdGenerator.js"; // Import the ICS ID generator function
const nanoid = customAlphabet("1234567890meguizomarkoliver", 10);
const inspectionAcceptanceReportResolver = {
  Query: {
    inspectionAcceptanceReport: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const inspectionAcceptanceReportdata =
          await inspectionAcceptanceReport.findAll({
            where: { isDeleted: false },
            order: [["id", "DESC"]],
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
          error
        );
        throw new Error(
          "Failed to retrieve unique inspection acceptance reports."
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
        console.log("--- IAR ITEMS ---");
        console.log(iarItems);
        console.log("--- END IAR ITEMS ---");
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
              `Processing tag: ${tag} with items: [${idsInGroup.join(", ")}]`
            );

            const newIcsId = await generateNewIcsId(tag);
            console.log(
              `Generated ICS ID: ${newIcsId} for tag "${tag}" and items: [${idsInGroup.join(
                ", "
              )}]`
            );

            await inspectionAcceptanceReport.update(
              { icsId: newIcsId },
              {
                where: { id: { [Op.in]: idsInGroup } },
                transaction: t,
              }
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
    updateIARStatus: async (_, { id, iarStatus }, context) => {
      const t = await sequelize.transaction();
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const iar = await inspectionAcceptanceReport.findByPk(id, {
          transaction: t,
        });
        if (!iar) {
          throw new Error("IAR not found");
        }
        iar.iarStatus = iarStatus;
        await iar.save({ transaction: t });
        await t.commit();
        return {
          id: iar.id,
          iarStatus: iar.iarStatus,
          message: "Status updated successfully",
          success: true, // Add this field
        };
      } catch (error) {
        await t.rollback();
        console.error("Error updating IAR status:", error);
        throw new Error(error.message || "Failed to update IAR status");
      }
    },
  },
};

export default inspectionAcceptanceReportResolver;
