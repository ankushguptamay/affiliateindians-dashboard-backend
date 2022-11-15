module.exports = (sequelize, Sequelize) => {
    const MyBooking = sequelize.define("myBooking", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      timing: {
        type: Sequelize.TIME,
      },
      advisorName: {
        type: Sequelize.STRING,
      }
    });
    return MyBooking;
};