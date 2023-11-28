const joi = require('joi');

exports.templateFormValidation = (data) => {
    const schema = joi.object().keys({
        courseId: joi.string().required(),
        templateId: joi.string().required(),
        registrationDetailsFields: joi.array().required(),
        paymentFields: joi.array().required(),
        HTMLCode: joi.string().required(),
        javaScriptCode: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}