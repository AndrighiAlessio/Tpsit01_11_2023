const express = require('express');
const fs = require('fs');
const service = express();
const porta = 3000;

const data = JSON.parse(fs.readFileSync('fifa23_.json', 'utf8'));

service.use(express.static('./public'));

service.get('/', (request, response) => {
  response.sendFile('./public/index.html', { root: __dirname });
  response.end()
});



service.get('/giocatori', (request, response) => {
  response.end(response.json(data));
});



service.get('/giocatori-squadra', (request, response) => {
  const squadra = request.query.squadra;
  if (!squadra) {
    response.status(400).json({ error: 'Devi specificare una squadra' });
    return;
  }
  console.log(data.squadra)
  const giocatoriSquadra = data.filter((giocatore) => giocatore.Club === squadra);
  response.end(response.json(giocatoriSquadra));
});



service.get('/squadre', (request, response) => {
  const squadre = [...new Set(data.map((giocatore) => giocatore.Club))];
  response.end(response.json(squadre));
});



service.get('/nazioni', (request, response) => {
  const nazioni = [...new Set(data.map((giocatore) => giocatore.Nazionalita))];
  response.end(response.json(nazioni));
});



service.get('/posizioni', (request, response) => {
  const posizioni = [...new Set(data.map((giocatore) => giocatore.Posizione))];
  response.end(response.json(posizioni));
});



service.get('/giocatore/:id', (request, response) => {
  const id = parseInt(request.params.id);
  const giocatore = data.find((giocatore) => giocatore.id === id);

  if (giocatore) {
    response.end(response.json(giocatore));
  } else {
    response.status(404).json({ error: 'Giocatore insesistente' });
  }
});



service.get('/migliori-portieri', (request, response) => {
  const portieri = data.filter((giocatore) => giocatore.Posizione === 'GK');
  const miglioriPortieri = portieri.sort((a, b) => b.Valore - a.Valore).slice(0, 10);
  response.end(response.json(miglioriPortieri));
});



service.get('/eta-media-squadra', (request, response) => {
  const squadra = request.query.squadra;
  if (!squadra) {
    response.status(400).json({ error: 'Devi specificare una squadra' });
    return;
  }
  const giocatoriSquadra = data.filter((giocatore) => giocatore.Club === squadra);
  const miglioriGiocatori = giocatoriSquadra.sort((a, b) => b.Valore - a.Valore).slice(0, 15);
  const etaMedia = miglioriGiocatori.reduce((sum, giocatore) => sum + giocatore.Eta, 0) / miglioriGiocatori.length;
  response.end(response.json({ etaMedia }));
});



service.get('/valore-medio-squadra', (request, response) => {
  const squadra = request.query.squadra;
  if (!squadra) {
    response.status(400).json({ error: 'Devi specificare una squadra' });
    return;
  }
  const giocatoriSquadra = data.filter((giocatore) => giocatore.Club === squadra);
  const miglioriGiocatori = giocatoriSquadra.sort((a, b) => b.Valore - a.Valore).slice(0, 15);
  const valoreMedio = miglioriGiocatori.reduce((sum, giocatore) => sum + giocatore.Valore, 0) / miglioriGiocatori.length;
  response.end(response.json({ valoreMedio }));
});



service.get('/giocatori-per-ruolo', (request, response) => {
  const ruolo = request.query.ruolo;
  if (!ruolo) {
    response.status(400).json({ error: 'Devi specificare un ruolo' });
    return;
  }
  const giocatoriPerRuolo = data.filter((giocatore) => giocatore.Ruolo === ruolo);
  const giocatoriOrdinatiPerValoreCresponsecente = giocatoriPerRuolo.sort((a, b) => a.Valore - b.Valore);
  response.end(response.json(giocatoriOrdinatiPerValoreCresponsecente));
});



service.get('/top-10-giocatori-nazione', (request, response) => {
  const nazione = request.query.nazione;
  if (!nazione) {
    response.status(400).json({ error: 'Devi specificare una nazione' });
    return;
  }
  const giocatoriNazione = data.filter((giocatore) => giocatore.Nazionalita === nazione);
  const miglioriGiocatoriNazione = giocatoriNazione.sort((a, b) => b.Valore - a.Valore).slice(0, 10);
  response.end(response.json(miglioriGiocatoriNazione));
});



service.get('/percentuale-attaccanti-piede-sinistro', (request, response) => {
  const attaccanti = data.filter((giocatore) => giocatore.Ruolo === 'A');
  const attaccantiPiedeSinistro = attaccanti.filter((giocatore) => giocatore.Piede === 'Left');
  const percentuale = (attaccantiPiedeSinistro.length / attaccanti.length) * 100;
  response.end(response.json({ percentuale: percentuale }));
});



service.put('/aumenta-eta', (request, response) => {
  const newData = data.map((giocatore) => ({
    ...giocatore,
    Eta: giocatore.Eta + 1,
  }));
  fs.writeFileSync('fifa23_.json', JSON.stringify(newData, null, 2), 'utf8');
  response.json({ message: 'Età aumentata' });
});



service.delete('/giocatori-valore-inferiore-a-78', (request, response) => {
  const valoreLimite = 78;
  const giocatoriSopraValoreLimite = data.filter((giocatore) => giocatore.Valore >= valoreLimite);
  fs.writeFileSync('fifa23_.json', JSON.stringify(giocatoriSopraValoreLimite, null, 2), 'utf8');
  response.json({ message: 'Giocatori con valore superiore o uguale a 78 eliminati' });
});



service.post('/inserisci-giocatore', (request, response) => {
  const nuovoGiocatore = request.body;
  if (!nuovoGiocatore.Nome || !nuovoGiocatore.Valore || !nuovoGiocatore.Posizione || !nuovoGiocatore.Nazionalita || !nuovoGiocatore.Eta || !nuovoGiocatore.Club || !nuovoGiocatore.Piede || !nuovoGiocatore.Ruolo) {
    response.status(400).json({ error: 'Devi fornire tutti i campi obbligatori' });
  } else {
    const nuovoID = data.reduce((maxID, giocatore) => Math.max(maxID, giocatore.id), 0) + 1;
    nuovoGiocatore.id = nuovoID;
    jsonData.push(nuovoGiocatore);
    fs.writeFileSync('fifa23_.json', JSON.stringify(data, null, 2), 'utf8');
    response.json({ message: 'Nuovo giocatore inserito' });
  }
});



service.listen(porta, () => {
  console.log(`Server avviato alla porta: ` + porta);
});