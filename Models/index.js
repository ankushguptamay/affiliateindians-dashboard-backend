const dbConfig = require('../Config/db.config.js');

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

const queryInterface = sequelize.getQueryInterface();

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Admin
// db.advisor = require('./Admin/advisor.js')(sequelize, Sequelize);
// db.member = require('./Admin/member.js')(sequelize, Sequelize);
// db.lead = require('./Admin/lead.js')(sequelize, Sequelize);
// db.myBooking = require('./Admin/myBooking.js')(sequelize, Sequelize);
// db.eWallet = require('./Admin/eWallet.js')(sequelize, Sequelize);

// Admin
db.admin = require('./Admin/admin')(sequelize, Sequelize);
db.adminWallet = require('./Admin/adminWalletModel.js')(sequelize, Sequelize);
db.adminsAffiliateLinks = require('./Admin/adminsAffiliateLinkModel.js')(sequelize, Sequelize);
db.emailCredential = require('./Admin/emailCredentialModel.js')(sequelize, Sequelize);
db.scheduleCallBooking = require('./Admin/Master/scheduleCallBookingModel.js')(sequelize, Sequelize);

// Admin AddCourse
db.course = require('./Admin/AddCourse/courseModel.js')(sequelize, Sequelize);
db.lesson = require('./Admin/AddCourse/lessonModel.js')(sequelize, Sequelize);
db.section = require('./Admin/AddCourse/sectionModel')(sequelize, Sequelize);
db.lessonQuiz = require('./Admin/AddCourse/lessonQuizModel.js')(sequelize, Sequelize);
db.lessonVideo = require('./Admin/AddCourse/lessonVideoModel.js')(sequelize, Sequelize);
db.lessonFile = require('./Admin/AddCourse/lessonFileModel.js')(sequelize, Sequelize);
db.videoComment = require('./Admin/AddCourse/videoCommentModel.js')(sequelize, Sequelize);
db.upSell = require('./Admin/Master/upSellModel.js')(sequelize, Sequelize);
db.assignment = require('./Admin/AddCourse/assignmentModel.js')(sequelize, Sequelize);
db.lessonText = require('./Admin/AddCourse/lessonTextModel.js')(sequelize, Sequelize);

// Teacher
db.teacher = require('./Admin/Teacher/teacherModel.js')(sequelize, Sequelize);

// Master
db.template = require('./Admin/Master/templateModel.js')(sequelize, Sequelize);
db.templateForm = require('./Admin/Master/templateFormModel.js')(sequelize, Sequelize);
db.affiliateMarketingRatio = require('./Admin/Master/affiliateMarketingRatioModel.js')(sequelize, Sequelize);
db.tag = require('./Admin/Master/tagModel.js')(sequelize, Sequelize);
db.coupon = require('./Admin/Master/couponModel.js')(sequelize, Sequelize);
db.course_coupon = require('./Admin/Master/course_CouponModel.js')(sequelize, Sequelize);

// user
db.user = require('./User/user.js')(sequelize, Sequelize);
db.userEmailOTP = require('./User/emailOTP.js')(sequelize, Sequelize);
db.user_course = require('./User/user_CourseModel.js')(sequelize, Sequelize);
db.userWallet = require('./User/walletModel.js')(sequelize, Sequelize);
db.quizAnswer = require('./User/quizAnswerModel.js')(sequelize, Sequelize);
db.userAccountDetail = require('./User/userAccountDetailsModel.js')(sequelize, Sequelize);
db.assignmentAnswer = require('./User/assignmentAnswerModel.js')(sequelize, Sequelize);
db.affiliateUserIdRequest = require('./User/affiliateUserIdRequestModel.js')(sequelize, Sequelize);
db.usersAffiliateLinks = require('./User/usersAffiliateLinkModel.js')(sequelize, Sequelize);

// Admin Course Association
db.admin.hasMany(db.course, { foreignKey: "adminId" });
db.course.belongsTo(db.admin, { foreignKey: "adminId" });

