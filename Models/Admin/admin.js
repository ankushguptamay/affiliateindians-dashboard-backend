module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define("admin", {
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
    });
    return Admin;
  };
  