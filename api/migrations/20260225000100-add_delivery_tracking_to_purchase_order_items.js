"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add delivery tracking fields to purchase_order_items
    await queryInterface.addColumn("purchase_order_items", "delivery_status", {
      type: Sequelize.ENUM("pending", "delivered", "partial"),
      allowNull: true,
      defaultValue: "pending",
      comment: "Track item delivery status independently of IAR receipt",
    });

    await queryInterface.addColumn("purchase_order_items", "delivered_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: "Date when item was delivered",
    });

    await queryInterface.addColumn("purchase_order_items", "delivery_notes", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Notes about the delivery (e.g. follow-up needed, backordered)",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("purchase_order_items", "delivery_notes");
    await queryInterface.removeColumn("purchase_order_items", "delivered_date");
    await queryInterface.removeColumn(
      "purchase_order_items",
      "delivery_status",
    );
  },
};
