const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Nekretnina extends Model {
    async getInteresovanja() {
        const [upiti, zahtjevi, ponude] = await Promise.all([
            this.getUpiti(),
            this.getZahtjevi(),
            this.getPonude()
        ]);
        return [...upiti, ...zahtjevi, ...ponude];
    }
}

Nekretnina.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    naziv: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tip_nekretnine: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kvadratura: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cijena: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    tip_grijanja: DataTypes.STRING,
    lokacija: DataTypes.STRING,
    godina_izgradnje: DataTypes.INTEGER,
    datum_objave: DataTypes.DATE,
    opis: DataTypes.TEXT
}, {
    sequelize,
    modelName: 'Nekretnina',
    tableName: 'Nekretnina'
});

module.exports = Nekretnina; 