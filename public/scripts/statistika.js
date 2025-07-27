const listaNekretnina = [{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2023.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 32000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2009.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2003.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},
{
    id: 2,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 3,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 4,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
}]

const listaKorisnika = [{
    id: 1,
    ime: "Neko",
    prezime: "Nekic",
    username: "username1",
},
{
    id: 2,
    ime: "Neko2",
    prezime: "Nekic2",
    username: "username2",
}]

let statistika = StatistikaNekretnina();
statistika.init(listaNekretnina, listaKorisnika);

function addPeriodInput() {
    const container = document.getElementById('periods-container');
    const div = document.createElement('div');
    div.innerHTML = `
      <input type="number" class="period-od" placeholder="Od godine">
      <input type="number" class="period-do" placeholder="Do godine">
      <button class="remove-period">Ukloni</button>
    `;
    container.appendChild(div);
    div.querySelector('.remove-period').addEventListener('click', function() {
      container.removeChild(div);
    });
}

function addPriceRangeInput() {
    const container = document.getElementById('price-ranges-container');
    const div = document.createElement('div');
    div.innerHTML = `
      <input type="number" class="price-od" placeholder="Od cijene">
      <input type="number" class="price-do" placeholder="Do cijene">
      <button class="remove-price-range">Ukloni</button>
    `;
    container.appendChild(div);
    div.querySelector('.remove-price-range').addEventListener('click', function() {
      container.removeChild(div);
    });
}

function drawHistogram() {
    const periodOds = document.querySelectorAll('.period-od');
    const periodDos = document.querySelectorAll('.period-do');
    const periods = [];
    periodOds.forEach((odInput, index) => {
        const doInput = periodDos[index];
        const od = parseFloat(odInput.value);
        const doYear = parseFloat(doInput.value);
        if (!isNaN(od) && !isNaN(doYear) && od <= doYear) {
            periods.push({ od, do: doYear });
        }
    });

    const priceOds = document.querySelectorAll('.price-od');
    const priceDos = document.querySelectorAll('.price-do');
    const priceRanges = [];
    priceOds.forEach((odInput, index) => {
        const doInput = priceDos[index];
        const od = parseFloat(odInput.value);
        const doPrice = parseFloat(doInput.value);
        if (!isNaN(od) && !isNaN(doPrice) && od <= doPrice) {
            priceRanges.push({ od, do: doPrice });
        }
    });

    if (periods.length === 0 || priceRanges.length === 0) {
        alert('Molimo unesite validne periode i cijene.');
        return;
    }

    const histogramData = statistika.histogramCijena(periods, priceRanges);

    const chartsContainer = document.getElementById('charts-container');
    chartsContainer.innerHTML = '';

    const priceRangeLabels = priceRanges.map(range => `${range.od} - ${range.do}`);
    const periodDataMap = {};

    histogramData.forEach(item => {
        if (!periodDataMap[item.indeksPerioda]) {
            periodDataMap[item.indeksPerioda] = {};
        }
        periodDataMap[item.indeksPerioda][item.indeksRasporedaCijena] = item.brojNekretnina;
    });

    Object.keys(periodDataMap).forEach(periodIndex => {
        const period = periods[periodIndex];
        const data = [];
        priceRanges.forEach((_, rangeIndex) => {
            data.push(periodDataMap[periodIndex][rangeIndex] || 0);
        });

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 200;
        chartsContainer.appendChild(canvas);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: priceRangeLabels,
                datasets: [{
                    label: `Period: ${period.od} - ${period.do}`,
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    });
}

document.getElementById('add-period').addEventListener('click', addPeriodInput);
document.getElementById('add-price-range').addEventListener('click', addPriceRangeInput);
document.getElementById('draw-histogram').addEventListener('click', drawHistogram);
