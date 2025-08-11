function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
    const filtriraneNekretnine = instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });
    divReferenca.innerHTML = '';

    if (filtriraneNekretnine.length === 0) {
        divReferenca.innerHTML = '<p>Trenutno nema dostupnih nekretnina ovoga tipa.</p>';
    } else {
        filtriraneNekretnine.forEach(nekretnina => {
            const nekretninaElement = document.createElement('div');
            nekretninaElement.classList.add('nekretnina');
            nekretninaElement.setAttribute('data-tip', nekretnina.tip_nekretnine);
            
            if (tip_nekretnine) {
                if (tip_nekretnine === "Stan") {
                    nekretninaElement.classList.add('stan');
                    nekretninaElement.id = `${nekretnina.id}`;
                } else if (tip_nekretnine === "Kuća") {
                    nekretninaElement.classList.add('kuca');
                    nekretninaElement.id = `${nekretnina.id}`;
                } else {
                    nekretninaElement.classList.add('pp');
                    nekretninaElement.id = `${nekretnina.id}`;
                }
            }

            const pretrageDiv = document.createElement('div');
            pretrageDiv.id = `pretrage-${nekretnina.id}`;
            pretrageDiv.textContent = `pretrage: ${nekretnina.pretrage || 0}`;
            nekretninaElement.appendChild(pretrageDiv);

            const klikoviDiv = document.createElement('div');
            klikoviDiv.id = `klikovi-${nekretnina.id}`;
            klikoviDiv.textContent = `klikovi: ${nekretnina.klikovi || 0}`;
            nekretninaElement.appendChild(klikoviDiv);

            const slikaElement = document.createElement('img');
            slikaElement.classList.add('slika-nekretnine');
            slikaElement.src = `../resources/${nekretnina.id}.jpg`;
            slikaElement.alt = nekretnina.naziv;
            nekretninaElement.appendChild(slikaElement);

            const detaljiElement = document.createElement('div');
            detaljiElement.classList.add('detalji-nekretnine');
            detaljiElement.innerHTML = `
                <h3>${nekretnina.naziv}</h3>
                <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
            `;
            nekretninaElement.appendChild(detaljiElement);

            const cijenaElement = document.createElement('div');
            cijenaElement.classList.add('cijena-nekretnine');
            cijenaElement.innerHTML = `<p>Cijena: ${nekretnina.cijena} BAM</p>`;
            nekretninaElement.appendChild(cijenaElement);

            const detaljiDugme = document.createElement('a');
            detaljiDugme.href = `../html/detalji.html?id=${nekretnina.id}`;
            detaljiDugme.classList.add('detalji-dugme');
            detaljiDugme.textContent = 'Detalji';
            detaljiDugme.addEventListener('click', function () {
                const idNekretnine = nekretnina.id;
                MarketingAjax.klikNekretnina(idNekretnine);
            });
            nekretninaElement.appendChild(detaljiDugme);
            divReferenca.appendChild(nekretninaElement);
        });
    }
}

const listaNekretnina = []

const listaKorisnika = []

const divStan = document.getElementById("stan");
const divKuca = document.getElementById("kuca");
const divPp = document.getElementById("pp");

let nekretnine = SpisakNekretnina();

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const lokacija = urlParams.get('lokacija');

    if (lokacija) {
        PoziviAjax.getTop5Nekretnina(lokacija, function(err, nekretnine) {
            if (err) {
                console.error("Greška prilikom dohvatanja top 5 nekretnina:", err);
                return;
            }

            document.getElementById("divNekretnine").innerHTML = `
                <h2>Top 5 nekretnina - ${lokacija}</h2>
                <div class="grid-lista-nekretnina" id="top5"></div>
            `;

            const top5Modul = SpisakNekretnina();
            top5Modul.init(nekretnine, []);
            const divTop5 = document.getElementById("top5");
            spojiNekretnine(divTop5, top5Modul);
        });
    } else {
        PoziviAjax.getNekretnine((error, listaNekretnina) => {
            if (error) {
                console.error("Greška prilikom dohvatanja nekretnina sa servera:", error);
            } else {
                nekretnine.init(listaNekretnina, listaKorisnika);
                spojiNekretnine(divStan, nekretnine, "Stan");
                spojiNekretnine(divKuca, nekretnine, "Kuća");
                spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
            }
        });
    }
});

function filtrirajNekretnine(filtriraneNekretnine) {
    const filtriraneNekretnineInstance = SpisakNekretnina();
    filtriraneNekretnineInstance.init(filtriraneNekretnine, listaKorisnika);

    spojiNekretnine(divStan, filtriraneNekretnineInstance, "Stan");
    spojiNekretnine(divKuca, filtriraneNekretnineInstance, "Kuća");
    spojiNekretnine(divPp, filtriraneNekretnineInstance, "Poslovni prostor");
}

function filtrirajOnClick() {
    const kriterij = {
        min_cijena: parseFloat(document.getElementById('minCijena').value) || 0,
        max_cijena: parseFloat(document.getElementById('maxCijena').value) || Infinity,
        min_kvadratura: parseFloat(document.getElementById('minKvadratura').value) || 0,
        max_kvadratura: parseFloat(document.getElementById('maxKvadratura').value) || Infinity
    };

    const filtriraneNekretnine = nekretnine.filtrirajNekretnine(kriterij);

    MarketingAjax.novoFiltriranje(
        filtriraneNekretnine.map(nekretnina => nekretnina.id)
    );

    filtrirajNekretnine(filtriraneNekretnine);
}

document.getElementById('dugmePretraga').addEventListener('click', filtrirajOnClick);

setInterval(() => {
    MarketingAjax.osvjeziPretrage(document.getElementById('divNekretnine'));
    MarketingAjax.osvjeziKlikove(document.getElementById('divNekretnine'));
}, 500);