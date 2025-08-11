document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const nekretninaId = urlParams.get('id');

    if (!nekretninaId) {
        document.body.innerHTML = '<h1>Nema ID nekretnine</h1>';
        return;
    }

    PoziviAjax.getNekretnina(nekretninaId, function(err, nekretnina) {
        if (err) {
            console.error(err);
            return;
        }
        prikaziDetaljeNekretnine(nekretnina);
    });

    const glavniElement = document.querySelector("#upiti");
    const carousel = postaviCarousel(glavniElement, []);

    if (carousel) {
        const prevBtn = document.querySelector(".prev-btn");
        const nextBtn = document.querySelector(".next-btn");

        prevBtn.addEventListener("click", carousel.fnLijevo);
        nextBtn.addEventListener("click", carousel.fnDesno);
    }

    prikaziFormuZaInteresovanje();
    
    // Učitaj i prikaži interesovanja
    PoziviAjax.getInteresovanja(nekretninaId, function(err, interesovanja) {
        if (err) {
            console.error('Greška pri učitavanju interesovanja:', err);
            return;
        }
        prikaziInteresovanja(interesovanja);
    });
});

let trenutnaStranica = 0;
let sviUpitiUcitani = false;
let trenutniUpiti = [];
let trenutniIndex = 0;

function prikaziDetaljeNekretnine(nekretnina) {
    trenutnaStranica = 0;
    sviUpitiUcitani = false;
    trenutniIndex = 0;

    document.getElementById('slikaNekretnine').src = `../resources/${nekretnina.id}.jpg`;
    document.getElementById('nazivNekretnine').textContent = nekretnina.naziv;
    document.getElementById('kvadraturaNekretnine').textContent = nekretnina.kvadratura;
    document.getElementById('cijenaNekretnine').textContent = nekretnina.cijena;

    document.getElementById('tipGrijanja').textContent = nekretnina.tip_grijanja;
    
    const lokacijaLink = document.getElementById('lokacijaLink');
    lokacijaLink.textContent = nekretnina.lokacija;
    lokacijaLink.onclick = function(e) {
        e.preventDefault();
        prikaziTop5Nekretnine(nekretnina.lokacija);
    };

    document.getElementById('godinaIzgradnje').textContent = nekretnina.godina_izgradnje;
    document.getElementById('datumObjave').textContent = nekretnina.datum_objave;
    document.getElementById('opisNekretnine').textContent = nekretnina.opis;

    trenutniUpiti = nekretnina.upiti.slice(0, 3).reverse();
    prikaziUpiteUCarouselu(nekretnina.id, true);
}

function prikaziUpiteUCarouselu(nekretnina_id, inicijalnoUcitavanje = false) {
    const upitiContainer = document.getElementById('upiti');
    
    if (inicijalnoUcitavanje) {
        upitiContainer.innerHTML = '';
        trenutniIndex = 0;
    }

    if (!inicijalnoUcitavanje) {
        const postojeciUpiti = document.querySelectorAll('.upit').length;
        const noviUpiti = trenutniUpiti.slice(postojeciUpiti);
        
        noviUpiti.forEach(upit => {
            const upitElement = document.createElement('div');
            upitElement.className = 'upit';
            upitElement.style.display = 'none';
            upitElement.innerHTML = `
                <p><strong>${upit.korisnik_id}:</strong></p>
                <p>${upit.tekst_upita}</p>
            `;
            upitiContainer.appendChild(upitElement);
        });
    } else {
        trenutniUpiti.forEach((upit, index) => {
            const upitElement = document.createElement('div');
            upitElement.className = 'upit';
            upitElement.style.display = index === 0 ? 'block' : 'none';
            upitElement.innerHTML = `
                <p><strong>${upit.korisnik_id}:</strong></p>
                <p>${upit.tekst_upita}</p>
            `;
            upitiContainer.appendChild(upitElement);
        });
    }

    const upiti = document.querySelectorAll('.upit');
    
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    prevBtn.onclick = function() {
        upiti[trenutniIndex].style.display = 'none';
        trenutniIndex = (trenutniIndex - 1 + upiti.length) % upiti.length;
        upiti[trenutniIndex].style.display = 'block';
    };

    nextBtn.onclick = function() {
        upiti[trenutniIndex].style.display = 'none';
        trenutniIndex = (trenutniIndex + 1) % upiti.length;
        upiti[trenutniIndex].style.display = 'block';

        if ((trenutniIndex + 1) % 3 === 0 && !sviUpitiUcitani) {
            ucitajSljedeceUpite(nekretnina_id);
        }
    };
}

