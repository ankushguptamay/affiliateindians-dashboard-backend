module.exports = (sequelize, DataTypes) => {
    const Course_Coupon = sequelize.define("course_coupon", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['DEFAULT', 'SECONDARY']]
            },
            defaultValue: 'SECONDARY'
        }
    }, {
        paranoid: true
    });
    return Course_Coupon;
};

// ForeignKey
// courseId
// couponId