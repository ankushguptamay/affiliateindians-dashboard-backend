module.exports = (sequelize, DataTypes) => {
    const AffiliateUserIdRequest = sequelize.define("affiliateUserIdRequest", {
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
    return AffiliateUserIdRequest;
};