function prikaziUpite(upiti) {
    const container = document.getElementById('upiti-container');
    container.innerHTML = '';

    if (upiti.length === 0) {
        container.innerHTML = '<div class="no-inquiries"><h3>Nemate nijedan upit</h3><p>Još niste poslali nijedan upit za nekretnine.</p></div>';
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
        karticaDiv.className = 'inquiry-item';
        
        karticaDiv.innerHTML = `
            <div class="property-info">
                <img src="${nekretninaGrupa.nekretnina.slika || '../resources/1.jpg'}" alt="Nekretnina" class="property-image">
                <div class="property-details">
                    <h3>${nekretninaGrupa.nekretnina.naziv}</h3>
                    <p>Cijena: ${nekretninaGrupa.nekretnina.cijena} KM</p>
                    <p>Lokacija: ${nekretninaGrupa.nekretnina.lokacija}</p>
                    <p>Kvadratura: ${nekretninaGrupa.nekretnina.kvadratura} m²</p>
                </div>
            </div>
            <div class="inquiry-content">
                <h4>Moji upiti za ovu nekretninu:</h4>
                ${nekretninaGrupa.upiti.map(upit => `
                    <div class="inquiry-text">
                        <p>${upit.tekst_upita}</p>
                        <div class="inquiry-date">Datum upita: ${new Date(upit.createdAt).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.appendChild(karticaDiv);
    });
}