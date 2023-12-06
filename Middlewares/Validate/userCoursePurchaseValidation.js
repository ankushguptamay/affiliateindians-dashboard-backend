const joi = require('joi');

exports.purchaseCourseValidation = (data) => {
    const schema = joi.object().keys({
        amount: joi.string().required(),
        currency: joi.string().required(),
        receipt: joi.string().required(),
        couponCode: joi.string().optional()
    });
    return schema.validate(data);
}

exports.purchaseCourseByReferalValidation = (data) => {
    const schema = joi.object().keys({
        amount: joi.string().required(),
        currency: joi.string().required(),
        receipt: joi.string().required(),
        couponCode: joi.string().optional(),
        saleLinkCode: joi.string().optional()
    });
    return schema.validate(data);
}

exports.affiliateUserRegistration = (data) => {
    const schema = joi.object().keys({
        name: joi.string().required(),
        email: joi.string().email().required().label('Email'),
        mobileNumber: joi.string().length(10).required(),
        termAndConditionAccepted: joi.boolean().required(),
        saleLinkCode: joi.string().optional()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}