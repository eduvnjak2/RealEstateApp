let StatistikaNekretnina = function() {
    let listaNekretnina = [];
    let listaKorisnika = [];

    let spisak=SpisakNekretnina(); 
    let init = function (nekretnine, korisnici) {
        listaNekretnina = nekretnine;
        listaKorisnika = korisnici;

        spisak.init(listaNekretnina, listaKorisnika);
    };

    let prosjecnaKvadratura = function(kriterij) {
        let filtriraneNekretnine = spisak.filtrirajNekretnine({kriterij: kriterij});
        if (filtriraneNekretnine.length === 0) return 0;
        let suma = filtriraneNekretnine.reduce((acc, nek) => acc + nek.kvadratura, 0);
        return suma / filtriraneNekretnine.length;
    };

    let outlier = function(kriterij, nazivSvojstva) {
        let filtriraneNekretnine = spisak.filtrirajNekretnine(kriterij);
        if (filtriraneNekretnine.length === 0) return null;

        let mean = filtriraneNekretnine.reduce((acc, nek) => acc + nek[nazivSvojstva], 0) / filtriraneNekretnine.length;
        let outlier = filtriraneNekretnine.reduce((acc, nek) => {
            let absDev = Math.abs(nek[nazivSvojstva] - mean);
            if (acc === null || absDev > Math.abs(acc[nazivSvojstva] - mean)) {
                return nek;
            }
            return acc;
        }, null);
        return outlier;
    };

    let mojeNekretnine = function(korisnik) {
        let user = spisak.listaKorisnika.find(k => k.id === korisnik.id);
        if (!user) return [];

        let estatesWithInquiries = spisak.listaNekretnina.filter(nek => 
            nek.upiti.some(upit => upit.korisnik_id === user.id)
        );

        let sortedEstates = estatesWithInquiries.sort((a, b) => 
            b.upiti.length - a.upiti.length
        );

        return sortedEstates;
    };

    let histogramCijena = function (periodi, rasponiCijena) {
        let histogram = [];
        
        // Inicijalizacija histogram objekata
        for (let i = 0; i < periodi.length; i++) {
            for (let j = 0; j < rasponiCijena.length; j++) {
                histogram.push({
                    indeksPerioda: i,
                    indeksRasporedaCijena: j,
                    brojNekretnina: 0
                });
            }
        }

        // Iteracija kroz sve nekretnine
        spisak.listaNekretnina.forEach(nek => {
            let objaveGodina = parseInt(nek.datum_objave.split('.')[2]);
            let periodIndex = -1;

            // Određivanje perioda
            for (let i = 0; i < periodi.length; i++) {
                if (objaveGodina >= periodi[i].od && objaveGodina <= periodi[i].do) {
                    periodIndex = i;
                    break;
                }
            }

            if (periodIndex === -1) return;

            let cijena = nek.cijena;
            let cijenaIndex = -1;

            // Određivanje cijene
            for (let j = 0; j < rasponiCijena.length; j++) {
                if (cijena >= rasponiCijena[j].od && cijena <= rasponiCijena[j].do) {
                    cijenaIndex = j;
                    break;
                }
            }

            if (cijenaIndex === -1) return;

            // Ažuriranje broja nekretnina u histogramu
            histogram.find(h => 
                h.indeksPerioda === periodIndex && 
                h.indeksRasporedaCijena === cijenaIndex
            ).brojNekretnina++;
        });

        // Sortiranje histograma
        histogram.sort((a, b) => 
            a.indeksPerioda - b.indeksPerioda || a.indeksRasporedaCijena - b.indeksRasporedaCijena
        );

        return histogram;
    };
    
  
    return {
        init: init,
        prosjecnaKvadratura: prosjecnaKvadratura,
        outlier: outlier,
        mojeNekretnine: mojeNekretnine,
        histogramCijena: histogramCijena
    }; 
}; 
