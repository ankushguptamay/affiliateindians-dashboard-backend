module.exports = (sequelize, Sequelize) => {
    const Member = sequelize.define("member", {
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
      },
      mobileNumber: {
        type: Sequelize.STRING,
      },
      lastTrainingDay: {
        type: Sequelize.DATEONLY,
      }
    });
    return Member;
};