module.exports = (sequelize, Sequelize) => {
    const EWallet = sequelize.define("eWallet", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.DOUBLE,
      },
      redeemDate: {
        type: Sequelize.DATE,
      },
      action: {
        type: Sequelize.STRING,
      }
    });
    return EWallet;
};