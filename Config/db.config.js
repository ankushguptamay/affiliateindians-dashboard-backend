module.exports = {
    host: process.env.DEV_HOST,
    user: process.env.DEV_USER,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};