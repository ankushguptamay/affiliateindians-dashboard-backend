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
        previousPassword: joi.string().required().min(8)
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.accountDetailsValidation = (data) => {
    const schema = joi.object().keys({
        accountHolderName: joi.string().optional(),
        accountNumber: joi.string().optional(),
        bankName: joi.string().optional(),
        branchName: joi.string().optional(),
        IFSCCode: joi.string().optional(),
        payTMNumber: joi.string().optional(),
        gPayNumber: joi.string().optional(),
        phonePayNumber: joi.string().optional(),
        UPIID: joi.string().optional()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.sendOTP = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email')
    });
    return schema.validate(data);
}

exports.verifyOTP = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email'),
        otp: joi.string().length(6).required()
    });
    return schema.validate(data);
}

exports.generatePassword = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email'),
        password: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8),
        confirmPassword: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.bulkUserAddToCourse = (data) => {
    const schema = joi.object().keys({
        courseId: joi.string().required(),
        userId: joi.array().required()
    });
    return schema.validate(data);
}