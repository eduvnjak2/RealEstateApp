const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Korisnik extends Model {}

Korisnik.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prezime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Korisnik',
    tableName: 'Korisnik'
});

module.exports = Korisnik; 