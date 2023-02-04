module.exports = (sequelize, Sequelize) => {
    const Lead = sequelize.define("lead", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      funnel: {
        type: Sequelize.STRING,
      },
      tag: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      }
    });
    return Lead;
};