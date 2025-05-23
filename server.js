  import express from 'express';
  import fetch from 'node-fetch';


  const app = express();

  app.get('/', (req, res) => {
    res.send('Serveren din funker, Hanna!');
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
  });


  //Hele biten med å sette opp en server fikk jeg hjelp med av Chatgpt, dette var nytt for meg og jeg har egentlig 
  //aldri satt opp en eneste server. Prøvde å lese på informasjonen om MCP, men fant ingenting om javascript så måtte få litt hjelp av AI her i starten, Alt over her er chatgpt som har hjulpet meg med. Valgte AI for å effektivisere

  // Jeg valgte å bruke brave search API ettersom arbeid med API er veldig nytt for meg, kun vært borti ticketmaster sin i forbindelse med eksamen i Utvikling av interaktive nettsider


  app.get(`/search`, async (req, res) => {

    const params = new URLSearchParams({
      q: 'matoppskrifter'
    });

    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'x-subscription-token': 'BSAywgQshX3Hr_uSmrMbevOf7RTkVrj',
      },
    });

    const body = await response.json();

    console.log(body)

    const resultater = body.web?.results?.slice(0, 3).map(r => ({
      tittel: r.title,
      lenke: r.url,
      beskrivelse: r.description
    })) || [];

    res.json({
      søk: req.query.q,
      resultater
    });

  } )
  





