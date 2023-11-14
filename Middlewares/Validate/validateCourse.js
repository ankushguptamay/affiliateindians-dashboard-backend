const joi = require('joi');

exports.courseValidation = (data) => {
    const schema = joi.object().keys({
        title: joi.string().required(),
        ratioId: joi.string().optional()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.couponValidation = (data) => {
    const schema = joi.object().keys({
        couponName: joi.string().required(),
        validTill: joi.string().required(),
        couponType: joi.string().required(),
        percentageValue: joi.string().optional(),
        integerValue: joi.string().optional(),
        coursesId: joi.array().optional()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.addCouponToCourse = (data) => {
    const schema = joi.object().keys({
        couponsId: joi.string().required(),
        courseId: joi.array().required(),
        type: joi.array().optional()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.applyCouponToCourse = (data) => {
    const schema = joi.object().keys({
        couponCode: joi.string().required(),
        courseId: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.updateCouponValidation = (data) => {
    const schema = joi.object().keys({
        couponName: joi.string().required(),
        validTill: joi.string().required(),
        couponType: joi.string().required(),
        percentageValue: joi.string().optional(),
        integerValue: joi.string().optional(),
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}