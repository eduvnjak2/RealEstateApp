const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Upit extends Model {}

Upit.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tekst: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Upit',
    tableName: 'Upit'
});

module.exports = Upit; 