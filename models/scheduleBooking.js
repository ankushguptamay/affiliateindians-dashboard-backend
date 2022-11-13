module.exports = (sequelize, Sequelize) => {
    const ScheduleBooking = sequelize.define("scheduleBooking", {
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
    return ScheduleBooking;
};