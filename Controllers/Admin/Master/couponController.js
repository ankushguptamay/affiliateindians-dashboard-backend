const db = require('../../../Models');
const Course = db.course;
const Coupon = db.coupon;
const { Op } = require('sequelize');
const { couponValidation, addCouponToCourse, applyCouponToCourse } = require("../../../Middlewares/Validate/validateCourse");

exports.createCoupon = async (req, res) => {
    try {
        // Validate Body
        const { error } = couponValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { couponName, validTill, coursesId, couponType, percentageValue, integerValue } = req.body;
        // validate couponType
        if (couponType.toUpperCase() === "INTEGER") {
            if (!integerValue) {
                return res.status(400).send({
                    success: false,
                    message: "Integer value should be persent!"
                });
            }
        } else if (couponType.toUpperCase() === "PERCENT") {
            if (!percentageValue) {
                return res.status(400).send({
                    success: false,
                    message: "Percent value should be persent!"
                });
            } else {
                if (parseFloat(percentageValue) >= 100 || parseFloat(percentageValue) <= 0) {
                    return res.status(400).send({
                        success: false,
                        message: "Percentage Value should be between 100 and 0!"
                    });
                }
            }
        } else {
            return res.status(400).send({
                success: false,
                message: "This coupen type is not acceptable!"
            });
        }
        // Check duplicaty
        const isCoupon = await Coupon.findOne({
            where: {
                couponName: couponName.toUpperCase()
            },
            paranoid: false
        });
        if (isCoupon) {
            return res.status(400).send({
                success: false,
                message: "This coupon name is present!"
            });
        }
        // Generating Code
        let code;
        const isCouponCode = await Coupon.findAll({
            order: [
                ['createdAt', 'ASC']
            ],
            paranoid: false
        });
        if (isCouponCode.length === 0) {
            code = "AFCOU" + 1;
        } else {
            let lastCode = isCouponCode[isCouponCode.length - 1];
            let lastDigits = lastCode.couponCode.substring(5);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "AFCOU" + incrementedDigits;
        }
        // create coupon
        await Coupon.create({
            couponName: couponName.toUpperCase(),
            validTill: validTill,
            couponCode: code,
            couponType: couponType.toUpperCase(),
            percentageValue: percentageValue,
            integerValue: integerValue,
            adminId: req.admin.id
        });
        // Add coupon to course
        const adminId = req.admin.id;
        const adminTag = req.admin.adminTag;
        const condition = [{ id: coursesId }];
        if (adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        if (coursesId.length > 0) {
            await Course.update({
                where: {
                    [Op.and]: condition
                }
            }, {
                couponCode: code
            });
        }
        res.status(400).send({
            success: false,
            message: "Coupon create successfully!"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            err: err.messag
        });
    }
};

exports.getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findAll();
        res.status(201).send({
            success: true,
            message: `Coupon fetched successfully!`,
            data: coupon
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.addCouponToCourse = async (req, res) => {
    try {
        // Validate Body
        const { error } = addCouponToCourse(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { couponCode, coursesId } = req.body;
        const coupon = await Coupon.findOne({
            where: {
                couponCode: couponCode
            }
        });
        // is coupon expired?
        const isCouponExpired = new Date().getTime() > parseInt(coupon.validTill);
        if (isCouponExpired) {
            return res.status(400).send({
                success: false,
                message: `This coupon expired!`
            });
        }
        // Add coupon to course
        let num = 0;
        const adminId = req.admin.id;
        const adminTag = req.admin.adminTag;
        if (coursesId.length > 0) {
            for (let i = 0; i < coursesId.length; i++) {
                const id = coursesId[i];
                const condition = [{ id: id }];
                if (adminTag === "ADMIN") {
                    condition.push({ adminId: adminId });
                }
                const course = await Course.findOne({
                    where: {
                        [Op.and]: condition
                    }
                });
                if (course) {
                    await course.update({
                        couponCode: couponCode
                    });
                    num = num + 1;
                }
            }
        }
        res.status(201).send({
            success: true,
            message: `Coupon added to ${num} courses successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.applyCouponToCourse = async (req, res) => {
    try {
        // Validate Body
        const { error } = applyCouponToCourse(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { couponCode, courseId } = req.body;
        const coupon = await Coupon.findOne({
            where: {
                couponCode: couponCode
            }
        });
        // is coupon present?
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: `This coupon is not present!`
            });
        }
        // is coupon expired?
        const isCouponExpired = new Date().getTime() > parseInt(coupon.validTill);
        if (isCouponExpired) {
            return res.status(400).send({
                success: false,
                message: `This coupon has expired!`
            });
        }
        // find course
        const course = await Course.findOne({
            where: {
                id: courseId
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: `This course is not present!`
            });
        }
        if (course.couponCode !== couponCode) {
            res.status(400).send({
                success: false,
                message: `This coupon is not applicable at this course!`
            });
        } else {
            let discountAmount = parseFloat(course.price);
            if (coupon.couponType === "INTEGER") {
                if (parseFloat(course.price) <= parseFloat(coupon.integerValue)) {
                    return res.status(201).send({
                        success: true,
                        message: `This coupon is not applicable at this course!`
                    });
                } else {
                    discountAmount = parseFloat(course.price) - parseFloat(coupon.integerValue);
                }
            } else if (coupon.couponType === "PERCENT") {
                const coupenDiscountAmount = parseFloat(course.price) * parseFloat(coupon.integerValue) / 100
                discountAmount = parseFloat(course.price) - parseFloat(coupenDiscountAmount);
            } else {
                return res.status(201).send({
                    success: true,
                    message: `This coupon is not valid!`
                });
            }
            res.status(201).send({
                success: true,
                message: `Coupon applied to course ${course.title} successfully!`,
                data: {
                    discountAmount: discountAmount
                }
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

exports.hardDeleteCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.admin.id;
        const condition = [{ id: id }];
        if (req.admin.adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        const coupon = await Coupon.findOne({
            where: {
                [Op.and]: condition
            }
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: "Coupon is not present!"
            });
        }
        await coupon.destroy({ force: true });
        res.status(201).send({
            success: true,
            message: `Coupon deleted successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};