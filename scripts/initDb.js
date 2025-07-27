const sequelize = require('../config/database');
const { Korisnik, Nekretnina, Upit, Zahtjev, Ponuda } = require('../models');
const bcrypt = require('bcrypt');

async function initDatabase() {
    try {
        console.log('Inicijalizacija baze podataka...');
        
        // Dodajte logging da vidite SQL upite
        await sequelize.sync({ 
            force: true,
            logging: console.log 
        });

        // Kreiranje admin korisnika
        const adminPassword = await bcrypt.hash('admin', 10);
        await Korisnik.create({
            ime: 'Admin',
            prezime: 'Admin',
            username: 'admin',
            password: adminPassword,
            admin: true
        });

        // Kreiranje običnog korisnika
        const userPassword = await bcrypt.hash('user', 10);
        await Korisnik.create({
            ime: 'User',
            prezime: 'User',
            username: 'user',
            password: userPassword,
            admin: false
        });

        // Kreiranje testnih nekretnina
        await Nekretnina.create({
            naziv: 'Stan u centru',
            tip_nekretnine: 'Stan',
            kvadratura: 60,
            cijena: 200000,
            tip_grijanja: 'Centralno',
            lokacija: 'Sarajevo',
            godina_izgradnje: 2010,
            datum_objave: new Date(),
            opis: 'Lijep stan u centru grada'
        });

        await Nekretnina.create({
            naziv: 'Kuća sa dvorištem',
            tip_nekretnine: 'Kuća',
            kvadratura: 150,
            cijena: 300000,
            tip_grijanja: 'Plin',
            lokacija: 'Mostar',
            godina_izgradnje: 2015,
            datum_objave: new Date(),
            opis: 'Prostrana kuća sa velikim dvorištem'
        });

        console.log('Baza podataka je uspješno inicijalizirana');
    } catch (error) {
        console.error('Greška pri inicijalizaciji baze:', error);
    }
}

initDatabase(); 