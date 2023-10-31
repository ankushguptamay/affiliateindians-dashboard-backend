const joi = require('joi');

exports.purchaseCourseValidation = (data) => {
    const schema = joi.object().keys({
        amount: joi.string().required(),
        currency: joi.string().required(),
        receipt: joi.string().required()
    });
    return schema.validate(data);
}


exports.verifyPaymentValidation = (data) => {
    const schema = joi.object().keys({
        orderId: joi.string().required(),
        paymentId: joi.string().required()
    });
    return schema.validate(data);
}