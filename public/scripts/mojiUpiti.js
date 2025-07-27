function prikaziUpite(upiti) {
    const container = document.getElementById('upiti-container');
    container.innerHTML = '';

    if (upiti.length === 0) {
        container.innerHTML = '<p class="no-upiti">Nemate nijedan upit.</p>';
        return;
    }

    // Grupiraj upite po nekretninama
    const upitiPoNekretninama = upiti.reduce((acc, upit) => {
        if (!acc[upit.id_nekretnine]) {
            acc[upit.id_nekretnine] = {
                nekretnina: upit.nekretnina,
                upiti: []
            };
        }
        acc[upit.id_nekretnine].upiti.push(upit);
        return acc;
    }, {});

    // Prikazi svaku nekretninu sa upitima
    Object.values(upitiPoNekretninama).forEach(nekretninaGrupa => {
        const karticaDiv = document.createElement('div');
        karticaDiv.className = 'upit-card';
        
        karticaDiv.innerHTML = `
            <div class="nekretnina-info">
                <div class="osnovni-podaci">
                    <h3>${nekretninaGrupa.nekretnina.naziv}</h3>
                    <p class="cijena">Cijena: ${nekretninaGrupa.nekretnina.cijena} KM</p>
                    <p class="lokacija">Lokacija: ${nekretninaGrupa.nekretnina.lokacija}</p>
                    <p class="kvadratura">Kvadratura: ${nekretninaGrupa.nekretnina.kvadratura} m²</p>
                </div>
            </div>
            <div class="upiti-lista">
                <h4>Moji upiti za ovu nekretninu:</h4>
                ${nekretninaGrupa.upiti.map(upit => `
                    <div class="upit-text">
                        <p>${upit.tekst_upita}</p>
                        <small>Datum upita: ${new Date(upit.createdAt).toLocaleDateString()}</small>
                    </div>
                `).join('')}
            </div>
        `;

        container.appendChild(karticaDiv);
    });
}