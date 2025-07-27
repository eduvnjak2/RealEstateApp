function postaviCarousel(glavniElement, sviElementi, indeks = 0) {

    if (!glavniElement || !Array.isArray(sviElementi) || sviElementi.length === 0 || 
        typeof indeks !== 'number' || indeks < 0) {
        return null;
    }

    indeks = Math.min(Math.max(0, indeks), sviElementi.length - 1); 
    let jeLiZakljucano = false;
   
    glavniElement.innerHTML = sviElementi[indeks].innerHTML;

    return {
        fnLijevo: function() {
            if (jeLiZakljucano) return;
            jeLiZakljucano = true;
            
            indeks--;
            if (indeks < 0) {
                indeks = sviElementi.length - 1; 
            }
            glavniElement.innerHTML = sviElementi[indeks].innerHTML;
            
            setTimeout(() => {
                jeLiZakljucano = false;
            }, 300);
        },
        fnDesno: function() {
            if (jeLiZakljucano) return;
            jeLiZakljucano = true;
            
            indeks++;
            if (indeks >= sviElementi.length) {
                indeks = 0; 
            }
            glavniElement.innerHTML = sviElementi[indeks].innerHTML;
            
            setTimeout(() => {
                jeLiZakljucano = false;
            }, 300);
        }
    };
}