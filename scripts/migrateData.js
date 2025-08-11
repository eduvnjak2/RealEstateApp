const fs = require('fs').promises;
const path = require('path');
const { Korisnik, Nekretnina, Upit } = require('../models');
const bcrypt = require('bcrypt');

async function migrateData() {
    try {
        // Učitaj podatke iz JSON fajlova
        const nekretnineData = JSON.parse(
            await fs.readFile(path.join(__dirname, '../data/nekretnine.json'), 'utf8')
        );
        const korisniciData = JSON.parse(
            await fs.readFile(path.join(__dirname, '../data/korisnici.json'), 'utf8')
        );

        // Migriraj korisnike
        for (const korisnik of korisniciData) {
            const hashedPassword = await bcrypt.hash(korisnik.password, 10);
            await Korisnik.create({
                ...korisnik,
                password: hashedPassword
            });
        }

        // Migriraj nekretnine i njihove upite
        for (const nekretnina of nekretnineData) {
            const createdNekretnina = await Nekretnina.create({
                naziv: nekretnina.naziv,
                tip_nekretnine: nekretnina.tip_nekretnine,
                kvadratura: nekretnina.kvadratura,
                cijena: nekretnina.cijena,
                tip_grijanja: nekretnina.tip_grijanja,
                lokacija: nekretnina.lokacija,
                godina_izgradnje: nekretnina.godina_izgradnje,
                datum_objave: new Date(nekretnina.datum_objave.split('.').reverse().join('-')),
                opis: nekretnina.opis
            });

            // Migriraj upite za nekretninu
            for (const upit of nekretnina.upiti) {
                await Upit.create({
                    tekst: upit.tekst_upita,
                    KorisnikId: upit.korisnik_id,
                    NekretninaId: createdNekretnina.id
                });
            }
        }

        console.log('Podaci su uspješno migrirani');
    } catch (error) {
        console.error('Greška pri migraciji podataka:', error);
    }
}

migrateData(); 