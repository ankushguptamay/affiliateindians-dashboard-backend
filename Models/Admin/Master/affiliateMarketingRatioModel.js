module.exports = (sequelize, DataTypes) => {
    const AffiliateMarketingRatio = sequelize.define("affiliateMarketingRatios", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        referalRatio: {
            type: DataTypes.STRING
        },
        adminRatio: {
            type: DataTypes.STRING
        },
        ratioName: {
            type: DataTypes.STRING
        },
        ratioCode: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return AffiliateMarketingRatio;
};

//their should a ratio with GENERAL tag applicable for all course