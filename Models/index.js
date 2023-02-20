const dbConfig = require('../Config/db.config.js');
const { deleteFile } = require("../Util/deleteFile")

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
db.AddCourse = require('./Admin/AddCourse/addCourseModel')(sequelize, Sequelize);
db.Lecture = require('./Admin/AddCourse/lectureModel')(sequelize, Sequelize);
db.Section = require('./Admin/AddCourse/sectionModel')(sequelize, Sequelize);

db.AddCourse.hasMany(db.Section, { foreignKey: "addCourse_id", as: "curriculum", onDelete: "CASCADE" });
db.Section.belongsTo(db.AddCourse, { foreignKey: "addCourse_id" });

db.Section.hasMany(db.Lecture, { foreignKey: "section_id", onDelete: "CASCADE"});
db.Lecture.belongsTo(db.Section, { foreignKey: "section_id", onDelete: "CASCADE" });

module.exports = db;