module.exports = (sequelize, Sequelize) => {
  const ScheduleCallBooking = sequelize.define("scheduleCallBookings", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userName: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    timing: {
      type: Sequelize.TIME,
    },
    month: {
      type: Sequelize.STRING
    },
    bookingStatus: {
      type: Sequelize.STRING,
      validate: {
        isIn: [['BOOKED', 'AVAILABLE']]
      },
      defaultValue: 'AVAILABLE'
    },
    createrAvailablity: {
      type: Sequelize.STRING,
      validate: {
        isIn: [['PAUSED', 'UNPAUSED']]
      }
    }
  });
  return ScheduleCallBooking;
};

// adminId
// userId