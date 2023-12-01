module.exports = (sequelize, Sequelize) => {
  const ScheduleCallBooking = sequelize.define("scheduleCallBookings", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userName: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    timing: {
      type: Sequelize.STRING,
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