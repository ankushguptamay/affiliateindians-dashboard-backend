const db = require('../../../Models');
const Template = db.template;
const cloudinary = require("cloudinary").v2;
const { Op } = require('sequelize');
const { deleteSingleFile } = require("../../../Util/deleteFile");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.addTemplate = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Select a Image!"
            });
        }
        const { template } = req.body;
        // Upload image to cloudinary
        const imagePath = `./Resources/Master/${req.file.filename}`
        const image = await cloudinary.uploader.upload(imagePath);
        // delete file from resource
        deleteSingleFile(req.file.path);
        await Template.create({
            templateImage_Path: image.secure_url,
            templateImage_OriginalName: req.file.originalname,
            templateImage_FileName: req.file.filename,
            cloudinaryImageId: image.public_id,
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

exports.getTemplateByAdminId = async (req, res) => {
    try {
        const template = await Template.findAll({ where: { adminId: req.admin.id } });
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
        if (template.cloudinaryImageId) {
            await cloudinary.uploader.destroy(template.cloudinaryImageId);
        }
        await template.destroy({ force: true });
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