module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define("admin", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    }
  }, {
    paranoid: true
  });
  return Admin;
};
