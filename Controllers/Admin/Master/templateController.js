const db = require('../../../Models');
const Template = db.template;
const { deleteSingleFile } = require("../../../Util/deleteFile");

exports.addTemplate = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a Image!"
            });
        }
        const { template } = req.body;
        await Template.create({
            templateImage_Path: req.file.path,
            templateImage_OriginalName: req.file.originalname,
            templateImage_FileName: req.file.filename,
            superAdminId: req.admin.id,
            template: template
        });
        res.status(201).send({
            success: true,
            message: `Template created successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getTemplate = async (req, res) => {
    try {
        const template = await Template.findAll();
        res.status(201).send({
            success: true,
            message: `Template fetched successfully!`,
            data: template
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!template) {
            return res.status(400).send({
                success: false,
                message: "Template is not present!"
            });
        }
        if (template.templateImage_Path) {
            deleteSingleFile(template.templateImage_Path);
        }
        await template.destroy();
        res.status(201).send({
            success: true,
            message: `Template deleted successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};