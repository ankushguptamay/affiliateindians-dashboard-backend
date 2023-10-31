module.exports = (sequelize, DataTypes) => {
    const UserWallet = sequelize.define("userWallet", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    })
    return UserWallet;
}

// foriegn key
// userId