db.admin.hasMany(db.emailCredential, { foreignKey: "adminId" });
db.emailCredential.belongsTo(db.admin, { foreignKey: "adminId" });

db.admin.hasMany(db.section, { foreignKey: "adminId" });

db.admin.hasMany(db.lesson, { foreignKey: "adminId" });

db.admin.hasMany(db.lessonQuiz, { foreignKey: "adminId" });

db.admin.hasMany(db.lessonVideo, { foreignKey: "adminId" });

db.admin.hasMany(db.lessonFile, { foreignKey: "adminId" });

// Admin Master Association
db.admin.hasMany(db.template, { foreignKey: "adminId" });
db.admin.hasMany(db.affiliateMarketingRatio, { foreignKey: "adminId" });
db.admin.hasMany(db.tag, { foreignKey: "adminId" });
db.admin.hasMany(db.coupon, { foreignKey: "adminId" });

// Admin Teacher Association
db.admin.hasMany(db.teacher, { foreignKey: "adminId", as: "teacher" });
db.teacher.belongsTo(db.admin, { foreignKey: "adminId", as: "admin" });

// Admin Teacher Association
db.admin.hasOne(db.adminWallet, { foreignKey: "adminId", as: "wallet" });
db.adminWallet.belongsTo(db.admin, { foreignKey: "adminId", as: "admin" });

// Course Association
db.course.hasMany(db.section, { foreignKey: "courseId", as: "sections", onDelete: "CASCADE" });
db.section.belongsTo(db.course, { foreignKey: "courseId", as: "parentCourse", onDelete: "CASCADE" });

db.course.hasMany(db.lesson, { foreignKey: "courseId", as: "lessons", onDelete: "CASCADE" });
db.lesson.belongsTo(db.course, { foreignKey: "courseId", as: "parentCourse", onDelete: "CASCADE" });

db.course.hasMany(db.lessonFile, { foreignKey: "courseId", as: "lessonFiles", onDelete: "CASCADE" });

db.course.hasMany(db.lessonVideo, { foreignKey: "courseId", as: "lessonVideos", onDelete: "CASCADE" });

db.course.hasMany(db.lessonQuiz, { foreignKey: "courseId", as: "lessonQuizs", onDelete: "CASCADE" });

db.course.hasMany(db.videoComment, { foreignKey: "courseId", as: "videoComment", onDelete: "CASCADE" });

// Section Association
db.section.hasMany(db.lesson, { foreignKey: "sectionId", as: "lessons", onDelete: "CASCADE" });
db.lesson.belongsTo(db.section, { foreignKey: "sectionId", as: "parentSection", onDelete: "CASCADE" });

db.section.hasMany(db.lessonFile, { foreignKey: "sectionId", as: "lessonFiles", onDelete: "CASCADE" });

db.section.hasMany(db.lessonVideo, { foreignKey: "sectionId", as: "lessonVideos", onDelete: "CASCADE" });

db.section.hasMany(db.lessonQuiz, { foreignKey: "sectionId", as: "lessonQuizs", onDelete: "CASCADE" });

db.section.hasMany(db.videoComment, { foreignKey: "sectionId", as: "videoComment", onDelete: "CASCADE" });

// Lesson Association
db.lesson.hasMany(db.lessonFile, { foreignKey: "lessonId", as: "lessonFiles", onDelete: "CASCADE" });

db.lesson.hasMany(db.lessonVideo, { foreignKey: "lessonId", as: "lessonVideos", onDelete: "CASCADE" });

db.lesson.hasMany(db.lessonQuiz, { foreignKey: "lessonId", as: "lessonQuizs", onDelete: "CASCADE" });

db.lesson.hasMany(db.videoComment, { foreignKey: "lessonId", as: "videoComment", onDelete: "CASCADE" });

// Video Association
db.lessonVideo.hasMany(db.videoComment, { foreignKey: "lessonVideoId", as: "videoComment", onDelete: "CASCADE" });

