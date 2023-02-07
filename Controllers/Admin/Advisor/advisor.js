const db = require('../../../Models');
const Advisor = db.advisor;
const { validationResult } = require('express-validator');
const { deleteFile } = require("../../../Util/deleteFile")

exports.createAdvisor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        deleteFile(req.file.path);
        return res.status(402).json({ errors: errors.array() });
    }
    try {
        const advisors = await Advisor.create({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            image: req.file.path
        });
        res.status(201).send({ message: `Advisor added with ID: ${advisors.id}` });
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.getAllAdvisor = async (req, res) => {
    try {
        const advisors = await Advisor.findAll();
        res.status(200).send({
            message: "Advisor fetched successfully!",
            data: advisors
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.deleteAdvisor = async (req, res) => {
    try {
        const id = req.params.id;
        const advisors = await Advisor.findOne({ where: { id: id } });
        if (!advisors) {
            return res.status(400).send({ message: "Advisor is not present!" });
        }
        deleteFile(advisors.image);
        await advisors.destroy();
        res.status(200).send({ message: `Advisor deleted of ID: ${id}` });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.updateAdvisor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if (req.file) {
            deleteFile(req.file.path);
        }
        return res.status(402).json({ errors: errors.array() });
    }
    try {
        let Image;
        const id = req.params.id;
        const advisors = await Advisor.findOne({ where: { id: id } });
        if (!advisors) {
            return res.status(400).send({ message: "Advisor is not present!" });
        }
        if (req.file) {
            deleteFile(advisors.image);
            Image = req.file.path;
        }
        await advisors.update({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            image: Image
        });
        res.status(200).send({ message: `Advisor modified of ID: ${id}` });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};