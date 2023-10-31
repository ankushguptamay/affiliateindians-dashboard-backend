const joi = require('joi');

exports.courseValidation = (data) => {
    const schema = joi.object().keys({
        title: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}