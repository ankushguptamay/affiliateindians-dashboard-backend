module.exports = (sequelize, Sequelize) => {
    const User_Tag = sequelize.define("user_tag", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      }
    });
    return User_Tag;
};