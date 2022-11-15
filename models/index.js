const dbConfig = require('../config/db.config.js');

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

db.user = require('./user/user.js')(sequelize, Sequelize);
db.advisor = require('./advisor/advisor.js')(sequelize, Sequelize);
db.member = require('./member/member.js')(sequelize, Sequelize);
db.lead = require('./lead/lead.js')(sequelize, Sequelize);
db.scheduleBooking = require('./scheduleBooking/scheduleBooking.js')(sequelize, Sequelize);
db.myBooking = require('./myBooking/myBooking.js')(sequelize, Sequelize);
db.eWallet = require('./eWallet/eWallet.js')(sequelize, Sequelize);

module.exports = db;