const PoziviAjax = (() => {

    // fnCallback se u svim metodama poziva kada stigne
    // odgovor sa servera putem Ajax-a
    // svaki callback kao parametre ima error i data,
    // error je null ako je status 200 i data je tijelo odgovora
    // ako postoji greška, poruka se prosljeđuje u error parametru
    // callback-a, a data je tada null

    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    callback(null, xhr.responseText);
                } else {
                    try {
                        // Pokušaj parsirati JSON odgovor za grešku
                        const errorResponse = JSON.parse(xhr.responseText);
                        callback(errorResponse.greska || 'Greška pri komunikaciji sa serverom', null);
                    } catch (e) {
                        callback('Greška pri komunikaciji sa serverom', null);
                    }
                }
            }
        };
        xhr.send(data ? JSON.stringify(data) : null);
    }

    // vraća korisnika koji je trenutno prijavljen na sistem
    function impl_getKorisnik(fnCallback) {
        ajaxRequest('GET', '/korisnik', null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const korisnik = JSON.parse(data);
                    fnCallback(null, korisnik);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    // ažurira podatke loginovanog korisnika
    function impl_putKorisnik(noviPodaci, fnCallback) {
        // Check if user is authenticated
        if (!req.session.username) {
            // User is not logged in
            return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
        }

        // Get data from request body
        const { ime, prezime, username, password } = noviPodaci;

        // Read user data from the JSON file
        const users = readJsonFile('korisnici');

        // Find the user by username
        const loggedInUser = users.find((user) => user.username === req.session.username);

        if (!loggedInUser) {
            // User not found (should not happen if users are correctly managed)
            return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
        }

        // Update user data with the provided values
        if (ime) loggedInUser.ime = ime;
        if (prezime) loggedInUser.prezime = prezime;
        if (username) loggedInUser.adresa = adresa;
        if (password) loggedInUser.brojTelefona = brojTelefona;

        // Save the updated user data back to the JSON file
        saveJsonFile('korisnici', users);

        fnCallback(null, { poruka: 'Podaci su uspješno ažurirani' });
    }

    // dodaje novi upit za trenutno loginovanog korisnika
    function impl_postUpit(nekretninaId, podaci, fnCallback) {
        ajaxRequest('POST', `/nekretnina/${nekretninaId}/upit`, podaci, fnCallback);
    }

    function impl_getNekretnine(fnCallback) {
        ajaxRequest('GET', '/nekretnine', null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_postLogin(username, password, fnCallback) {
        var ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/login", true)
        ajax.setRequestHeader("Content-Type", "application/json")
        var objekat = {
            "username": username,
            "password": password
        }
        forSend = JSON.stringify(objekat)
        ajax.send(forSend)
    }

    function impl_postLogout(fnCallback) {
        let ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/logout", true)
        ajax.send()
    }

    function impl_getTop5Nekretnina(lokacija, fnCallback) {
        ajaxRequest('GET', `/nekretnine/top5?lokacija=${lokacija}`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_getMojiUpiti(fnCallback) {
        ajaxRequest('GET', '/upiti/moji', null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const upiti = JSON.parse(data);
                    fnCallback(null, upiti);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_getNekretnina(nekretnina_id, fnCallback) {
        ajaxRequest('GET', `/nekretnina/${nekretnina_id}`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnina = JSON.parse(data);
                    fnCallback(null, nekretnina);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_getNextUpiti(nekretnina_id, page, fnCallback) {
        ajaxRequest('GET', `/next/upiti/nekretnina/${nekretnina_id}?page=${page}`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const upiti = JSON.parse(data);
                    fnCallback(null, upiti);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_getInteresovanja(nekretninaId, fnCallback) {
        ajaxRequest('GET', `/nekretnina/${nekretninaId}/interesovanja`, null, fnCallback);
    }

    function impl_postPonuda(nekretninaId, ponuda, fnCallback) {
        ajaxRequest('POST', `/nekretnina/${nekretninaId}/ponuda`, ponuda, fnCallback);
    }

    function impl_postZahtjev(nekretninaId, zahtjev, fnCallback) {
        ajaxRequest('POST', `/nekretnina/${nekretninaId}/zahtjev`, zahtjev, fnCallback);
    }

    function impl_putZahtjev(nekretninaId, zahtjevId, odgovor, fnCallback) {
        ajaxRequest('PUT', `/nekretnina/${nekretninaId}/zahtjev/${zahtjevId}`, odgovor, fnCallback);
    }

    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getTop5Nekretnina: impl_getTop5Nekretnina,
        getMojiUpiti: impl_getMojiUpiti,
        getNekretnina: impl_getNekretnina,
        getNextUpiti: impl_getNextUpiti,
        getInteresovanja: impl_getInteresovanja,
        postPonuda: impl_postPonuda,
        postZahtjev: impl_postZahtjev,
        putZahtjev: impl_putZahtjev
    };
})();