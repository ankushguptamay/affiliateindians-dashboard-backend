const db = require('../../Models');
const ShareSaleLink = db.shareSaleLink;
const { Op } = require('sequelize');

exports.generateSaleLinkTag = async (req, res) => {
    try {
        const { originalLink, socialMedia, productId } = req.body;
        if (!originalLink) {
            return res.status(400).send({
                success: false,
                message: "Original link is required!"
            });
        }
        // Generating Code
        // 1.Today Date
        const date = JSON.stringify(new Date((new Date).getTime() - (24 * 60 * 60 * 1000)));
        const today = `${date.slice(1, 12)}18:30:00.000Z`;
        // 2.Today Day
        const Day = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayNumber = (new Date).getDay();
        // Get All Today Code
        let code;
        const isSaleTag = await ShareSaleLink.findAll({
            where: {
                createdAt: { [Op.gt]: today }
            },
            order: [
                ['createdAt', 'ASC']
            ],
            paranoid: false
        });
        const day = new Date().toISOString().slice(8, 10);
        const year = new Date().toISOString().slice(2, 4);
        const month = new Date().toISOString().slice(5, 7);
        if (isSaleTag.length == 0) {
            code = "SHTAG" + day + month + year + Day[dayNumber] + 1;
        } else {
            let lastCode = isSaleTag[isSaleTag.length - 1];
            let lastDigits = lastCode.saleLinkTag.substring(14);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "SHTAG" + day + month + year + Day[dayNumber] + incrementedDigits;
        }
        await ShareSaleLink.create({
            originalLink: originalLink,
            socialMedia: socialMedia,
            saleLinkTag: code,
            productId: productId,
            adminId: req.admin.id
        });
        res.status(201).send({
            success: true,
            message: "Sale link tag created successfully!",
            data: {
                saleLinkTag: code
            }
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.redirectByTag = async (req, res) => {
    try {
        const domain = process.env.FRONTDOAMIN; // IN case of it is different with admin then domain column should exist in admin table 
        const saleLinkTag = req.params.tag
        // Find Original link in database
        const link = await ShareSaleLink.findOne({
            where: {
                saleLinkTag: saleLinkTag
            }
        });
        if (!link) {
            return res.status(404).send({
                success: false,
                message: "Link not found!"
            });
        }
        // And saleLinkTag as query params
        let originalLink = link.originalLink;
        if (link.socialMedia) {
            originalLink = `${originalLink}&saleLinkTag=${saleLinkTag}`;
        } else {
            originalLink = `${originalLink}?saleLinkTag=${saleLinkTag}`;
        }
        // Increase numberOfHit
        const numberOfHit = parseInt(link.numberOfHit) + 1;
        await link.update({
            ...link,
            numberOfHit: numberOfHit
        });
        return res.status(200).redirect(`${domain}${originalLink}`);
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};