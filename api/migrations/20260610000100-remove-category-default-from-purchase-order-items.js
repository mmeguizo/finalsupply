import { DataTypes } from "sequelize";

/**
 * Removes the default value from the category column on purchase_order_items.
 * Category should be null until explicitly set when an IAR is generated.
 */
export async function up(queryInterface) {
  await queryInterface.changeColumn("purchase_order_items", "category", {
    type: DataTypes.ENUM(
      "property acknowledgement reciept",
      "inventory custodian slip",
      "requisition issue slip",
    ),
    allowNull: true,
    defaultValue: null,
  });
}

export async function down(queryInterface) {
  await queryInterface.changeColumn("purchase_order_items", "category", {
    type: DataTypes.ENUM(
      "property acknowledgement reciept",
      "inventory custodian slip",
      "requisition issue slip",
    ),
    allowNull: true,
    defaultValue: "requisition issue slip",
  });
}
