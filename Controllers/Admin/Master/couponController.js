const db = require('../../../Models');
const Course = db.course;
const Coupon = db.coupon;
const Course_Coupon = db.course_coupon;
const { Op } = require('sequelize');
const { couponValidation, addCouponToCourse, applyCouponToCourse, updateCouponValidation } = require("../../../Middlewares/Validate/validateCourse");

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
        const coupon = await Coupon.create({
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
        const condition = [];
        if (adminTag === "ADMIN") {
            condition.push({ adminId: adminId });
        }
        if (coursesId) {
            // only superAdmin can add coupon to all course otherwise admin can only add coupon in those courses which he created
            for (let i = 0; i < coursesId.length; i++) {
                condition.push({ id: coursesId[i] });
                const isAdminHasCourse = await Course.findOne({
                    where: {
                        [Op.and]: condition
                    }
                });
                if (isAdminHasCourse) {
                    await Course_Coupon.create({
                        courseId: coursesId[i],
                        couponId: coupon.id
                    });
                }
            }
        }
        res.status(200).send({
            success: true,
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
        const { couponsId, coursesId, type } = req.body;
        // Default Coupon validation
        let defaultType;
        if (type === "DEFAULT") {
            defaultType = type.toUpperCase();
            if (couponsId.length !== 1 && coursesId.length !== 1) {
                return res.status(400).send({
                    success: false,
                    message: "In Default type couponsId,s and coursesId,s length should be 1!"
                });
            }
            const isDefault = await Course_Coupon.findOne({
                where: {
                    couponId: couponsId[0],
                    courseId: coursesId[0]
                }
            });
            if (isDefault) {
                return res.status(400).send({
                    success: false,
                    message: `This Course already has one default coupon!`
                });
            }
        }
        const expiredCoupon = [];
        for (let i = 0; i < couponsId.length; i++) {
            const coupon = await Coupon.findOne({
                where: {
                    id: couponsId[i]
                }
            });
            // is coupon expired?
            const isCouponExpired = new Date().getTime() > parseInt(coupon.validTill);
            if (isCouponExpired) {
                expiredCoupon.push(coupon.couponCode);
            } else {
                const adminId = req.admin.id;
                const adminTag = req.admin.adminTag;
                for (let j = 0; j < coursesId.length; j++) {
                    const condition = [{ id: coursesId[j] }];
                    if (adminTag === "ADMIN") {
                        condition.push({ adminId: adminId });
                    }
                    const course = await Course.findOne({
                        where: {
                            [Op.and]: condition
                        }
                    });
                    if (course) {
                        await Course_Coupon.create({
                            courseId: coursesId[j],
                            couponId: couponsId[i],
                            type: defaultType
                        });
                    }
                }
            }
        }
        let message = `Coupons added to course successfully!`;
        if (expiredCoupon.length > 0) {
            message = `Coupons added to course successfully! ${expiredCoupon} these coupon have been expired so we did not add!`
        }
        res.status(201).send({
            success: true,
            message: message
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
        const isCourseHasCoupon = await Course_Coupon.findOne({
            where: {
                courseId: courseId,
                couponId: coupon.id
            }
        });
        let saveAmount;
        if (!isCourseHasCoupon) {
            res.status(400).send({
                success: false,
                message: `This coupon is not applicable on this course!`
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
                    saveAmount = parseFloat(coupon.integerValue);
                }
            } else if (coupon.couponType === "PERCENT") {
                const coupenDiscountAmount = parseFloat(course.price) * parseFloat(coupon.integerValue) / 100;
                discountAmount = parseFloat(course.price) - parseFloat(coupenDiscountAmount);
                saveAmount = coupenDiscountAmount;
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
                    discountAmount: discountAmount,
                    saveAmount: saveAmount
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
        const association = await Course_Coupon.findAll({
            where: {
                couponId: id
            },
            paranoid: false
        });
        for (let i = 0; i < association.length; i++) {
            await association[i].destroy({ force: true });
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

exports.UpdateCoupon = async (req, res) => {
    try {
        // Validate Body
        const { error } = updateCouponValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const id = req.params.id;
        const adminId = req.admin.id;
        const { couponName, validTill, couponType, percentageValue, integerValue } = req.body;
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
        // Check Duplicaty if coupon name is change
        const couponNameInUpperCase = couponName.toUpperCase();
        if (couponNameInUpperCase !== coupon.couponName) {
            const isCoupon = await Coupon.findOne({
                where: {
                    couponName: couponNameInUpperCase
                },
                paranoid: false
            });
            if (isCoupon) {
                return res.status(400).send({
                    success: false,
                    message: "This coupon name is present!"
                });
            }
        }
        await coupon.update({
            ...coupon,
            validTill: validTill,
            couponName: couponNameInUpperCase,
            couponType: couponType.toUpperCase(),
            percentageValue: percentageValue,
            integerValue: integerValue

        });
        res.status(201).send({
            success: true,
            message: `Coupon updated successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getCouponByCourseId = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const couponAssociation = await Course_Coupon.findAll({
            where: {
                courseId: courseId
            }
        });
        const couponId = [];
        for (let i = 0; i < couponAssociation.length; i++) {
            couponId.push(couponAssociation[i].couponId);
        }
        const coupon = await Coupon.findAll({
            where: {
                id: couponId
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.status(201).send({
            success: true,
            message: `All coupon fetched successfully!`,
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