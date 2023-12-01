module.exports = (sequelize, DataTypes) => {
    const AffiliateUserId = sequelize.define("affiliateUserId", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        affiliateUserId: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['PENDING', 'BLOCK', 'UNBLOCK', 'ACCEPT']]
            }
        }
    }, {
        paranoid: true
    });
    return AffiliateUserId;
};

// userId
// adminId