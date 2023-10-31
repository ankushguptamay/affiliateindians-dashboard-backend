const db = require('../../Models');
const crypto = require('crypto');
const User = db.user;
const User_Course = db.user_course;
const Course = db.course;
const { Op } = require('sequelize');
const { purchaseCourseValidation, verifyPaymentValidation } = require("../../Middlewares/Validate/userCoursePurchaseValidation");
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET_ID } = process.env;

// Razorpay
const Razorpay = require('razorpay');
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET_ID
});

exports.createPayment = async (req, res) => {
    try {
        // Validate body
        const { error } = purchaseCourseValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { amount, currency, receipt } = req.body; // receipt is id created for this order
        const courseId = req.params.id;
        const userId = req.user.id;

        razorpayInstance.orders.create({ amount, currency, receipt },
            (err, order) => {
                if (!err) {
                    User_Course.create({
                        courseId: courseId,
                        userId: userId,
                        amount: amount,
                        currency: currency,
                        receipt: receipt,
                        razorpayOrderId: order.id,
                        status: "created",
                        razorpayTime: order.created_at,
                        verify: false
                    })
                        .then(() => {
                            res.status(201).send({
                                success: true,
                                message: `Purchase order craeted suc!`,
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
    catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        // Validate body
        const { error } = verifyPaymentValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const { orderId, paymentId } = req.body;
        const razorpay_signature = req.headers['x-razorpay-signature'];

        // Creating hmac object 
        let hmac = crypto.createHmac('sha256', RAZORPAY_SECRET_ID);
        // Passing the data to be hashed
        hmac.update(orderId + "|" + paymentId);
        // Creating the hmac in the required format
        const generated_signature = hmac.digest('hex');

        if (razorpay_signature === generated_signature) {
            const purchase = await User_Course.findOne({
                where: {
                    razorpayOrderId: orderId
                }
            });
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