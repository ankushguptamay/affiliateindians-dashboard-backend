module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define("admin", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    adminTag: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['SUPERADMIN', 'ADMIN']]
      },
      defaultValue: 'ADMIN'
    },
    adminCode: {
      type: DataTypes.STRING
    },
    termAndConditionAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    paranoid: true
  });
  return Admin;
};
