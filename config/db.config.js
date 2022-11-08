module.exports = {
    host: 'localhost',
    user: 'root',
    password: 'Root@123',
    database: 'dashboard',
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};