// Coupon Association with course_coupon
db.coupon.hasMany(db.course_coupon, { foreignKey: "couponId", as: "course_coupons" });
db.course_coupon.belongsTo(db.coupon, { foreignKey: "couponId", as: "coupon" });

// course Association course_coupon
db.course.hasMany(db.course_coupon, { foreignKey: "courseId", as: "course_coupons" });
db.course_coupon.belongsTo(db.course, { foreignKey: "courseId", as: "course" });

// User Association with wallet
db.user.hasOne(db.userWallet, { foreignKey: "userId", as: "wallet" });
db.userWallet.belongsTo(db.user, { foreignKey: "userId", as: "user" });

// User Association with quizAnswer
db.user.hasMany(db.quizAnswer, { foreignKey: "userId", as: "quizAnswer" });
db.quizAnswer.belongsTo(db.user, { foreignKey: "userId", as: "user" });

// Quiz Association with quizAnswer
db.lessonQuiz.hasMany(db.quizAnswer, { foreignKey: "quizId", as: "quizAnswer" });
db.quizAnswer.belongsTo(db.lessonQuiz, { foreignKey: "quizId", as: "quiz" });

// quizAnswer Association with course
db.course.hasMany(db.quizAnswer, { foreignKey: "courseId", as: "quizAnswer" });
// quizAnswer Association with section
db.section.hasMany(db.quizAnswer, { foreignKey: "sectionId", as: "quizAnswer" });
// quizAnswer Association with lesson
db.lesson.hasMany(db.quizAnswer, { foreignKey: "lessonId", as: "quizAnswer" });

// course Association upSell
db.lesson.hasMany(db.upSell, { foreignKey: "lessonId", as: "upSell" });
// admin Association upSell
db.admin.hasMany(db.upSell, { foreignKey: "adminId", as: "upSell" });
// affiliateMarketingRatio Association with course
db.affiliateMarketingRatio.hasMany(db.course, { foreignKey: "ratioId" });
db.course.belongsTo(db.affiliateMarketingRatio, { foreignKey: "ratioId" });
// // admin Association shareSaleLink
// db.admin.hasMany(db.shareSaleLink, { foreignKey: "adminId", as: "shareSaleLink" });

// user Association with userAccountDetail
db.user.hasOne(db.userAccountDetail, { foreignKey: "userId" });
db.userAccountDetail.belongsTo(db.user, { foreignKey: "userId" });

// template Association templateForm
db.template.hasMany(db.templateForm, { foreignKey: "templateId", as: "templateForm" });
// admin Association templateForm
db.admin.hasMany(db.templateForm, { foreignKey: "adminId", as: "templateForm" });
// course Association with templateForm
db.course.hasMany(db.templateForm, { foreignKey: "courseId", as: "templateForm" });
db.templateForm.belongsTo(db.course, { foreignKey: "courseId", as: "course" });

// admin Association assignment
db.admin.hasMany(db.assignment, { foreignKey: "adminId", as: "assignment" });
// course Association with assignment
db.course.hasMany(db.assignment, { foreignKey: "courseId", as: "assignment" });
// Section Association with assignment
db.section.hasMany(db.assignment, { foreignKey: "sectionId", as: "assignment" });
// Lesson Association with assignment
db.lesson.hasMany(db.assignment, { foreignKey: "lessonId", as: "assignment" });

// user Association assignmentAnswer
db.user.hasMany(db.assignmentAnswer, { foreignKey: "userId", as: "assignmentAnswer" });
// course Association with assignmentAnswer
db.assignment.hasMany(db.assignmentAnswer, { foreignKey: "assignmentId", as: "assignmentAnswer" });
db.assignmentAnswer.belongsTo(db.assignment, { foreignKey: "assignmentId", as: "assignment" });
// assignmentAnswer Association with course
db.course.hasMany(db.assignmentAnswer, { foreignKey: "courseId", as: "assignmentAnswer" });
// assignmentAnswer Association with section
db.section.hasMany(db.assignmentAnswer, { foreignKey: "sectionId", as: "assignmentAnswer" });
// assignmentAnswer Association with lesson
db.lesson.hasMany(db.assignmentAnswer, { foreignKey: "lessonId", as: "assignmentAnswer" });

