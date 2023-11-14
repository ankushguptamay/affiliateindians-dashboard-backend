const db = require('../../Models');
const crypto = require('crypto');
const User = db.user;
const Admin = db.admin;
const User_Course = db.user_course;
const AdminWallet = db.adminWallet;
const UserWallet = db.userWallet;
const AffiliateMarketingRatio = db.affiliateMarketingRatio;
const Course = db.course;
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { purchaseCourseValidation, purchaseCourseByReferalValidation } = require("../../Middlewares/Validate/userCoursePurchaseValidation");
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET_ID } = process.env;

// Razorpay
const Razorpay = require('razorpay');
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET_ID
});

exports.createPayment = async (req, res) => {
    try {
        const courseId = req.params.id;
        if (req.user) {
            // Validate body
            const { error } = purchaseCourseValidation(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            }
            const { amount, currency, receipt, joinThrough, couponCode } = req.body; // receipt is id created for this order
            const userId = req.user.id;
            const user = await User.findOne({
                where: {
                    id: userId
                }
            });
            // initiate payment
            razorpayInstance.orders.create({ amount, currency, receipt },
                (err, order) => {
                    if (!err) {
                        User_Course.create({
                            courseId: courseId,
                            userId: userId,
                            amount: amount / 100,
                            currency: currency,
                            receipt: receipt,
                            razorpayOrderId: order.id,
                            status: "created",
                            razorpayTime: order.created_at,
                            verify: false,
                            referalId: user.referalId,
                            joinThrough: joinThrough,
                            couponCode: couponCode
                        })
                            .then(() => {
                                res.status(201).send({
                                    success: true,
                                    message: `Purchase order craeted successfully!`,
                                    data: order
                                });
                            })
                            .catch((err) => {
                                res.status(500).send({ message: "Try Again!" });
                            });
                    }
                    else {
                        res.status(500).send({ message: err.message });
                    }
                })
        }
        else {
            // Validate body
            const { error } = purchaseCourseByReferalValidation(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            }
            const { amount, currency, receipt, name, email, mobileNumber, referalCode, joinThrough, termAndConditionAccepted, couponCode } = req.body; // receipt is id created for this order
            const isUser = await User.findOne({
                where: {
                    email: email
                }
            });
            if (isUser) {
                return res.status(400).send({
                    success: false,
                    message: "User is present! Login.."
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
            const isUserCode = await User.findAll({
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
            if (isUserCode.length == 0) {
                code = "AFUS" + day + month + year + Day[dayNumber] + 1;
            } else {
                let lastCode = isUserCode[isUserCode.length - 1];
                let lastDigits = lastCode.userCode.substring(13);
                let incrementedDigits = parseInt(lastDigits, 10) + 1;
                code = "AFUS" + day + month + year + Day[dayNumber] + incrementedDigits;
            }
            const password = email.slice(0, 8);
            const salt = await bcrypt.genSalt(10);
            const bcPassword = await bcrypt.hash(password, salt);
            // find Referal
            let referalId;
            const findUserReferal = await User.findOne({
                where: {
                    userCode: referalCode
                }
            });
            const findAdminReferal = await Admin.findOne({
                where: {
                    adminCode: referalCode
                }
            });
            if (findUserReferal) {
                referalId = findUserReferal.id;
            } else if (findAdminReferal) {
                referalId = findAdminReferal.id;
            } else {
                referalId = null;
            }
            // Create User
            const user = await User.create({
                name: name,
                email: email,
                mobileNumber: mobileNumber,
                password: bcPassword,
                userCode: code,
                referalId: referalId,
                joinThrough: joinThrough,
                termAndConditionAccepted: termAndConditionAccepted
            });
            // Initiate payment
            razorpayInstance.orders.create({ amount, currency, receipt },
                (err, order) => {
                    if (!err) {
                        User_Course.create({
                            courseId: courseId,
                            userId: user.id,
                            amount: amount / 100,
                            currency: currency,
                            receipt: receipt,
                            razorpayOrderId: order.id,
                            status: "created",
                            razorpayTime: order.created_at,
                            verify: false,
                            referalId: referalId,
                            joinThrough: joinThrough,
                            couponCode: couponCode
                        })
                            .then(() => {
                                res.status(201).send({
                                    success: true,
                                    message: `Purchase order craeted successfully!`,
                                    data: order
                                });
                            })
                            .catch((err) => {
                                res.status(500).send({ message: "Try Again!" });
                            });
                    }
                    else {
                        res.status(500).send({ message: err.message });
                    }
                })
        }
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const orderId = req.body.razorpay_order_id;
        const paymentId = req.body.razorpay_payment_id;
        const razorpay_signature = req.body.razorpay_signature;
        // Creating hmac object 
        let hmac = crypto.createHmac('sha256', RAZORPAY_SECRET_ID);
        // Passing the data to be hashed
        hmac.update(orderId + "|" + paymentId);
        // Creating the hmac in the required format
        const generated_signature = hmac.digest('hex');

        if (razorpay_signature === generated_signature) {
            const purchase = await User_Course.findOne({
                where: {
                    razorpayOrderId: orderId,
                    verify: false,
                    status: "created"
                }
            });
            if (!purchase) {
                return res.status(200).json({
                    success: true,
                    message: "Payment has been verified! Second Time!"
                });
            }
            // Get Course
            const course = await Course.findOne({
                where: {
                    id: purchase.courseId
                }
            });
            // Get Marketing Ratio, if course does not have any ratio id then we get a "GENERAL"(ratioName) ratio
            let ratio;
            if (course.ratioId) {
                ratio = await AffiliateMarketingRatio.findOne({
                    where: {
                        id: course.ratioId
                    }
                });
            } else {
                ratio = await AffiliateMarketingRatio.findOne({
                    where: {
                        ratioName: "GENERAL"
                    }
                });
            }
            // find Referal Wallet
            let referalWallet;
            if (purchase.referalId) {
                const referalUserWallet = await UserWallet.findOne({
                    where: {
                        userId: purchase.referalId
                    }
                });
                const referalAdminWallet = await AdminWallet.findOne({
                    where: {
                        adminId: purchase.referalId
                    }
                });
                if (referalUserWallet) {
                    referalWallet = referalUserWallet;
                } else {
                    referalWallet = referalAdminWallet;
                }
            }
            // Get Course Owner wallet
            const courseOwnerWallet = await AdminWallet.findOne({
                where: {
                    adminId: course.adminId
                }
            });
            // Transfer money to Course Owenr Wallet
            const adminWalletAmount = parseFloat(courseOwnerWallet.amount) + (parseFloat(purchase.amount) * parseFloat(ratio.adminRatio)) / 100;
            await courseOwnerWallet.update({
                amount: (Math.round(adminWalletAmount * 100) / 100)
            });
            // Transfer money to Referal Wallet, if referal is not present then tranfer it to course admin wallet
            if (referalWallet) {
                const referalAmount = parseFloat(referalWallet.amount) + (parseFloat(purchase.amount) * parseFloat(ratio.referalRatio)) / 100;
                await referalWallet.update({
                    amount: (Math.round(referalAmount * 100) / 100)
                });
            } else {
                const referalAmount = parseFloat(courseOwnerWallet.amount) + (parseFloat(purchase.amount) * parseFloat(ratio.referalRatio)) / 100;
                // (Math.round(referalAmount * 100) / 100).toFixed(2)
                await courseOwnerWallet.update({
                    amount: (Math.round(referalAmount * 100) / 100)
                });
            }
            // Update Purchase
            await purchase.update({
                ...purchase,
                status: "paid",
                razorpayPaymentId: paymentId,
                verify: true
            });
            res.status(200).json({
                success: true,
                message: "Payment has been verified"
            })
        }
        else {
            res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getAllPaymentData = async (req, res) => {
    try {
        const pay = await User_Course.findAll();
        res.status(201).send({
            success: true,
            message: `Data fetched successfully!`,
            data: pay
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};
