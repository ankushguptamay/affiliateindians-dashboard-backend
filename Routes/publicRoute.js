const express = require("express");
const router = express.Router();
const { redirectByTag } = require('../Controllers/Admin/shareSaleLinkController');

// Sale Link
router.post("/redirectByTag/:tag", redirectByTag);

module.exports = router;