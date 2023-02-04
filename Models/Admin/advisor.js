module.exports = (sequelize, Sequelize) => {
    const Advisor = sequelize.define("advisor", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      image: {
        type: Sequelize.STRING,
      }
    });
    return Advisor;
};