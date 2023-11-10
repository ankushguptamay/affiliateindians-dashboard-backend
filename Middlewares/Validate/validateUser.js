const joi = require('joi');
const pattern = "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

exports.userRegistration = (data) => {
    const schema = joi.object().keys({
        name: joi.string().required(),
        email: joi.string().email().required().label('Email'),
        password: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8),
        mobileNumber: joi.string().length(10).optional(),
        termAndConditionAccepted: joi.boolean().required(),
        address: joi.string().optional(),
        city: joi.string().optional(),
        state: joi.string().optional(),
        country: joi.string().optional(),
        pinCode: joi.string().optional(),
        joinThrough: joi.string().optional(),
        confirmPassword: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.userLogin = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email'),
        password: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8)
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.changePassword = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email'),
        newPassword: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8),
        previousPassword: joi.string().required().min(8).max(8)
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}