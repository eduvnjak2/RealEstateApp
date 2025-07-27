const Korisnik = require('./korisnik');
const Nekretnina = require('./nekretnina');
const Upit = require('./upit');
const Zahtjev = require('./zahtjev');
const Ponuda = require('./ponuda');

Korisnik.hasMany(Upit);
Upit.belongsTo(Korisnik);

Korisnik.hasMany(Zahtjev);
Zahtjev.belongsTo(Korisnik);

Korisnik.hasMany(Ponuda);
Ponuda.belongsTo(Korisnik);

Nekretnina.hasMany(Upit);
Upit.belongsTo(Nekretnina);

Nekretnina.hasMany(Zahtjev);
Zahtjev.belongsTo(Nekretnina);

Nekretnina.hasMany(Ponuda);
Ponuda.belongsTo(Nekretnina);


module.exports = {
    Korisnik,
    Nekretnina,
    Upit,
    Zahtjev,
    Ponuda
}; 