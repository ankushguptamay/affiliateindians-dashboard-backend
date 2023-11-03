const joi = require('joi');

exports.courseValidation = (data) => {
    const schema = joi.object().keys({
        title: joi.string().required(),
        ratioId: joi.string().optional()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}