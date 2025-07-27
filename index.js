const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');
const { Nekretnina, Korisnik, Ponuda, Zahtjev, Upit } = require('./models');

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}

let loginAttempts = {}; 
let upitAttempts = {}; 


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const korisnik = await Korisnik.findOne({ where: { username } });
    
    if (!korisnik || !(await bcrypt.compare(password, korisnik.password))) {
      return res.json({ poruka: "Neuspješna prijava" });
    }

    req.session.username = username;
    res.json({ poruka: "Uspješna prijava" });

  } catch (error) {
    console.error('Greška pri prijavi:', error);
    res.status(500).json({ greska: 'Greška na serveru' });
  }
});

function logAttempt(username, status) {
  const logMessage = `[${new Date().toISOString()}] - username: "${username}" - status: "${status}"\n`;
  fs.appendFile('prijave.txt', logMessage, (err) => {
    if (err) console.error('Greška pri logovanju:', err);
  });
}


/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ greska: 'Internal Server Error' });
    } else {
      res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
    }
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get('/korisnik', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Niste prijavljeni" });
  }

  try {
    const korisnik = await Korisnik.findOne({ 
      where: { username: req.session.username },
      attributes: { exclude: ['password'] } // Ne šaljemo password
    });
    
    if (!korisnik) {
      return res.status(404).json({ greska: "Korisnik nije pronađen" });
    }

    res.json(korisnik);
  } catch (error) {
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Allows logged user to make a request for a property
*/
app.post('/upit', async (req, res) => {
  const { id_nekretnine, tekst_upita } = req.body;

  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  try {
    const korisnici = await readJsonFile('korisnici');
    const trenutniKorisnik = korisnici.find(k => k.username === req.session.username);

    if (!trenutniKorisnik) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    const userKey = `${trenutniKorisnik.id}-${id_nekretnine}`;
    if (!upitAttempts[userKey]) {
      upitAttempts[userKey] = 0;
    }

    if (upitAttempts[userKey] >= 3) {
      return res.status(429).json({ greska: "Previše upita za istu nekretninu." });
    }

    const nekretnine = await readJsonFile('nekretnine');
    const nekretnina = nekretnine.find(n => n.id === parseInt(id_nekretnine));

    if (!nekretnina) {
      return res.status(404).json({ greska: "Nekretnina nije pronađena" });
    }

    nekretnina.upiti.push({
      korisnik_id: trenutniKorisnik.id,
      tekst_upita: tekst_upita
    });

    await saveJsonFile('nekretnine', nekretnine);
    upitAttempts[userKey]++;

    res.status(200).json({ poruka: "Upit uspješno poslan" });
  } catch (error) {
    console.error('Error processing inquiry:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const loggedInUser = users.find((user) => user.username === req.session.username);

    if (!loggedInUser) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Update user data with the provided values
    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }

    // Save the updated user data back to the JSON file
    await saveJsonFile('korisnici', users);
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll();
    res.json(nekretnine);
  } catch (error) {
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/nekretnine/top5', async (req, res) => {
    try {
        const { lokacija } = req.query;
        const nekretnine = await Nekretnina.findAll({
            where: lokacija ? { lokacija } : {},
            limit: 5,
            order: [['id', 'DESC']] 
        });
        res.json(nekretnine);
    } catch (error) {
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

app.get('/upiti/moji', async (req, res) => {
  if (!req.session.username) {
      return res.status(401).json({ greska: "Niste prijavljeni" });
  }

  try {
      const korisnik = await Korisnik.findOne({ 
          where: { username: req.session.username },
          include: {
              model: Upit,
              include: [{
                  model: Nekretnina,
                  attributes: ['id', 'naziv', 'cijena', 'lokacija', 'kvadratura']
              }]
          }
      });
      
      if (!korisnik) {
          return res.status(404).json({ greska: "Korisnik nije pronađen" });
      }

      // Formatiraj odgovor
      const formattedUpiti = korisnik.Upits.map(upit => ({
          id: upit.id,
          tekst_upita: upit.tekst,
          id_nekretnine: upit.Nekretnina.id,
          nekretnina: {
              naziv: upit.Nekretnina.naziv,
              cijena: upit.Nekretnina.cijena,
              lokacija: upit.Nekretnina.lokacija,
              kvadratura: upit.Nekretnina.kvadratura
          }
      }));

      res.json(formattedUpiti);
  } catch (error) {
      console.error(error);
      res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnina/:id', async (req, res) => {
  try {
      const nekretnina = await Nekretnina.findByPk(req.params.id, {
          include: [Upit, Zahtjev, Ponuda] 
      });
      if (!nekretnina) {
          return res.status(404).json({ greska: "Nekretnina nije pronađena" });
      }
      res.json(nekretnina);
  } catch (error) {
      res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/next/upiti/nekretnina/:id', async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 0;

  try {
      const nekretnineData = await readJsonFile('nekretnine');
      const nekretnina = nekretnineData.find(nek => nek.id === parseInt(id, 10));

      if (!nekretnina) {
          return res.status(404).json([]);
      }

      const reversedUpiti = [...nekretnina.upiti].reverse();
      
      const startIndex = page * 3;
      const endIndex = startIndex + 3;

      const upitiSegment = reversedUpiti.slice(startIndex, endIndex);

      const formattedUpiti = upitiSegment.map(upit => ({
          korisnik_id: upit.korisnik_id,
          tekst_upita: upit.tekst_upita
      }));

      res.status(200).json(formattedUpiti);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/mojiUpiti.html', async (req, res) => {
    await serveHTMLFile(req, res, 'mojiUpiti.html');
});

app.get('/', (req, res) => {
  res.redirect('/nekretnine.html'); 
});


app.get('/nekretnina/:id/interesovanja', async (req, res) => {
  try {
      console.log('Pristup ruti /nekretnina/:id/interesovanja');
      const { id } = req.params;
      console.log('ID nekretnine:', id);

      const nekretnina = await Nekretnina.findByPk(id, {
          include: [
              { model: Upit, include: [Korisnik] },
              { model: Zahtjev, include: [Korisnik] },
              { 
                  model: Ponuda, 
                  include: [Korisnik],
                  include: [{
                      model: Ponuda,
                      as: 'VezanePonude',
                      include: [Korisnik]
                  }]
              }
          ]
      });

      console.log('Nekretnina pronađena:', nekretnina ? 'Da' : 'Ne');
      if (!nekretnina) {
          return res.status(404).json({ greska: "Nekretnina nije pronađena" });
      }

      const isAdmin = req.session.username === 'admin';
      console.log('Je li admin:', isAdmin);

      const currentUser = await Korisnik.findOne({ 
          where: { username: req.session.username } 
      });
      console.log('Trenutni korisnik:', currentUser ? currentUser.username : 'Neprijavljen');

      const interesovanja = [
          ...nekretnina.Upits,
          ...nekretnina.Zahtjevs,
          ...nekretnina.Ponudas
      ].map(item => {
          const jsonItem = item.toJSON();
          console.log('Obrada interesovanja:', jsonItem);

          if (item instanceof Ponuda) {
              const canSeePrice = isAdmin || 
                                (currentUser && (
                                    currentUser.id === item.KorisnikId || 
                                    (item.vezanaPonudaId && currentUser.id === item.VezanaPonuda?.KorisnikId)
                                ));

              if (!canSeePrice) {
                  delete jsonItem.cijenaPonude;
              }
          }

          return {
              ...jsonItem,
              tip: item.constructor.name
          };
      });

      console.log('Interesovanja pripremljena za slanje:', interesovanja);
      res.json(interesovanja);
  } catch (error) {
      console.error('Greška:', error);
      res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.post('/nekretnina/:id/ponuda', async (req, res) => {
    try {
        const { id } = req.params;
        const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } = req.body;
        
        if (!req.session.username) {
            return res.status(401).json({ greska: "Niste prijavljeni" });
        }

        const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });
        const nekretnina = await Nekretnina.findByPk(id);
        
        if (!nekretnina) {
            return res.status(404).json({ greska: "Nekretnina nije pronađena" });
        }

        if (idVezanePonude) {
            const vezanaPonuda = await Ponuda.findByPk(idVezanePonude);
            if (!vezanaPonuda) {
                return res.status(404).json({ greska: "Vezana ponuda nije pronađena" });
            }

            const vezanePonude = await vezanaPonuda.getVezanePonude();
            if (vezanePonude.some(p => p.odbijenaPonuda)) {
                return res.status(400).json({ greska: "Ne možete dodati ponudu jer postoji odbijena ponuda u nizu" });
            }
        }

        const novaPonuda = await Ponuda.create({
            tekst,
            cijenaPonude: ponudaCijene,
            datumPonude,
            odbijenaPonuda,
            vezanaPonudaId: idVezanePonude,
            KorisnikId: korisnik.id,
            NekretnineId: nekretnina.id
        });

        res.status(201).json(novaPonuda);
    } catch (error) {
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

app.post('/nekretnina/:id/zahtjev', async (req, res) => {
    try {
        const { id } = req.params;
        const { tekst, trazeniDatum } = req.body;
        
        if (!req.session.username) {
            return res.status(401).json({ greska: "Niste prijavljeni" });
        }

        const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });
        const nekretnina = await Nekretnina.findByPk(id);
        
        if (!nekretnina) {
            return res.status(404).json({ greska: "Nekretnina nije pronađena" });
        }

        if (new Date(trazeniDatum) < new Date()) {
            return res.status(400).json({ greska: "Datum ne može biti u prošlosti" });
        }

        const noviZahtjev = await Zahtjev.create({
            tekst,
            trazeniDatum,
            KorisnikId: korisnik.id,
            NekretnineId: nekretnina.id
        });

        res.status(201).json(noviZahtjev);
    } catch (error) {
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});


app.put('/nekretnina/:id/zahtjev/:zid', async (req, res) => {
  try {
      const korisnik = await Korisnik.findOne({ 
          where: { username: req.session.username } 
      });
      
      if (!korisnik?.admin) {
          return res.status(403).json({ greska: "Samo admin može odgovoriti na zahtjev" });
      }

      const { id, zid } = req.params;
      const { odobren, addToTekst } = req.body;

      const zahtjev = await Zahtjev.findOne({
          where: {
              id: zid,
              NekretnineId: id
          }
      });

      if (!zahtjev) {
          return res.status(404).json({ greska: "Zahtjev nije pronađen" });
      }

      if (!odobren && !addToTekst) {
          return res.status(400).json({ greska: "Tekst odgovora je obavezan kada se zahtjev odbija" });
      }

      zahtjev.odobren = odobren;
      if (addToTekst) {
          zahtjev.tekst = zahtjev.tekst + " ODGOVOR ADMINA: " + addToTekst;
      }
      await zahtjev.save();

      res.json(zahtjev);
  } catch (error) {
      res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.post('/nekretnina/:id/upit', async (req, res) => {
    try {
        const { id } = req.params;
        const { tekst } = req.body;
        
        if (!req.session.username) {
            return res.status(401).json({ greska: "Niste prijavljeni" });
        }

        const korisnik = await Korisnik.findOne({ where: { username: req.session.username } });
        const nekretnina = await Nekretnina.findByPk(id);
        
        if (!nekretnina) {
            return res.status(404).json({ greska: "Nekretnina nije pronađena" });
        }

        const noviUpit = await Upit.create({
            tekst,
            KorisnikId: korisnik.id,
            NekretnineId: nekretnina.id
        });

        res.status(201).json(noviUpit);
    } catch (error) {
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
