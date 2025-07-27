window.onload = function () {

  PoziviAjax.getKorisnik(function (err, data) {
    
    const loggedIn = !(err || !data || !data.username);

  });

  const odjavaLink = document.getElementById('odjavaLink');
  odjavaLink.addEventListener('click', function (e) {
    e.preventDefault();
    
    PoziviAjax.postLogout(function (err, data) {
      if (err) {
        console.error('Greška prilikom odjave:', err);
      } else {
        alert('Uspješno ste odjavljeni');
        window.parent.location.href = '/prijava.html';
      }
    });
  });
};