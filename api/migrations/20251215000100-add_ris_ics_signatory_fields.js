
import { DataTypes } from 'sequelize';


export default {
  up: async (queryInterface, Sequelize) => {
    const tableName = "inspection_acceptance_report";
    const cols = await queryInterface.describeTable(tableName);

    const addIfMissing = async (name, definition) => {
      if (!cols[name]) {
        await queryInterface.addColumn(tableName, name, definition);
        console.log(`Added column ${name}`);
      } else {
        console.log(`Skipping existing column ${name}`);
      }
    };

    await addIfMissing("ris_received_from", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "RIS signatory - Received From name",
    });
    await addIfMissing("ris_received_from_position", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "RIS signatory - Received From position",
    });
    await addIfMissing("ris_received_by", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "RIS signatory - Received By name",
    });
    await addIfMissing("ris_received_by_position", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "RIS signatory - Received By position",
    });
    await addIfMissing("ris_department", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "RIS assigned department",
    });
    await addIfMissing("ris_assigned_date", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "RIS assignment date",
    });

    await addIfMissing("ics_received_from", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "ICS signatory - Received From name",
    });
    await addIfMissing("ics_received_from_position", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "ICS signatory - Received From position",
    });
    await addIfMissing("ics_received_by", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "ICS signatory - Received By name",
    });
    await addIfMissing("ics_received_by_position", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "ICS signatory - Received By position",
    });
    await addIfMissing("ics_department", {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "ICS assigned department",
    });
    await addIfMissing("ics_assigned_date", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "ICS assignment date",
    });
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = "inspection_acceptance_report";
    const cols = await queryInterface.describeTable(tableName);

    const removeIfExists = async (name) => {
      if (cols[name]) {
        await queryInterface.removeColumn(tableName, name);
        console.log(`Removed column ${name}`);
      } else {
        console.log(`Column ${name} not present — skipping`);
      }
    };

    await removeIfExists("ris_received_from");
    await removeIfExists("ris_received_from_position");
    await removeIfExists("ris_received_by");
    await removeIfExists("ris_received_by_position");
    await removeIfExists("ris_department");
    await removeIfExists("ris_assigned_date");

    await removeIfExists("ics_received_from");
    await removeIfExists("ics_received_from_position");
    await removeIfExists("ics_received_by");
    await removeIfExists("ics_received_by_position");
    await removeIfExists("ics_department");
    await removeIfExists("ics_assigned_date");
  },
};