const { Sequelize } = require('sequelize');

const databaseName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'wt24';
const databaseUser = process.env.MYSQLUSER || process.env.DB_USER || 'root';
const databasePassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'password';
const databaseHost = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const databasePort = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);

const sequelize = new Sequelize(databaseName, databaseUser, databasePassword, {
    host: databaseHost,
    port: databasePort,
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize; 