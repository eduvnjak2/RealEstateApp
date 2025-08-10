const { Sequelize } = require('sequelize');

// Lokalna statična konfiguracija (početno stanje)
const sequelize = new Sequelize('wt24', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize; 