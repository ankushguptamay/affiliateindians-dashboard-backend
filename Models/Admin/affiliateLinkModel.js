module.exports = (sequelize, DataTypes) => {
    const AffiliateLink = sequelize.define("affiliateLinks", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        originalLink: {
            type: DataTypes.STRING,
            allowNull: false
        },
        saleLinkCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        numberOfHit: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        linkType: {
            type: DataTypes.STRING
        },
        affiliateUserId: {
            type: DataTypes.STRING
        },
        marketingTag: {
            type: DataTypes.STRING
        },
        courseName: {
            type: DataTypes.STRING
        },
    }, {
        paranoid: true
    });
    return AffiliateLink;
};

// foreignKey
// adminId
// userId
// courseId
// affiliateUserId