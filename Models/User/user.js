module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    mobileNumber: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    pinCode: {
      type: DataTypes.INTEGER,
    },
    password: {
      type: DataTypes.STRING,
    },
    userCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    referalId: {
      type: DataTypes.STRING
    },
    termAndConditionAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    paranoid: true
  });
  return User;
};