import React, { useState } from 'react';

type NewsItem = {
  id: number;
  date: string;
  title: string;
  type: 'comunicato' | 'riepilogo' | 'meteo';
  content: string;
  tags: string[];
};

const NEWS_DATA: NewsItem[] = [
  {
    id: 9,
    date: '09/07/2026',
    title: 'COMUNICATO UFFICIALE: FINALI ANTICIPATE AD OGGI!',
    type: 'comunicato',
    content: 'ATTENZIONE: Il Direttivo comunica ufficialmente che la serata conclusiva della Matenano Kings Cup 2026, originariamente programmata per domani 10/07, è stata anticipata ad OGGI, GIOVEDÌ 09/07.\n\nGli orari delle sfide restano invariati: alle 21:00 la Finale per il 3°/4° Posto e alle 22:00 la Finalissima. Vi aspettiamo numerosi al Campo L. Paolucci per chiudere in bellezza questa fantastica edizione!',
    tags: ['Comunicazione Ufficiale', 'Finale', 'Variazione Calendario']
  },
  {
    id: 8,
    date: '06/07/2026',
    title: 'AGGIORNAMENTO METEO: SERATA CONFERMATA!',
    type: 'meteo',
    content: 'Confermato il regolare svolgimento delle partite in programma per la serata odierna (06/07). Le condizioni meteo sono migliorate e il campo è perfettamente agibile. Tutti gli atleti sono invitati a presentarsi al Campo L. Paolucci per le sfide in programma.',
    tags: ['Meteo', 'Comunicazione Ufficiale', 'Standby']
  },
  {
    id: 7,
    date: '06/07/2026',
    title: 'RIEPILOGO 6° GIORNATA: LA VOLATA PER LE SEMIFINALI',
    type: 'riepilogo',
    content: 'Il Girone Unico si avvia verso la sua fase più calda. La tensione agonistica è altissima per conquistare un posto nella prestigiosa Top 4 che darà accesso diretto alle Semifinali di mercoledì 8. Godo Glimt, Sold Out e Talamonti Garden continuano a spingere sull\'acceleratore, ma le distanze in classifica sono talmente ridotte che ogni singolo gol e ogni MVP assegnato può ribaltare le sorti dell\'intero tabellone.',
    tags: ['Girone Unico', 'Classifica']
  },
  {
    id: 6,
    date: '03/07/2026',
    title: 'RIEPILOGO 5° GIORNATA: RITORNO AL GOL',
    type: 'riepilogo',
    content: 'Tornati a pieno regime, i ragazzi hanno dimostrato che due giorni di riposo forzato hanno solo caricato le batterie. La serata al Campo L. Paolucci ha visto Edil Pennello Fc e Bar Igloo lottare su ogni pallone. Anche la classifica marcatori ha subito forti scossoni, con doppiette pesantissime che riaccendono la corsa per il titolo di capocannoniere.',
    tags: ['Highlight', 'Marcatori']
  },
  {
    id: 5,
    date: '02/07/2026',
    title: 'RIEPILOGO 4° GIORNATA: SI RIPARTE A MILLE',
    type: 'riepilogo',
    content: 'Lasciata alle spalle l\'allerta pioggia, il pallone è tornato finalmente a rotolare. ASD Polisportiva Forcese e il Club hanno offerto un grande spettacolo al pubblico presente a bordo campo, mettendo in mostra un notevole livello tecnico e un\'ottima tenuta atletica. Giocate veloci e ripartenze fulminee hanno dominato la serata.',
    tags: ['Risultati', 'Ripresa']
  },
  {
    id: 4,
    date: '01/07/2026',
    title: 'COMUNICATO UFFICIALE: PARTITE RINVIATE PER PIOGGIA',
    type: 'meteo',
    content: 'Il Direttivo Numen APS comunica ufficialmente che, a causa delle avverse condizioni meteo e per garantire la totale sicurezza degli atleti sul terreno di gioco, le partite in programma per la data odierna (01/07) sono state posticipate. Il calendario è stato tempestivamente riprogrammato e le sfide di stasera slitteranno alla giornata di recupero del 07/07. I moduli assicurativi e le coperture restano pienamente operativi senza subire variazioni.',
    tags: ['Meteo', 'Rinvio', 'Calendario']
  },
  {
    id: 3,
    date: '30/06/2026',
    title: 'RIEPILOGO 3° GIORNATA: GARE SUL FILO DEL RASOIO',
    type: 'riepilogo',
    content: 'Giro di boa fondamentale per capire le vere gerarchie di questa edizione. Abbiamo assistito a match estremamente tattici in cui le difese hanno fatto la vera differenza, strappando punti preziosi. L\'atmosfera rimane stupenda e la gestione impeccabile dell\'area food sta accompagnando nel migliore dei modi i commenti post-partita.',
    tags: ['Tattica', 'Risultati']
  },
  {
    id: 2,
    date: '29/06/2026',
    title: 'RIEPILOGO 2° GIORNATA: SPETTACOLO E INTENSITÀ',
    type: 'riepilogo',
    content: 'La seconda serata non ha deluso minimamente le aspettative del torneo. Superata l\'emozione e la tensione dell\'esordio, le formazioni si sono affrontate a viso aperto, regalando tabellini ricchi e match ad altissima intensità. Alcune squadre hanno già messo in chiaro le loro serie intenzioni di arrivare in fondo e sollevare la coppa.',
    tags: ['Highlight', 'Gol']
  },
  {
    id: 1,
    date: '28/06/2026',
    title: 'KICK-OFF UFFICIALE MKC 2026',
    type: 'comunicato',
    content: 'La Matenano Kings Cup 2026 ha preso ufficialmente il via! Un immenso ringraziamento alla Pro Loco di Santa Vittoria in Matenano, partner fondamentale per la gestione logistica e per il lavoro impeccabile sugli stand. Che lo spettacolo abbia inizio!',
    tags: ['Inaugurazione', 'Ufficiale', 'Pro Loco']
  }
];

