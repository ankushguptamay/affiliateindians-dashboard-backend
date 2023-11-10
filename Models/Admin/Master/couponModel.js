module.exports = (sequelize, DataTypes) => {
    const Coupon = sequelize.define("coupons", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        couponName: {
            type: DataTypes.STRING
        },
        couponCode: {
            type: DataTypes.STRING
        },
        validTill:{
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return Coupon;
};