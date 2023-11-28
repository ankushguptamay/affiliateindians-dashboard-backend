const db = require('../../../Models');
const Template = db.template;
const TemplateForm = db.templateForm;
const Course = db.course;
const { templateFormValidation } = require("../../../Middlewares/Validate/masterValidate");
const { Op } = require('sequelize');

exports.addTemplateFrom = async (req, res) => {
    try {
        // Validate Body
        const { error } = templateFormValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Generating Code
        let code;
        const isCode = await TemplateForm.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
            paranoid: false
        });
        if (isCode.length === 0) {
            code = "AFCOU" + 1;
        } else {
            let lastCode = isCode[isCode.length - 1];
            let lastDigits = lastCode.formCode.substring(5);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "AFFOR" + incrementedDigits;
        }
        const { templateId, courseId, registrationDetailsFields, paymentFields, HTMLCode, javaScriptCode } = req.body;
        await TemplateForm.create({
            registrationDetailsFields: registrationDetailsFields,
            paymentFields: paymentFields,
            courseId: courseId,
            formCode: code,
            adminId: req.admin.id,
            templateId: templateId,
            HTMLCode: HTMLCode,
            javaScriptCode: javaScriptCode
        });
        res.status(201).send({
            success: true,
            message: `Template Form created successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getAllFormByAdminId = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Search 
        const adminId = req.admin.id;
        const condition = [{ adminId: adminId }];
        if (search) {
            condition.push({
                formCode: { [Op.substring]: search }
            })
        }
        // Count All Form
        const totalForm = await TemplateForm.count({
            where: {
                [Op.and]: condition
            }
        });
        // All Form
        const form = await TemplateForm.findAll({
            where: {
                [Op.and]: condition
            },
            include: {
                model: Course,
                as: "course",
                attributes: ["id", "title", "price"]
            }
        });
        res.status(201).send({
            success: true,
            message: `Form fetched successfully!`,
            totalPage: Math.ceil(totalForm / recordLimit),
            currentPage: currentPage,
            data: form
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};