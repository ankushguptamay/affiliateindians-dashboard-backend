const db = require('../../Models');
const UserAccountDetail = db.userAccountDetail;
const { Op } = require('sequelize');
const { accountDetailsValidation } = require("../../Middlewares/Validate/validateUser");

exports.addAccountDetails = async (req, res) => {
    try {
        // Validate body
        const { error } = accountDetailsValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { accountHolderName, accountNumber, bankName, branchName, IFSCCode, payTMNumber, gPayNumber, phonePayNumber, UPIID } = req.body;
        if (accountHolderName || accountNumber || bankName || branchName) {
            if (accountHolderName && accountNumber && bankName && branchName) {

            } else {
                return res.status(400).send({
                    success: false,
                    message: `Required field should be present!`
                });
            }
        }
        await UserAccountDetail.create({
            accountHolderName: accountHolderName,
            accountNumber: accountNumber,
            bankName: bankName,
            branchName: branchName,
            IFSCCode: IFSCCode,
            payTMNumber: payTMNumber,
            gPayNumber: gPayNumber,
            phonePayNumber: phonePayNumber,
            UPIID: UPIID,
            userId: req.user.id
        });
        res.status(201).send({
            success: true,
            message: `Account Details added successfully!`
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.findUserAccountDetails = async (req, res) => {
    try {
        const accountDetails = await UserAccountDetail.findOne({
            where: {
                userId: req.user.id
            }
        });
        if (!accountDetails) {
            return res.status(400).send({
                success: false,
                message: `No account details found!`
            })
        }
        res.status(200).send({
            success: true,
            message: `Account Details fetched successfully!`,
            data: accountDetails
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

// Not Hard delete
exports.deleteAccountDetails = async (req, res) => {
    try {
        const id = req.params.id;
        // Is Account details present
        const accountDetails = await UserAccountDetail.findOne({
            where: {
                id: id,
                userId: req.user.id
            }
        });
        if (!accountDetails) {
            return res.status(400).send({
                success: false,
                message: `No account details found!`
            })
        }
        accountDetails.destroy();
        res.status(200).send({
            success: true,
            message: `Account Details successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.updateAccountDetails = async (req, res) => {
    try {
        // Validate body
        const { error } = accountDetailsValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { accountHolderName, accountNumber, bankName, branchName, IFSCCode, payTMNumber, gPayNumber, phonePayNumber, UPIID } = req.body;
        if (accountHolderName || accountNumber || bankName || branchName) {
            if (accountHolderName && accountNumber && bankName && branchName) {

            } else {
                return res.status(400).send({
                    success: false,
                    message: `Required field should be present!`
                });
            }
        }
        // Is Account details present
        const id = req.params.id;
        const accountDetails = await UserAccountDetail.findOne({
            where: {
                id: id,
                userId: req.user.id
            }
        });
        if (!accountDetails) {
            return res.status(400).send({
                success: false,
                message: `No account details found!`
            })
        }
        await accountDetails.update({
            accountHolderName: accountHolderName,
            accountNumber: accountNumber,
            bankName: bankName,
            branchName: branchName,
            IFSCCode: IFSCCode,
            payTMNumber: payTMNumber,
            gPayNumber: gPayNumber,
            phonePayNumber: phonePayNumber,
            UPIID: UPIID
        });
        res.status(200).send({
            success: true,
            message: `Account Details updated successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};
