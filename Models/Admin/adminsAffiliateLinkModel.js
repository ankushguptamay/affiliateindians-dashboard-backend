module.exports = (sequelize, DataTypes) => {
    const AdminsAffiliateLink = sequelize.define("adminsAffiliateLinks", {
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
        }
    }, {
        paranoid: true
    });
    return AdminsAffiliateLink;
};

// foreignKey
// adminId
// courseId