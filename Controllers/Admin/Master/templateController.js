const db = require('../../../Models');
const Template = db.template;
const { Op } = require('sequelize');
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
            adminId: req.admin.id,
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

exports.hardDeleteTemplate = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const template = await Template.findOne({
            where: {
                [Op.and]: condition
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