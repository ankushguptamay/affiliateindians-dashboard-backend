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
db.user = require('./Admin/user.js')(sequelize, Sequelize);
db.advisor = require('./Admin/advisor.js')(sequelize, Sequelize);
db.member = require('./Admin/member.js')(sequelize, Sequelize);
db.lead = require('./Admin/lead.js')(sequelize, Sequelize);
db.scheduleBooking = require('./Admin/scheduleBooking.js')(sequelize, Sequelize);
db.myBooking = require('./Admin/myBooking.js')(sequelize, Sequelize);
db.eWallet = require('./Admin/eWallet.js')(sequelize, Sequelize);
db.admin = require('./Admin/admin')(sequelize, Sequelize);

// Admin AddCourse
db.addCourse = require('./Admin/AddCourse/addCourseModel')(sequelize, Sequelize);
db.lecture = require('./Admin/AddCourse/lectureModel')(sequelize, Sequelize);
db.courseSection = require('./Admin/AddCourse/sectionModel')(sequelize, Sequelize);

db.addCourse.hasMany(db.courseSection, { foreignKey: "addCourse_id", as: "curriculum" });
db.courseSection.belongsTo(db.addCourse, { foreignKey: "addCourse_id" });

db.courseSection.hasMany(db.lecture, { foreignKey: "section_id"});
db.lecture.belongsTo(db.courseSection, { foreignKey: "section_id" });

module.exports = db;