// user Association assignmentAnswer
db.user.hasMany(db.affiliateUserIdRequest, { foreignKey: "userId", as: "affiliateUserIdRequest" });
db.affiliateUserIdRequest.belongsTo(db.user, { foreignKey: "userId", as: "user" });
// admin Association assignmentAnswer
db.admin.hasMany(db.affiliateUserIdRequest, { foreignKey: "adminId", as: "affiliateUserIdRequest" });
db.affiliateUserIdRequest.belongsTo(db.admin, { foreignKey: "adminId", as: "admin" });

// Schedule call association
db.admin.hasMany(db.scheduleCallBooking, { foreignKey: "adminId", as: "scheduleBooking" });
db.scheduleCallBooking.belongsTo(db.admin, { foreignKey: "adminId", as: "admin" });

db.user.hasMany(db.scheduleCallBooking, { foreignKey: "userId", as: "scheduleBooking" });
db.scheduleCallBooking.belongsTo(db.user, { foreignKey: "userId", as: "user" });

// adminsAffiliateLink assocication
db.admin.hasMany(db.adminsAffiliateLinks, { foreignKey: "adminId", as: "adminsAffiliateLink" });
db.adminsAffiliateLinks.belongsTo(db.admin, { foreignKey: "adminId", as: "admin" });

db.course.hasMany(db.adminsAffiliateLinks, { foreignKey: "courseId", as: "adminsAffiliateLink" });
db.adminsAffiliateLinks.belongsTo(db.course, { foreignKey: "courseId", as: "course" });

// usersAffiliateLink assocication
db.user.hasMany(db.usersAffiliateLinks, { foreignKey: "userId", as: "usersAffiliateLinks" });
db.usersAffiliateLinks.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.admin.hasMany(db.usersAffiliateLinks, { foreignKey: "adminId", as: "usersAffiliateLinks" });
db.usersAffiliateLinks.belongsTo(db.admin, { foreignKey: "adminId", as: "admin" });

db.course.hasMany(db.usersAffiliateLinks, { foreignKey: "courseId", as: "usersAffiliateLinks" });
db.usersAffiliateLinks.belongsTo(db.course, { foreignKey: "courseId", as: "course" });

db.affiliateUserIdRequest.hasMany(db.usersAffiliateLinks, { foreignKey: "affiliateUserId", as: "usersAffiliateLinks" });
db.usersAffiliateLinks.belongsTo(db.affiliateUserIdRequest, { foreignKey: "affiliateUserId", as: "affiliateUserIdRequest" });

// lesson text association
db.admin.hasMany(db.lessonText, { foreignKey: "adminId", as: "lessonTexts" });
db.course.hasMany(db.lessonText, { foreignKey: "courseId", as: "lessonTexts" });
db.section.hasMany(db.lessonText, { foreignKey: "sectionId", as: "lessonTexts" });
db.lesson.hasMany(db.lessonText, { foreignKey: "lessonId", as: "lessonTexts" });

// db.emailCredential.destroy({ where: { email: "affiliateindians@gmail.com" } });

// db.emailCredential.findOne({
//     where: {
//         email: ""
//     }
// }).then((res) => {
//     console.log(res);
//     if (!res) {
//         db.emailCredential.create({
//             email: "",
//             plateForm: "BREVO",
//             EMAIL_API_KEY: ""
//         });
//     }
// }).catch((err) => { console.log(err) });

// queryInterface.addColumn("videoComments", "cloudinaryFileId", { type: DataTypes.STRING }).then((res) => { console.log(res) }).catch((err) => { console.log(err) });
// queryInterface.addColumn("templates", "cloudinaryImageId", { type: DataTypes.STRING }).then((res) => { console.log(res) }).catch((err) => { console.log(err) });

module.exports = db;