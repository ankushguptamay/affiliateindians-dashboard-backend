const joi = require('joi');

exports.courseValidation = (data) => {
    const schema = joi.object().keys({
        title: joi.string().required()
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
        couponsId: joi.array().required(),
        courseId: joi.string().required(),
        type: joi.string().optional()
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

exports.addQuiz = (data) => {
    const schema = joi.object().keys({
        quizQuestion: joi.string().required(),
        option: joi.object().required(),
        answer: joi.array().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.submitQuizAnswer = (data) => {
    const schema = joi.object().keys({
        answers: joi.array().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.upSellValidation = (data) => {
    const schema = joi.object().keys({
        buttonText: joi.string().required(),
        buttonLink: joi.string().required(),
        courseId: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.ratioValidation = (data) => {
    const schema = joi.object().keys({
        referalRatio: joi.string().required(), // userCommission
        adminRatio: joi.string().required(), // adminCommision
        ratioName: joi.string().required(),
        courseId: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}