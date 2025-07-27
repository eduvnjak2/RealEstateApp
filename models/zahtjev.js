const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Zahtjev extends Model {}

Zahtjev.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tekst: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    trazeniDatum: {
        type: DataTypes.DATE,
        allowNull: false
    },
    odobren: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Zahtjev',
    tableName: 'Zahtjev'
});

module.exports = Zahtjev; 