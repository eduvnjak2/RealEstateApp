const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Ponuda extends Model {
    async getVezanePonude() {
        return await Ponuda.findAll({
            where: { vezanaPonudaId: this.id }
        });
    }

    async dodajVezanuPonudu(novaPonuda) {
        novaPonuda.vezanaPonudaId = this.id;
        return await Ponuda.create(novaPonuda);
    }

    async odbijPonudu() {
        this.odbijenaPonuda = true;
        await this.save();
        
        // Odbij i sve vezane ponude
        const vezanePonude = await this.getVezanePonude();
        for (const ponuda of vezanePonude) {
            await ponuda.odbijPonudu();
        }
    }
}

Ponuda.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tekst: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    cijenaPonude: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    datumPonude: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    odbijenaPonuda: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    vezanaPonudaId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Ponuda',
            key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    }
}, {
    sequelize,
    modelName: 'Ponuda',
    tableName: 'Ponuda'
});


Ponuda.hasMany(Ponuda, {
    as: 'vezanePonude',
    foreignKey: 'vezanaPonudaId',
    constraints: false 
}); 

Ponuda.belongsTo(Ponuda, { 
    as: 'VezanaPonuda',
    foreignKey: 'vezanaPonudaId'
});

Ponuda.hasMany(Ponuda, {
    as: 'VezanePonude',
    foreignKey: 'vezanaPonudaId'
});

module.exports = Ponuda; 