module.exports = (sequelize, DataTypes) => {
    const Coupon = sequelize.define("coupons", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        couponName: {
            type: DataTypes.STRING // their should be a coupon with GENERAL applicable for all course
        },
        couponCode: {
            type: DataTypes.STRING
        },
        validTill:{
            type: DataTypes.STRING
        },
        couponType:{
            type: DataTypes.STRING,
            validate: {
                isIn: [['PERCENT', 'INTEGER']]
            }
        },
        percentageValue:{
            type: DataTypes.STRING
        },
        integerValue:{
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return Coupon;
};