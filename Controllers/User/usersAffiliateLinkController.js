const db = require('../../Models');
const UsersAffiliateLink = db.usersAffiliateLinks;
const AffiliateUserIdRequest = db.affiliateUserIdRequest;
const Course = db.course;
const { Op } = require('sequelize');

exports.generateCodeForUser = async (req, res) => {
    try {
        const { originalLink, marketingTag, courseId, aid } = req.body;
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
                message: "Affiliate is not allow on this course!"
            });
        }
        // Aid validation
        const affiliateUserIdRequest = await AffiliateUserIdRequest.findOne({
            where: {
                aid: aid,
                userId: req.user.id,
                adminId: course.adminId,
                status: "ACCEPT"
            }
        });
        if (!affiliateUserIdRequest) {
            return res.status(400).send({
                success: false,
                message: "Check your affiliate id status!"
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
        const isSaleTag = await UsersAffiliateLink.findAll({
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
            code = "USEAFF" + day + month + year + Day[dayNumber] + 1;
        } else {
            let lastCode = isSaleTag[isSaleTag.length - 1];
            let lastDigits = lastCode.saleLinkCode.substring(15);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "USEAFF" + day + month + year + Day[dayNumber] + incrementedDigits;
        }
        await UsersAffiliateLink.create({
            originalLink: originalLink,
            marketingTag: marketingTag,
            saleLinkCode: code,
            courseId: courseId,
            adminId: course.adminId,
            userId: req.user.id,
            courseName: course.title,
            aid: aid,
            affiliateUserId: affiliateUserIdRequest.id
        });
        res.status(201).send({
            success: true,
            message: "Sale link tag created successfully!",
            data: {
                generatedLink: `${originalLink}/${code}`
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