function prikaziUpite(upiti) {
    const container = document.getElementById('upiti-container');
    container.innerHTML = '';

    if (!upiti || upiti.length === 0) {
        container.innerHTML = '<div class="no-inquiries"><h3>Nemate nijedan upit</h3><p>Još niste poslali nijedan upit za nekretnine.</p></div>';
        return;
    }

    // Grupiraj upite po nekretninama
    const upitiPoNekretninama = upiti.reduce((acc, upit) => {
        const nekretninaId = upit.id_nekretnine || (upit.Nekretnina ? upit.Nekretnina.id : null);
        if (!nekretninaId) return acc;

        if (!acc[nekretninaId]) {
            acc[nekretninaId] = {
                nekretnina: upit.nekretnina || upit.Nekretnina || {},
                upiti: []
            };
        }
        acc[nekretninaId].upiti.push(upit);
        return acc;
    }, {});

    // Prikazi svaku nekretninu sa upitima
    Object.values(upitiPoNekretninama).forEach(nekretninaGrupa => {
        const karticaDiv = document.createElement('div');
        karticaDiv.className = 'inquiry-item';
        
        const slikaSrc = (nekretninaGrupa.nekretnina.slika) ? nekretninaGrupa.nekretnina.slika : '../resources/1.jpg';

        karticaDiv.innerHTML = `
            <div class="property-info">
                <img src="${slikaSrc}" alt="Nekretnina" class="property-image">
                <div class="property-details">
                    <h3>${nekretninaGrupa.nekretnina.naziv || ''}</h3>
                    <p>Cijena: ${nekretninaGrupa.nekretnina.cijena || ''} KM</p>
                    <p>Lokacija: ${nekretninaGrupa.nekretnina.lokacija || ''}</p>
                    <p>Kvadratura: ${nekretninaGrupa.nekretnina.kvadratura || ''} m²</p>
                </div>
            </div>
            <div class="inquiry-content">
                <h4>Moji upiti za ovu nekretninu:</h4>
                ${nekretninaGrupa.upiti.map(upit => `
                    <div class="inquiry-text">
                        <p>${upit.tekst_upita || upit.tekst}</p>
                        <div class="inquiry-date">Datum upita: ${new Date(upit.createdAt || Date.now()).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.appendChild(karticaDiv);
    });
}

// Učitaj podatke kada se stranica otvori
window.addEventListener('DOMContentLoaded', function() {
    PoziviAjax.getMojiUpiti(function(err, data) {
        if (err) {
            console.error(err);
            return;
        }
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            prikaziUpite(parsed);
        } catch (e) {
            console.error('Greška pri parsiranju podataka:', e);
        }
    });
});