function ucitajSljedeceUpite(nekretnina_id) {
    trenutnaStranica++;
    PoziviAjax.getNextUpiti(nekretnina_id, trenutnaStranica, function(err, noviUpiti) {
        if (err) {
            console.error('Greška pri učitavanju upita:', err);
            return;
        }

        if (!noviUpiti || noviUpiti.length === 0) {
            sviUpitiUcitani = true;
            return;
        }

        trenutniUpiti = [...trenutniUpiti, ...noviUpiti];
        prikaziUpiteUCarouselu(nekretnina_id, false);
    });
}

function prikaziTop5Nekretnine(lokacija) {
    window.location.href = `nekretnine.html?lokacija=${encodeURIComponent(lokacija)}`;
}

function prikaziFormuZaInteresovanje() {
    // Prvo provjeri da li je korisnik prijavljen
    PoziviAjax.getKorisnik(function(err, korisnik) {
        if (err || !korisnik) {
            console.log('Korisnik nije prijavljen');
            return; // Ne prikazuj formu ako korisnik nije prijavljen
        }

        const formaContainer = document.createElement('div');
        formaContainer.innerHTML = `
            <h3>Novo interesovanje</h3>
            <select id="tipInteresovanja">
                <option value="upit">Upit</option>
                <option value="zahtjev">Zahtjev</option>
                <option value="ponuda">Ponuda</option>
            </select>
            <div id="formaPolja"></div>
        `;

        document.body.appendChild(formaContainer);

        document.getElementById('tipInteresovanja').addEventListener('change', function(e) {
            prikaziPoljaForme(e.target.value);
        });

        // Inicijalno prikaži polja za upit
        prikaziPoljaForme('upit');
    });
}

function prikaziPoljaForme(tip) {
    const formaPolja = document.getElementById('formaPolja');
    const nekretninaId = new URLSearchParams(window.location.search).get('id');

    switch(tip) {
        case 'upit':
            formaPolja.innerHTML = `
                <textarea id="tekstUpita" placeholder="Unesite tekst upita"></textarea>
                <button onclick="posaljiUpit()">Pošalji upit</button>
            `;
            break;
        case 'zahtjev':
            formaPolja.innerHTML = `
                <textarea id="tekstZahtjeva" placeholder="Unesite tekst zahtjeva"></textarea>
                <input type="date" id="trazeniDatum">
                <button onclick="posaljiZahtjev()">Pošalji zahtjev</button>
            `;
            break;
            case 'ponuda':
                PoziviAjax.getKorisnik(function(err, korisnik) {
                    if (err || !korisnik) {
                        console.error('Greška pri dohvatanju korisnika:', err);
                        return;
                    }
            
                    PoziviAjax.getInteresovanja(nekretninaId, function(err, interesovanja) {
                        if (err) {
                            console.error('Greška pri dohvatanju interesovanja:', err);
                            return;
                        }
            
                        // Konvertuj string u JSON ako je potrebno
                        const data = typeof interesovanja === 'string' ? 
                                    JSON.parse(interesovanja) : 
                                    interesovanja;
            
                        // Filtriraj samo ponude i aktivne ponude
                        let ponude = data.filter(i => 
                            i.tip === 'Ponuda' && 
                            !i.odbijenaPonuda
                        );
            
                        // Za obične korisnike - samo njihove ponude
                        if (!korisnik.admin) {
                            ponude = ponude.filter(p => 
                                p.Korisnik && 
                                p.Korisnik.id === korisnik.id
                            );
                        }
            
                        // Kreiraj dropdown
                        let dropdownHTML = '<select id="vezanaPonuda"';
                        dropdownHTML += ' class="form-control mb-2">';
                        dropdownHTML += '<option value="">Nova ponuda</option>';
                        
                        ponude.forEach(p => {
                            const cijena = p.cijenaPonude ? 
                                         `${p.cijenaPonude} KM` : 
                                         '---';
                            dropdownHTML += `
                                <option value="${p.id}">
                                    Ponuda #${p.id} (${cijena})
                                </option>
                            `;
                        });
                        
                        dropdownHTML += '</select>';
            
                        // Prikazi formu
                        formaPolja.innerHTML = `
                            <div class="form-group">
                                <textarea id="tekstPonude" 
                                    class="form-control mb-2"
                                    placeholder="Tekst ponude"
                                    required></textarea>
                                <input type="number" 
                                    id="cijenaPonude"
                                    class="form-control mb-2" 
                                    placeholder="Cijena u KM"
                                    step="0.01"
                                    required>
                                <label>Vezana ponuda:</label>
                                ${dropdownHTML}
                                <button class="btn btn-primary mt-2" 
                                    onclick="posaljiPonudu()">
                                    Pošalji ponudu
                                </button>
                            </div>
                        `;
            
                        // Disable-uj dropdown ako nema ponuda za običnog korisnika
                        if (!korisnik.admin && ponude.length === 0) {
                            document.getElementById('vezanaPonuda').disabled = true;
                        }
                    });
                });
                break;
    }
}

