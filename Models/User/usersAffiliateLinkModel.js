module.exports = (sequelize, DataTypes) => {
    const UsersAffiliateLink = sequelize.define("usersAffiliateLinks", {
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
        marketingTag: {
            type: DataTypes.STRING
        },
        courseName: {
            type: DataTypes.STRING
        },
        aid: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return UsersAffiliateLink;
};

// foreignKey
// adminId
// courseId
// userId
// affiliateUserId