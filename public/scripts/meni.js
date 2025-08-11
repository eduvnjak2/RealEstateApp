window.onload = function () {
  const liProfil = document.getElementById('liProfil');
  const liMojiUpiti = document.getElementById('liMojiUpiti');
  const liOdjava = document.getElementById('liOdjava');
  const liPrijava = document.getElementById('liPrijava');

  PoziviAjax.getKorisnik(function (err, data) {
    const loggedIn = !(err || !data || !data.username);

    // Ako nije logovan: sakrij Profil, Moji upiti i Odjava; prikaži Prijava
    liProfil.style.display = loggedIn ? '' : 'none';
    liMojiUpiti.style.display = loggedIn ? '' : 'none';
    liOdjava.style.display = loggedIn ? '' : 'none';
    liPrijava.style.display = loggedIn ? 'none' : '';
  });

  const odjavaLink = document.getElementById('odjavaLink');
  odjavaLink.addEventListener('click', function (e) {
    e.preventDefault();

    PoziviAjax.postLogout(function (err, data) {
      if (err) {
        console.error('Greška prilikom odjave:', err);
      } else {
        alert('Uspješno ste odjavljeni');
        window.parent.location.href = '/html/prijava.html';
      }
    });
  });
};