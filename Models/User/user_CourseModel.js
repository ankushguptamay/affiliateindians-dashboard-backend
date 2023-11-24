module.exports = (sequelize, DataTypes) => {
  const User_Course = sequelize.define("user_course", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    amount: {
      type: DataTypes.STRING
    },
    currency: {
      type: DataTypes.STRING
    },
    receipt: {
      type: DataTypes.STRING
    },
    razorpayOrderId: {
      type: DataTypes.STRING
    },
    razorpayPaymentId: {
      type: DataTypes.STRING
    },
    razorpayTime: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING
    },
    verify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    referalId: {
      type: DataTypes.STRING
    },
    joinThrough: {
      type: DataTypes.STRING // facebook, insta, ...
    },
    couponCode: {
      type: DataTypes.STRING
    },
    saleLinkTag: {
      type: DataTypes.STRING
    }
  }, {
    paranoid: true
  });
  return User_Course;
};

// ForeignKey
// courseId
// userId