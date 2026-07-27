export async function up(queryInterface, Sequelize) {
  const cols = await queryInterface.describeTable('purchase_order_items');

  if (!cols.delivery_status) {
    await queryInterface.addColumn('purchase_order_items', 'delivery_status', {
      type: Sequelize.ENUM('pending', 'delivered', 'partial'),
      allowNull: true,
      defaultValue: 'pending',
      comment: 'Track item delivery status independently of IAR receipt',
    });
  }

  if (!cols.delivered_date) {
    await queryInterface.addColumn('purchase_order_items', 'delivered_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'Date when item was delivered',
    });
  }

  if (!cols.delivery_notes) {
    await queryInterface.addColumn('purchase_order_items', 'delivery_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notes about the delivery (e.g. follow-up needed, backordered)',
    });
  }
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('purchase_order_items', 'delivery_notes');
  await queryInterface.removeColumn('purchase_order_items', 'delivered_date');
  await queryInterface.removeColumn('purchase_order_items', 'delivery_status');
}
