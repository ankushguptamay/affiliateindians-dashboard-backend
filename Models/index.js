const dbConfig = require('../Config/db.config.js');
const { deleteFile } = require("../Util/deleteFile")

const Sequelize= require('sequelize');
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

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Admin
// db.advisor = require('./Admin/advisor.js')(sequelize, Sequelize);
// db.member = require('./Admin/member.js')(sequelize, Sequelize);
// db.lead = require('./Admin/lead.js')(sequelize, Sequelize);
// db.scheduleBooking = require('./Admin/scheduleBooking.js')(sequelize, Sequelize);
// db.myBooking = require('./Admin/myBooking.js')(sequelize, Sequelize);
// db.eWallet = require('./Admin/eWallet.js')(sequelize, Sequelize);

// Admin AddCourse
db.admin = require('./Admin/admin')(sequelize, Sequelize);
db.course = require('./Admin/AddCourse/courseModel.js')(sequelize, Sequelize);
db.lecture = require('./Admin/AddCourse/lectureModel')(sequelize, Sequelize);
db.section = require('./Admin/AddCourse/sectionModel')(sequelize, Sequelize);
db.lectureQuiz = require('./Admin/AddCourse/lectureQuizModel.js')(sequelize, Sequelize);
db.lectureVideo = require('./Admin/AddCourse/lectureVideoModel.js')(sequelize, Sequelize);
db.lectureFile = require('./Admin/AddCourse/lecturesFileModel.js')(sequelize, Sequelize);

// user
// db.user = require('./User/user.js')(sequelize, Sequelize);
// db.userAccountDetail = require('./User/userAccountDetailsModel.js')(sequelize, Sequelize);

// Admin Association
db.admin.hasMany(db.course, { foreignKey: "adminId" });
db.course.belongsTo(db.admin, { foreignKey: "adminId" });

db.admin.hasMany(db.section, { foreignKey: "adminId" });

db.admin.hasMany(db.lecture, { foreignKey: "adminId" });

// Course Association
db.course.hasMany(db.section, { foreignKey: "courseId", as: "sections", onDelete: "CASCADE" });
db.section.belongsTo(db.course, { foreignKey: "courseId", as: "parentCourse", onDelete: "CASCADE" });

db.course.hasMany(db.lecture, { foreignKey: "courseId", as: "lessons", onDelete: "CASCADE" });
db.lecture.belongsTo(db.course, { foreignKey: "courseId", as: "parentCourse", onDelete: "CASCADE" });

db.course.hasMany(db.lectureFile, { foreignKey: "courseId", as: "lessonFiles",  onDelete: "CASCADE" });

db.course.hasMany(db.lectureVideo, { foreignKey: "courseId",as: "lessonVideos",  onDelete: "CASCADE" });

db.course.hasMany(db.lectureQuiz, { foreignKey: "courseId",  as: "lessonQuizs", onDelete: "CASCADE" });

// Section Association
db.section.hasMany(db.lecture, { foreignKey: "sectionId", as: "lessons", onDelete: "CASCADE" });
db.lecture.belongsTo(db.section, { foreignKey: "sectionId", as: "parentSection", onDelete: "CASCADE" });

db.section.hasMany(db.lectureFile, { foreignKey: "sectionId", as: "lessonFiles", onDelete: "CASCADE" });

db.section.hasMany(db.lectureVideo, { foreignKey: "sectionId", as: "lessonVideos", onDelete: "CASCADE" });

db.section.hasMany(db.lectureQuiz, { foreignKey: "sectionId", as: "lessonQuizs", onDelete: "CASCADE" });

// Lecture Association
db.lecture.hasMany(db.lectureFile, { foreignKey: "lectureId", as: "lessonFiles", onDelete: "CASCADE" });

db.lecture.hasMany(db.lectureVideo, { foreignKey: "lectureId", as: "lessonVideos", onDelete: "CASCADE" });

db.lecture.hasMany(db.lectureQuiz, { foreignKey: "lectureId", as: "lessonQuizs", onDelete: "CASCADE" });

// User Association
// db.user.hasMany(db.userAccountDetail, { foreignKey: "userId" });
// db.userAccountDetail.belongsTo(db.user, { foreignKey: "userId" });

module.exports = db;