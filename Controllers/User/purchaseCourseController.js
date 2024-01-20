const db = require('../../Models');
const crypto = require('crypto');
const User = db.user;
const Admin = db.admin;
const User_Course = db.user_course;
const AdminWallet = db.adminWallet;
const UserWallet = db.userWallet;
const AffiliateMarketingRatio = db.affiliateMarketingRatio;
const UsersAffiliateLink = db.usersAffiliateLinks;
const AdminsAffiliateLink = db.adminsAffiliateLinks;
const EmailCredential = db.emailCredential
const Course = db.course;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { purchaseCourseValidation, purchaseCourseByReferalValidation, affiliateUserRegistration } = require("../../Middlewares/Validate/userCoursePurchaseValidation");
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET_ID } = process.env;
const brevo = require('@getbrevo/brevo');

// Razorpay
const Razorpay = require('razorpay');
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET_ID
});

exports.createPaymentForRegisterUser = async (req, res) => {
    try {
        const courseId = req.params.id;
        // Validate body
        const { error } = purchaseCourseValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { amount, currency, receipt, couponCode } = req.body; // receipt is id created for this order
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
                            res.status(500).send({
                                success: false,
                                err: err.message
                            });
                        });
                }
                else {
                    res.status(500).send({
                        success: false,
                        err: err.message
                    });
                }
            })
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.verifyPaymentForRegisterUser = async (req, res) => {
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
        res.status(500).send({
            success: false,
            err: err.message
        });
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

exports.createPaymentForNewUser = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;
        // Validate body
        const { error } = purchaseCourseValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { amount, currency, receipt, couponCode, saleLinkCode } = req.body; // receipt is id created for this order
        const user = await User.findOne({
            where: {
                id: userId
            }
        });
        // Get marketingtag
        let marketingTag;
        if (saleLinkCode) {
            if (saleLinkCode.slice(0, 3) === "USE") {
                const saleLink = await UsersAffiliateLink.findOne({ where: { saleLinkCode: saleLinkCode } });
                if (saleLink) {
                    referalId = saleLink.marketingTag;
                }
            } else {
                const saleLink = await AdminsAffiliateLink.findOne({ where: { saleLinkCode: saleLinkCode } });
                if (saleLink) {
                    referalId = saleLink.marketingTag;
                }
            }
        }
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
                        marketingTag: marketingTag,
                        couponCode: couponCode,
                        saleLinkCode: saleLinkCode
                    })
                        .then(() => {
                            res.status(201).send({
                                success: true,
                                message: `Purchase order craeted successfully!`,
                                data: order
                            });
                        })
                        .catch((err) => {
                            res.status(500).send({
                                success: false,
                                err: err.message
                            });
                        });
                }
                else {
                    res.status(500).send({
                        success: false,
                        err: err.message
                    });
                }
            })
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.registerNewUser = async (req, res) => {
    try {
        // Validate body
        const { error } = affiliateUserRegistration(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { name, email, mobileNumber, saleLinkCode, termAndConditionAccepted } = req.body;
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
        // Get referalId
        let referalId;
        if (saleLinkCode) {
            if (saleLinkCode.slice(0, 3) === "USE") {
                const saleLink = await UsersAffiliateLink.findOne({ where: { saleLinkCode: saleLinkCode } });
                if (saleLink) {
                    referalId = saleLink.userId;
                }
            } else {
                const saleLink = await AdminsAffiliateLink.findOne({ where: { saleLinkCode: saleLinkCode } });
                if (saleLink) {
                    referalId = saleLink.adminId;
                }
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
        // Store in database
        const user = await User.create({
            name: name,
            email: email,
            mobileNumber: mobileNumber,
            userCode: code,
            referalId: referalId,
            termAndConditionAccepted: termAndConditionAccepted
        });
        // Creating Wallet
        await UserWallet.create({
            userId: user.id
        });
        const data = {
            id: user.id,
            email: user.email
        }
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY_USER);
        res.status(201).send({
            success: true,
            message: `User register successfully!`,
            data: {
                authToken: authToken,
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

exports.verifyPaymentForNewUser = async (req, res) => {
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
            //Generate User password
            const user = await User.findOne({
                where: {
                    id: purchase.userId
                }
            });
            if (!user.password) {
                // Update sendEmail 0 every day
                const date = JSON.stringify(new Date());
                const todayDate = `${date.slice(1, 11)}`;
                const changeUpdateDate = await EmailCredential.findAll({
                    where: {
                        updatedAt: { [Op.lt]: todayDate }
                    },
                    order: [
                        ['createdAt', 'ASC']
                    ]
                });
                for (let i = 0; i < changeUpdateDate.length; i++) {
                    // console.log("hii");
                    await EmailCredential.update({
                        emailSend: 0
                    }, {
                        where: {
                            id: changeUpdateDate[i].id
                        }
                    });
                }
                // finalise email credentiel
                const emailCredential = await EmailCredential.findAll({
                    order: [
                        ['createdAt', 'ASC']
                    ]
                });
                let finaliseEmailCredential;
                for (let i = 0; i < emailCredential.length; i++) {
                    if (parseInt(emailCredential[i].emailSend) < 300) {
                        finaliseEmailCredential = emailCredential[i];
                        break;
                    }
                }
                // if (emailCredential.length <= 0) {
                //     return res.status(400).send({
                //         success: false,
                //         message: 'Sorry! Some server error!'
                //     });
                // }
                if (finaliseEmailCredential) {
                    // Send OTP to Email By Brevo
                    const password = (user.email).slice(0, 8);
                    const salt = await bcrypt.genSalt(10);
                    const bcPassword = await bcrypt.hash(password, salt);
                    if (finaliseEmailCredential.plateForm === "BREVO") {
                        let defaultClient = brevo.ApiClient.instance;
                        let apiKey = defaultClient.authentications['api-key'];
                        apiKey.apiKey = finaliseEmailCredential.EMAIL_API_KEY;
                        let apiInstance = new brevo.TransactionalEmailsApi();
                        let sendSmtpEmail = new brevo.SendSmtpEmail();
                        sendSmtpEmail.subject = "AFFILIATE INDIAN";
                        sendSmtpEmail.sender = { "name": "Affiliate Indian", "email": finaliseEmailCredential.email };
                        sendSmtpEmail.replyTo = { "email": finaliseEmailCredential.email, "name": "Affiliate Indian" };
                        sendSmtpEmail.headers = { "Login Credential": user.userCode };
                        sendSmtpEmail.htmlContent = `
                        <p>Dear ${user.name} you purchased ${course.title} successfully. Your login credential...</p>
                        <h3>Email: ${user.email}</h3><br>
                        <h3>Password: ${password}</h3><br>
                        change your password..`;
                        sendSmtpEmail.to = [
                            { "email": user.email, "name": user.name }
                        ];
                        apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
                            // console.log('API called successfully. Returned data: ' + JSON.stringify(data));
                        }, function (error) {
                            // console.error(error);
                        });
                    }
                    const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
                    await EmailCredential.update({
                        emailSend: increaseNumber
                    }, { where: { id: finaliseEmailCredential.id } });
                    await user.update({
                        password: bcPassword
                    });
                }
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
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.webHookApi = async (req, res) => {
    try {
        // Price course relation
        const courseAmount = {
            199: "cf95f6de-f1d4-4414-9b98-4eedf7591baf",
            499: "cf95f6de-f1d4-4414-9b98-4eedf7591baf",
            2499: "cf95f6de-f1d4-4414-9b98-4eedf7591baf",
            1999: "2cc013d3-7637-46c1-a93b-ef202bc8122f",
            2500: "b1c30ef9-411d-44f8-8943-a9579bc3cdaa",
            500: "76fa9493-29c9-4575-bf37-de76280cf016",
            2000: "76fa9493-29c9-4575-bf37-de76280cf016",
            1000: "76fa9493-29c9-4575-bf37-de76280cf016",
            999: ["cf95f6de-f1d4-4414-9b98-4eedf7591baf", "76fa9493-29c9-4575-bf37-de76280cf016"],
            699: ["cf95f6de-f1d4-4414-9b98-4eedf7591baf", "76fa9493-29c9-4575-bf37-de76280cf016"],
            10000: ["26527676-311b-4622-b2ac-ac57de3a872c", "142b72f6-fa2b-44eb-8d11-46dea4e9c5dc"],
            5000: ["26527676-311b-4622-b2ac-ac57de3a872c", "142b72f6-fa2b-44eb-8d11-46dea4e9c5dc"],
            30000: "84b010a6-083f-4fd6-8ffa-13e0ebff286e",
            50000: "23279fd4-cf3b-47da-969d-43795fc09ab3",
            60000: "23279fd4-cf3b-47da-969d-43795fc09ab3",
            99999: "23279fd4-cf3b-47da-969d-43795fc09ab3"
        }
        // Price
        const amount = req.body.payload.payment.entity.amount;
        // On Success payment
        if (req.body.event === "payment.captured") {
            const email = req.body.payload.payment.entity.email;
            const contact = req.body.payload.payment.entity.contact;
            // Find user
            let isUser = await User.findOne({
                where: {
                    email: email
                }
            });
            let course;
            let htmlContent;
            let headers;
            // Check price course relation and get course and Set HTML content for email 
            if (amount / 100 === 5000 || amount / 100 === 10000 || amount / 100 === 999 || amount / 100 === 699) {
                course = await Course.findAll({ where: { id: courseAmount[amount / 100] } });
            }
            else {
                course = await Course.findOne({ where: { id: courseAmount[amount / 100] } });
            }
            htmlContent = `
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
                    <div style="width: 80%; margin: auto; overflow: hidden;">
                    </div>
                    <div style="width: 80%; margin: auto;">
                        <h2 style="text-align: center;">Welcome to the Affiliate Indians System!</h2>
                        <p>Thank you to purchase course.</p>
                        <p><strong>Login Url:</strong> https://courses.affiliateindians.com/sign_in</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p>Make sure you save this email in case you ever need it.</p>
                        <p>See you on the inside!</p>
                        <p>The Affiliate Indians Team</p>
                        <p>
                            <strong>IMPORTANT MESSAGE:</strong> We are dedicated to customer support, and solving your problems. If you experience any technical issues with our system, compensation plan, or have a billing question -- please email us at <a href="mailto:support@affiliateindians.com">support@affiliateindians.com</a>
                        </p>
                    </div>
                </body>`;
            if (isUser) {
                headers = { "Thank you mail": isUser.userCode };
            }
            // If user is new
            if (!isUser) {
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
                // Generate password
                const password = (email).slice(0, 8);
                const salt = await bcrypt.genSalt(10);
                const bcPassword = await bcrypt.hash(password, salt);
                // Store in database
                isUser = await User.create({
                    email: email,
                    mobileNumber: contact,
                    userCode: code,
                    password: bcPassword,
                    termAndConditionAccepted: true
                });
                // Creating Wallet
                await UserWallet.create({
                    userId: isUser.id
                });
                headers = { "Login Credential": code };
                // Set HTML content for email 
                htmlContent = `
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
                        <div style="width: 80%; margin: auto; overflow: hidden;">
                        </div>
                        <div style="width: 80%; margin: auto;">
                            <h2 style="text-align: center;">Welcome to the Affiliate Indians System!</h2>
                            <p>Below are your login details for the Affiliate Indians Portal.</p>
                            <p><strong>Login Url:</strong> https://courses.affiliateindians.com/sign_in</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Password:</strong>  ${password}</p>
                            <p>Make sure you save this email in case you ever need it.</p>
                            <p>See you on the inside!</p>
                            <p>The Affiliate Indians Team</p>
                            <p>
                                <strong>IMPORTANT MESSAGE:</strong> We are dedicated to customer support, and solving your problems. If you experience any technical issues with our system, compensation plan, or have a billing question -- please email us at <a href="mailto:support@affiliateindians.com">support@affiliateindians.com</a>
                            </p>
                        </div>
                    </body>`;
            }
            // Association with course
            if (amount / 100 === 5000 || amount / 100 === 10000 || amount / 100 === 999 || amount / 100 === 699) {
                for (let i = 0; i < course.length; i++) {
                    const userCourse = await User_Course.findOne({
                        where: {
                            courseId: course[i].id,
                            userId: isUser.id,
                            status: "paid",
                            verify: true
                        }
                    });
                    if (!userCourse) {
                        await User_Course.create({
                            courseId: course[i].id,
                            userId: isUser.id,
                            amount: amount / 100,
                            currency: req.body.payload.payment.entity.currency,
                            razorpayOrderId: req.body.payload.payment.entity.order_id,
                            status: "paid",
                            razorpayTime: req.body.payload.payment.entity.created_at,
                            razorpayPaymentId: req.body.payload.payment.entity.id,
                            verify: true,
                        });
                    }
                }
            }
            else {
                const userCourse = await User_Course.findOne({
                    where: {
                        courseId: course.id,
                        userId: isUser.id,
                        status: "paid",
                        verify: true
                    }
                });
                if (!userCourse) {
                    await User_Course.create({
                        courseId: course.id,
                        userId: isUser.id,
                        amount: amount / 100,
                        currency: req.body.payload.payment.entity.currency,
                        razorpayOrderId: req.body.payload.payment.entity.order_id,
                        status: "paid",
                        razorpayTime: req.body.payload.payment.entity.created_at,
                        razorpayPaymentId: req.body.payload.payment.entity.id,
                        verify: true
                    });
                }
            }
            // Update sendEmail 0 every day
            const date1 = JSON.stringify(new Date());
            const todayDate = `${date1.slice(1, 11)}`;
            const changeUpdateDate = await EmailCredential.findAll({
                where: {
                    updatedAt: { [Op.lt]: todayDate }
                },
                order: [
                    ['createdAt', 'ASC']
                ]
            });
            for (let i = 0; i < changeUpdateDate.length; i++) {
                await EmailCredential.update({
                    emailSend: 0
                }, {
                    where: {
                        id: changeUpdateDate[i].id
                    }
                });
            }
            // finalise email credentiel
            const emailCredential = await EmailCredential.findAll({
                order: [
                    ['createdAt', 'ASC']
                ]
            });
            let finaliseEmailCredential;
            for (let i = 0; i < emailCredential.length; i++) {
                if (parseInt(emailCredential[i].emailSend) < 300) {
                    finaliseEmailCredential = emailCredential[i];
                    break;
                }
            }
            if (finaliseEmailCredential) {
                // Send OTP to Email By Brevo
                if (finaliseEmailCredential.plateForm === "BREVO") {
                    let defaultClient = brevo.ApiClient.instance;
                    let apiKey = defaultClient.authentications['api-key'];
                    apiKey.apiKey = finaliseEmailCredential.EMAIL_API_KEY;
                    let apiInstance = new brevo.TransactionalEmailsApi();
                    let sendSmtpEmail = new brevo.SendSmtpEmail();
                    sendSmtpEmail.subject = "AFFILIATE INDIAN";
                    sendSmtpEmail.sender = { "name": "Affiliate Indian", "email": finaliseEmailCredential.email };
                    sendSmtpEmail.replyTo = { "email": finaliseEmailCredential.email, "name": "Affiliate Indian Support" };
                    sendSmtpEmail.headers = headers;
                    sendSmtpEmail.htmlContent = htmlContent;
                    sendSmtpEmail.to = [
                        { "email": email, "name": "User" }
                    ];
                    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
                    }, function (error) {
                    });
                }
                const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
                await EmailCredential.update({
                    emailSend: increaseNumber
                }, { where: { id: finaliseEmailCredential.id } });
            }
            res.status(201).send({
                success: true,
                message: `webHookData get successfully!`
            });
        } else {
            res.status(400).send({
                success: false,
                message: `Unexpected error!`
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

// const courseAmount = {
//     199: "3-Step High Ticket Affiliate System",
//     499: "3-Step High Ticket Affiliate System",
//     2499: "3-Step High Ticket Affiliate System",
//     1999: "Business builder challenge",
//     2500: "Your bonuses",
//     500: "Clickbank mastery",
//     2000: "Clickbank mastery",
//     1000: "Clickbank mastery",
//     10000: ["beginner membership", "pro membership"],
//     5000: ["beginner membership", "pro membership"],
//     30000: "Expert MEMBERSHIP",
//     50000: "SUPER Affiliate Membership",
//     60000: "SUPER Affiliate Membership",
//     99999: "SUPER Affiliate Membership"
// }

// {
//     "id": "6238e81c-f884-4bea-9497-4ee563ac1edc",
//     "amount": null,
//     "currency": null,
//     "receipt": null,
//     "razorpayOrderId": null,
//     "razorpayPaymentId": null,
//     "razorpayTime": null,
//     "status": "paid",
//     "verify": true,
//     "referalId": null,
//     "marketingTag": null,
//     "couponCode": null,
//     "saleLinkCode": null,
//     "courseId": "cf95f6de-f1d4-4414-9b98-4eedf7591baf",
//     "userId": "6df91ef7-8824-46e0-864f-efeb7cc9ffcf",
//     "createdAt": "2023-12-25T10:42:35.000Z",
//     "updatedAt": "2023-12-25T10:42:35.000Z",
//     "deletedAt": null
// },

// {
//     "id": "c677ef12-887b-4710-8743-c31054398a4b",
//     "amount": null,
//     "currency": null,
//     "receipt": null,
//     "razorpayOrderId": null,
//     "razorpayPaymentId": null,
//     "razorpayTime": null,
//     "status": "paid",
//     "verify": true,
//     "referalId": null,
//     "marketingTag": null,
//     "couponCode": null,
//     "saleLinkCode": null,
//     "courseId": "76fa9493-29c9-4575-bf37-de76280cf016",
//     "userId": "6df91ef7-8824-46e0-864f-efeb7cc9ffcf",
//     "createdAt": "2023-12-25T10:43:03.000Z",
//     "updatedAt": "2023-12-25T10:43:03.000Z",
//     "deletedAt": null
// }