export default function NewsPage() {
  const [filter, setFilter] = useState<'tutte' | 'comunicato' | 'riepilogo'>('tutte');

  const filteredNews = NEWS_DATA.filter(news => {
    if (filter === 'tutte') return true;
    if (filter === 'comunicato') return news.type === 'comunicato' || news.type === 'meteo';
    return news.type === filter;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-12 pb-12 pt-6 overflow-hidden">
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#cca100] via-[#ffea00] to-[#cca100] drop-shadow-[0_4px_15px_rgba(255,234,0,0.2)]">
          Ultime Notizie
        </h1>
        <p className="text-zinc-400 font-mono text-sm md:text-base max-w-xl mx-auto">
          Comunicati ufficiali, aggiornamenti sul calendario e riepiloghi delle giornate.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {(['tutte', 'comunicato', 'riepilogo'] as const).map((f) => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
              filter === f 
              ? 'bg-[#ffea00] text-black shadow-[0_0_20px_rgba(255,234,0,0.3)] scale-105' 
              : 'bg-zinc-900/80 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {f === 'tutte' ? 'Tutte le news' : f === 'comunicato' ? 'Comunicati Ufficiali' : 'Riepiloghi Partite'}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredNews.map((news) => {
          
          const isMeteo = news.type === 'meteo';
          const isComunicato = news.type === 'comunicato';
          
          let borderColor = 'border-white/5';
          let shadow = '';
          let badgeColor = 'bg-zinc-800 text-zinc-300';
          let icon = '⚽';

          if (isMeteo) {
            borderColor = 'border-blue-500/30';
            shadow = 'shadow-[0_0_20px_rgba(59,130,246,0.1)]';
            badgeColor = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            icon = '⛈️';
          } else if (isComunicato) {
            borderColor = 'border-[#ffea00]/30';
            shadow = 'shadow-[0_0_20px_rgba(255,234,0,0.05)]';
            badgeColor = 'bg-[#ffea00]/20 text-[#ffea00] border border-[#ffea00]/30';
            icon = '🎙️';
          }

          return (
            <article 
              key={news.id} 
              className={`bg-zinc-900 rounded-3xl border p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 ${borderColor} ${shadow}`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                
                <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:w-32 shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl md:text-3xl shadow-inner">
                    {icon}
                  </div>
                  <div className="text-left">
                    <span className="block text-[#ffea00] font-black font-mono text-sm md:text-base">
                      {news.date.split('/')[0]}
                    </span>
                    <span className="block text-zinc-500 font-bold font-mono text-[10px] md:text-xs uppercase tracking-widest">
                      {news.date.split('/')[1]}/{news.date.split('/')[2]}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${badgeColor}`}>
                        {news.type}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wide leading-tight">
                      {news.title}
                    </h3>
                  </div>
                  
                  <p className="text-zinc-400 font-mono text-xs md:text-sm leading-relaxed whitespace-pre-line">
                    {news.content}
                  </p>
                  
                  <div className="pt-4 flex flex-wrap gap-2">
                    {news.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest before:content-['#'] before:text-zinc-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}