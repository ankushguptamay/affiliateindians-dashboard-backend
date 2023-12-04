const db = require('../../Models');
const AffiliateLink = db.affiliateLink;
const Course = db.course;
const AffiliateUserId = db.affiliateUserId;
const User = db.user;
const { Op } = require('sequelize');

exports.generateSaleLinkCode = async (req, res) => {
    try {
        // Define creator
        let creatorId;
        let craetor;
        if (req.user) {
            creatorId = req.user.id;
            craetor = "USER";
        } else if (req.admin) {
            creatorId = req.admin.id;
            craetor = "ADMIN";
        } else {
            return res.status(400).send({
                success: false,
                message: "You are not authorized!"
            });
        }
        const { originalLink, marketingTag, courseId, aid, linkType } = req.body;
        if (!linkType) {
            return res.status(400).send({
                success: false,
                message: "Link type is required! GETSTART or REGISTER?"
            });
        }
        if (!originalLink && courseId) {
            return res.status(400).send({
                success: false,
                message: "Original link is required!"
            });
        }
        // find Course
        const course = await Course.findOne({
            where: {
                id: courseId
            }
        });
        // Check user generate AID from this admin
        let affiliateUserId;
        if (craetor === "USER") {
            if (!aid) {
                return res.status(400).send({
                    success: false,
                    message: "AffiliateId should be present!"
                });
            }
            affiliateUserId = await AffiliateUserId.findOne({
                where: {
                    affiliateUserId: aid,
                    userId: creatorId,
                    adminId: course.adminId,
                    status: "ACCEPT"
                }
            });
            if (!affiliateUserId) {
                return res.status(400).send({
                    success: false,
                    message: "Please check your AffiliateId status or generate it!"
                });
            }
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
        const isSaleTag = await AffiliateLink.findAll({
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
            code = "AFLINK" + day + month + year + Day[dayNumber] + 1;
        } else {
            let lastCode = isSaleTag[isSaleTag.length - 1];
            let lastDigits = lastCode.saleLinkCode.substring(15);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "AFLINK" + day + month + year + Day[dayNumber] + incrementedDigits;
        }
        // Store
        if (craetor === "USER") {
            await AffiliateLink.create({
                originalLink: originalLink,
                marketingTag: marketingTag,
                saleLinkCode: code,
                courseId: courseId,
                adminId: course.adminId,
                userId: creatorId,
                craetor: craetor,
                linkType: linkType,
                courseName: course.title,
                affiliateUserId: affiliateUserId.id
            });
        } else {
            await AffiliateLink.create({
                originalLink: originalLink,
                marketingTag: marketingTag,
                saleLinkCode: code,
                courseId: courseId,
                adminId: creatorId,
                craetor: craetor,
                linkType: linkType,
                courseName: course.title
            });
        }
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
        const saleLinkCode = req.params.saleLinkCode
        // Find Original link in database
        const link = await AffiliateLink.findOne({
            where: {
                saleLinkCode: saleLinkCode
            }
        });
        if (!link) {
            return res.status(404).send({
                success: false,
                message: "Link not found!"
            });
        }
        const course = await Course.findOne({
            where: {
                id: link.courseId
            }
        });
        // Check user generate AID valid
        if (link.affiliateUserId) {
            const affiliateUserId = await AffiliateUserId.findOne({
                where: {
                    affiliateUserId: link.affiliateUserId,
                    userId: creatorId,
                    adminId: course.adminId,
                    status: "ACCEPT"
                }
            });
            if (!affiliateUserId) {
                return res.status(400).send({
                    success: false,
                    message: "Sorry.. This link is not valid!"
                });
            }
        }
        // Increase numberOfHit
        const numberOfHit = parseInt(link.numberOfHit) + 1;
        await link.update({
            ...link,
            numberOfHit: numberOfHit
        });
        res.status(200).send({
            success: true,
            message: "Fetched successfully!",
            data: {
                course: course,
                saleLinkCode: saleLinkCode
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