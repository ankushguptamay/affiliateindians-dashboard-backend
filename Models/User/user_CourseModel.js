module.exports = (sequelize, DataTypes) => {
  const User_Course = sequelize.define("user_course", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  }, {
    paranoid: true
  });
  return User_Course;
};