module.exports = (sequelize, DataTypes) => {
    const AdminWallet = sequelize.define("adminWallet", {
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
    return AdminWallet;
}

// foriegn key
// adminId