function posaljiUpit() {
    const tekst = document.getElementById('tekstUpita').value;
    const nekretninaId = new URLSearchParams(window.location.search).get('id');

    if (!tekst) {
        alert('Morate unijeti tekst upita');
        return;
    }

    PoziviAjax.postUpit(nekretninaId, { tekst }, function(err, response) {
        if (err) {
            alert('Greška pri slanju upita: ' + err);
            return;
        }
        alert('Upit je uspješno poslan');
        location.reload();
    });
}

function posaljiZahtjev() {
    const tekst = document.getElementById('tekstZahtjeva').value;
    const trazeniDatum = document.getElementById('trazeniDatum').value;
    const nekretninaId = new URLSearchParams(window.location.search).get('id');

    if (!trazeniDatum) {
        alert('Morate odabrati datum');
        return;
    }

    PoziviAjax.postZahtjev(nekretninaId, { 
        tekst, 
        trazeniDatum 
    }, function(err, response) {
        if (err) {
            alert('Greška pri slanju zahtjeva: ' + err);
            return;
        }
        alert('Zahtjev je uspješno poslan');
        location.reload();
    });
}

function posaljiPonudu() {
    const tekst = document.getElementById('tekstPonude').value;
    const cijenaPonude = document.getElementById('cijenaPonude').value;
    const vezanaPonudaSelect = document.getElementById('vezanaPonuda');
    const idVezanePonude = vezanaPonudaSelect.value || null;
    const nekretninaId = new URLSearchParams(window.location.search).get('id');

    if (!cijenaPonude) {
        alert('Morate unijeti cijenu');
        return;
    }

    PoziviAjax.postPonuda(nekretninaId, {
        tekst,
        ponudaCijene: parseFloat(cijenaPonude),
        datumPonude: new Date(),
        idVezanePonude,
        odbijenaPonuda: false
    }, function(err, response) {
        if (err) {
            alert('Greška pri slanju ponude: ' + err);
            return;
        }
        alert('Ponuda je uspješno poslana');
        location.reload();
    });
}

function prikaziInteresovanja(interesovanja) {
    try {
        const data = typeof interesovanja === 'string' ? JSON.parse(interesovanja) : interesovanja;
        const container = document.querySelector("#upiti");
        
        // Kreirajmo HTML za svako interesovanje
        const interesovanjaHTML = data.map(item => {
            const div = document.createElement('div');
            div.className = 'upit';
            
            let html = `<p><strong>ID: ${item.id}</strong></p>`;
            html += `<p>Tekst: ${item.tekst}</p>`;

            if (item.trazeniDatum) { // Zahtjev
                html += `<p>Datum: ${new Date(item.trazeniDatum).toLocaleDateString()}</p>`;
                html += `<p>Status: ${item.odobren ? 'Odobren' : 'Na čekanju'}</p>`;
            } else if (item.cijenaPonude !== undefined) { // Ponuda
                if (item.cijenaPonude) {
                    html += `<p>Cijena: ${item.cijenaPonude} KM</p>`;
                }
                html += `<p>Status: ${item.odbijenaPonuda ? 'Odbijena' : 'Aktivna'}</p>`;
            }

            div.innerHTML = html;
            return div;
        });

        // Očistimo container i postavimo carousel
        container.innerHTML = '';
        const carousel = postaviCarousel(container, interesovanjaHTML);

        // Dodajmo event listenere za navigaciju
        if (carousel) {
            const prevBtn = document.querySelector(".prev-btn");
            const nextBtn = document.querySelector(".next-btn");

            prevBtn.addEventListener("click", carousel.fnLijevo);
            nextBtn.addEventListener("click", carousel.fnDesno);
        }
    } catch (error) {
        console.error('Greška pri prikazivanju interesovanja:', error);
    }
}
