const db = require('../../Models');
const AdminsAffiliateLink = db.adminsAffiliateLinks;
const UsersAffiliateLink = db.usersAffiliateLinks;
const AffiliateUserIdRequest = db.affiliateUserIdRequest;
const Course = db.course;
const { Op } = require('sequelize');

exports.generateCodeForAdmin = async (req, res) => {
    try {
        const { originalLink, marketingTag, courseId } = req.body;
        if (!originalLink && courseId) {
            return res.status(400).send({
                success: false,
                message: "Original link is required!"
            });
        }
        // find Course
        const course = await Course.findOne({
            where: {
                id: courseId,
                allowAffiliate: true
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Is affiliate allow on this course?"
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
        const isSaleTag = await AdminsAffiliateLink.findAll({
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
        if (isSaleTag.length === 0) {
            code = "ADDAFF" + day + month + year + Day[dayNumber] + 1;
        } else {
            let lastCode = isSaleTag[isSaleTag.length - 1];
            let lastDigits = lastCode.saleLinkCode.substring(15);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "ADDAFF" + day + month + year + Day[dayNumber] + incrementedDigits;
        }
        await AdminsAffiliateLink.create({
            originalLink: originalLink,
            marketingTag: marketingTag,
            saleLinkCode: code,
            courseId: courseId,
            adminId: req.admin.id,
            courseName: course.title
        });
        res.status(201).send({
            success: true,
            message: "Sale link tag created successfully!",
            data: {
                generatedLink: `${originalLink}?tid=${code}`
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
        if (saleLinkCode.slice(0, 3) === "USE") {
            // Find Original link in database
            const link = await UsersAffiliateLink.findOne({
                where: {
                    saleLinkCode: saleLinkCode
                }
            });
            if (!link) {
                return res.status(404).send({
                    success: false,
                    message: "Link is not valid!"
                });
            }
            // Check couse
            const course = await Course.findOne({
                where: {
                    id: link.courseId,
                    allowAffiliate: true
                }
            });
            if (!course) {
                return res.status(400).send({
                    success: false,
                    message: "Link is not valid!"
                });
            } // Aid validation
            const affiliateUserIdRequest = await AffiliateUserIdRequest.findOne({
                where: {
                    aid: link.aid,
                    userId: link.userId,
                    adminId: link.adminId,
                    status: "ACCEPT"
                }
            });
            if (!affiliateUserIdRequest) {
                return res.status(400).send({
                    success: false,
                    message: "Link is not valid!"
                });
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
        } else if (saleLinkCode.slice(0, 3) === "ADD") {
            // Find Original link in database
            const link = await AdminsAffiliateLink.findOne({
                where: {
                    saleLinkCode: saleLinkCode
                }
            });
            if (!link) {
                return res.status(404).send({
                    success: false,
                    message: "Link is not valid!"
                });
            }
            const course = await Course.findOne({
                where: {
                    id: link.courseId,
                    allowAffiliate: true
                }
            });
            if (!course) {
                return res.status(400).send({
                    success: false,
                    message: "Link is not valid!"
                });
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
        } else {
            res.status(400).send({
                success: false,
                message: "Link is not valid!"
            });
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};