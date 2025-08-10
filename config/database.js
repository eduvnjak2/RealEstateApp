const { Sequelize } = require('sequelize');

// Konfiguracija za Railway - koristi environment varijable
const sequelize = new Sequelize(
    process.env.DB_NAME || 'wt24',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // isključujemo logging u produkciji
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize; 