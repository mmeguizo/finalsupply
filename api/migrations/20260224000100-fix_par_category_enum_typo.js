/**
 * Fixes the typo in the category ENUM value:
 * "property acknowledgement reciept" → "property acknowledgement receipt"
 *
 * Affects tables: purchase_order_items, inspection_acceptance_report
 */
export async function up(queryInterface) {
  // Fix purchase_order_items.category enum
  await queryInterface.sequelize.query(`
    ALTER TABLE \`purchase_order_items\`
    MODIFY COLUMN \`category\` ENUM(
      'property acknowledgement receipt',
      'inventory custodian slip',
      'requisition issue slip'
    ) NULL DEFAULT 'requisition issue slip'
  `);
  await queryInterface.sequelize.query(`
    UPDATE \`purchase_order_items\`
    SET \`category\` = 'property acknowledgement receipt'
    WHERE \`category\` = 'property acknowledgement reciept'
  `);

  // Fix inspection_acceptance_report.category enum
  await queryInterface.sequelize.query(`
    ALTER TABLE \`inspection_acceptance_report\`
    MODIFY COLUMN \`category\` ENUM(
      'property acknowledgement receipt',
      'inventory custodian slip',
      'requisition issue slip'
    ) NULL DEFAULT 'requisition issue slip'
  `);
  await queryInterface.sequelize.query(`
    UPDATE \`inspection_acceptance_report\`
    SET \`category\` = 'property acknowledgement receipt'
    WHERE \`category\` = 'property acknowledgement reciept'
  `);
}

export async function down(queryInterface) {
  // Revert inspection_acceptance_report.category enum
  await queryInterface.sequelize.query(`
    UPDATE \`inspection_acceptance_report\`
    SET \`category\` = 'property acknowledgement reciept'
    WHERE \`category\` = 'property acknowledgement receipt'
  `);
  await queryInterface.sequelize.query(`
    ALTER TABLE \`inspection_acceptance_report\`
    MODIFY COLUMN \`category\` ENUM(
      'property acknowledgement reciept',
      'inventory custodian slip',
      'requisition issue slip'
    ) NULL DEFAULT 'requisition issue slip'
  `);

  // Revert purchase_order_items.category enum
  await queryInterface.sequelize.query(`
    UPDATE \`purchase_order_items\`
    SET \`category\` = 'property acknowledgement reciept'
    WHERE \`category\` = 'property acknowledgement receipt'
  `);
  await queryInterface.sequelize.query(`
    ALTER TABLE \`purchase_order_items\`
    MODIFY COLUMN \`category\` ENUM(
      'property acknowledgement reciept',
      'inventory custodian slip',
      'requisition issue slip'
    ) NULL DEFAULT 'requisition issue slip'
  `);
}
