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
        name: joi.string().required(),
        marketingTag: joi.string().optional(),
        termAndConditionAccepted: joi.boolean().required(),
        email: joi.string().email().required().label('Email'),
        mobileNumber: joi.string().length(10).required(),
        referalCode: joi.string().optional(),
        couponCode: joi.string().optional(),
        saleLinkCode: joi.string().optional()
    });
    return schema.validate(data);
}