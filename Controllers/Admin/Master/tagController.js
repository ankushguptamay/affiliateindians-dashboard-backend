const db = require('../../../Models');
const Tag = db.tag;
const { Op } = require('sequelize');

exports.addTag = async (req, res) => {
    try {
        const { tagName } = req.body;
        const tag = await Tag.findOne({
            where: {
                tagName: tagName.toUpperCase()
            },
            paranoid:false
        });
        if (tag) {
            return res.status(400).send({
                success: false,
                message: "This Tag name is present!"
            });
        }
        // Generating Code
        let code;
        const isTagCode = await Tag.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
            paranoid: false
        });
        if (isTagCode.length == 0) {
            code = "AFTAG" + 1;
        } else {
            let lastCode = isTagCode[isTagCode.length - 1];
            let lastDigits = lastCode.tagCode.substring(5);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "AFTAG" + incrementedDigits;
        }
        await Tag.create({
            tagName: tagName.toUpperCase(),
            tagCode: code,
            adminId: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: `Tag created successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getTag = async (req, res) => {
    try {
        const tag = await Tag.findAll();
        res.status(201).send({
            success: true,
            message: `Tag fetched successfully!`,
            data: tag
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.hardDeleteTag = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const tag = await Tag.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!tag) {
            return res.status(400).send({
                success: false,
                message: "Tag is not present!"
            });
        }
        await tag.destroy({ force: true });
        res.status(201).send({
            success: true,
            message: `Tag deleted successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};