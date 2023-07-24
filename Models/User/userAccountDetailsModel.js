module.exports = (sequelize, Sequelize) => {
    const UserAccountDetails = sequelize.define("userAccountDetails", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      accountHolderName: {
        type: Sequelize.STRING,
      },
      accountNunber: {
        type: Sequelize.STRING,
      },
      bankName: {
        type: Sequelize.STRING,
      },
      branchName: {
        type: Sequelize.STRING,
      },
      IFSCCode: {
        type: Sequelize.STRING,
      },
      payTMNumber: {
        type: Sequelize.STRING,
      },
      gPayNumber: {
        type: Sequelize.STRING,
      },
      phonePayNumber: {
        type: Sequelize.STRING,
      }
    });
    return UserAccountDetails;
};