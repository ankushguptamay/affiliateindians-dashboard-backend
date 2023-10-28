const dbConfig = require('../Config/db.config.js');

const Sequelize = require('sequelize');
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

// Admin
db.admin = require('./Admin/admin')(sequelize, Sequelize);

// Admin AddCourse
db.course = require('./Admin/AddCourse/courseModel.js')(sequelize, Sequelize);
db.lesson = require('./Admin/AddCourse/lessonModel.js')(sequelize, Sequelize);
db.section = require('./Admin/AddCourse/sectionModel')(sequelize, Sequelize);
db.lessonQuiz = require('./Admin/AddCourse/lessonQuizModel.js')(sequelize, Sequelize);
db.lessonVideo = require('./Admin/AddCourse/lessonVideoModel.js')(sequelize, Sequelize);
db.lessonFile = require('./Admin/AddCourse/lessonFileModel.js')(sequelize, Sequelize);
db.videoComment = require('./Admin/AddCourse/videoCommentModel.js')(sequelize, Sequelize);

// Teacher
db.teacher = require('./Admin/Teacher/teacherModel.js')(sequelize, Sequelize);

// Admin AddCourse
db.template = require('./Admin/Master/templateModel.js')(sequelize, Sequelize);

// user
db.user = require('./User/user.js')(sequelize, Sequelize);
db.user_course = require('./User/user_CourseModel.js')(sequelize, Sequelize);
// db.userAccountDetail = require('./User/userAccountDetailsModel.js')(sequelize, Sequelize);

// Admin Course Association
db.admin.hasMany(db.course, { foreignKey: "adminId" });
db.course.belongsTo(db.admin, { foreignKey: "adminId" });

db.admin.hasMany(db.section, { foreignKey: "adminId" });

db.admin.hasMany(db.lesson, { foreignKey: "adminId" });

// Admin Master Association
db.admin.hasMany(db.template, { foreignKey: "superAdminId" });

// Admin Teacher Association
db.admin.hasMany(db.teacher, { foreignKey: "adminId", as: "teacher" });
db.teacher.belongsTo(db.admin, { foreignKey: "adminId", as: "admin" })

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

// User Association with user_course
db.user.hasMany(db.user_course, { foreignKey: "userId", as: "user_courses" });
db.user_course.belongsTo(db.user, { foreignKey: "userId", as: "user" });

// course Association with userTag
db.course.hasMany(db.user_course, { foreignKey: "courseId", as: "user_courses" });
db.user_course.belongsTo(db.course, { foreignKey: "courseId", as: "course" });

// db.user.hasMany(db.userAccountDetail, { foreignKey: "userId" });
// db.userAccountDetail.belongsTo(db.user, { foreignKey: "userId" });

module.exports = db;