import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// I tuoi link reali presi da "Pubblica sul web"
const URL_GIRONI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=0&single=true&output=csv'; 
const URL_PARTITE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=1934217749&single=true&output=csv';
const URL_MARCATORI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=1767066330&single=true&output=csv';

// Lista ufficiale delle 7 squadre
const SQUADRE_UFFICIALI = [
  'Edil Pennello Fc',
  'Godo Glimt',
  'ASD Polisportiva Forcese',
  'Sold Out',
  'Talamonti Garden',
  'Bar Igloo',
  'Club'
];

// Date ufficiali del torneo
const DATE_TORNEO = ['28/06', '29/06', '30/06', '01/07', '02/07', '03/07', '06/07', '07/07', '08/07', '10/07'];

// Mappatura colori per la classifica marcatori
const COLOR_MAP: Record<string, string> = {
  'Godo Glimt': 'rgba(204, 161, 0, 0.15)',        
  'Sold Out': 'rgba(127, 0, 0, 0.25)',           
  'Talamonti Garden': 'rgba(6, 78, 59, 0.25)',    
  'Bar Igloo': 'rgba(255, 255, 255, 0.08)',      
  'ASD Polisportiva Forcese': 'rgba(30, 58, 138, 0.25)', 
  'Edil Pennello Fc': 'rgba(3, 105, 161, 0.25)',  
  'Club': 'rgba(63, 63, 70, 0.4)',               
};

// Helper per generare il percorso del logo
function getLogoPath(squadraNome: string): string {
  if (!squadraNome) return '/assets/logo-big.jpg';
  const nomeTrimmed = squadraNome.trim();
  if (nomeTrimmed === 'Sold Out') return '/assets/soldoutl.png';
  const nomePulito = nomeTrimmed.toLowerCase().replace(/\s+/g, '');
  return `/assets/${nomePulito}.png`;
}

async function fetchCsvData(url: string): Promise<any[]> {
  try {
    const response = await fetch(url, { cache: "no-store" }); 
    if (!response.ok) return [];
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
    return parsed.data.slice(1) || []; 
  } catch (error) {
    return [];
  }
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const targetDate = new Date('2026-06-28T20:30:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference <= 0) {
        setTimeLeft('TORNEO IN CORSO!');
        clearInterval(interval);
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`START TRA: ${days > 0 ? `${days}g ` : ''}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="inline-block bg-[#ffea00] text-black font-mono text-xs font-black tracking-widest uppercase px-5 py-2 rounded-xl shadow-lg border border-[#ffea00]">
      ⏳ {timeLeft}
    </div>
  );
}

export default function TournamentRounds() {
  const [loading, setLoading] = useState(true);
  const [classifica, setClassifica] = useState<any[]>([]);
  const [partite, setPartite] = useState<any[]>([]);
  const [marcatori, setMarcatori] = useState<any[]>([]);
  const [squadreInCampo, setSquadreInCampo] = useState<Set<string>>(new Set());
  
  const [toggledMatches, setToggledMatches] = useState<Record<number, boolean>>({});

  const [dataAttiva, setDataAttiva] = useState<string>(() => {
    const oggi = new Date();
    const giorno = String(oggi.getDate()).padStart(2, '0');
    const mese = String(oggi.getMonth() + 1).padStart(2, '0');
    const dataFormattata = `${giorno}/${mese}`;
    return DATE_TORNEO.includes(dataFormattata) ? dataFormattata : '28/06';
  });

  useEffect(() => {
    setToggledMatches({});
  }, [dataAttiva]);

  const loadAllData = async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setLoading(true);
    try {
      const [, rawPartite, rawMarcatori] = await Promise.all([
        fetchCsvData(URL_GIRONI),
        fetchCsvData(URL_PARTITE),    
        fetchCsvData(URL_MARCATORI)  
      ]);
      const dizionarioClassifica: any = {};
      SQUADRE_UFFICIALI.forEach(s => dizionarioClassifica[s] = { name: s, punti: 0, giocate: 0, vinte: 0, nulle: 0, perse: 0, gf: 0, gs: 0, dr: 0 });

      const listaPartite: any[] = [];
      const liveTeams = new Set<string>();

      if (Array.isArray(rawPartite)) {
        for (const row of rawPartite) {
          if (!row[0] || !row[2] || !row[3]) continue;
          const dataMatch = row[0].toString().trim(); 
          const sA = row[2].toString().trim();
          const sB = row[3].toString().trim();
          const golA = row[4] !== undefined && row[4] !== '' ? Number(row[4]) : null;
          const golB = row[5] !== undefined && row[5] !== '' ? Number(row[5]) : null;
          const vO = row[6] ? row[6].toString().trim() : '';
          
          let stato = row[13] ? row[13].toString().trim().toUpperCase() : '';
          if (stato === 'HALF TIME' || stato === 'INTERVALLO') stato = 'HT';

          listaPartite.push({ 
            dataMatch, 
            squadra1: sA, 
            squadra2: sB, 
            golsquadra1: golA, 
            golsquadra2: golB, 
            orario: row[7] || 'Da definire',
            dettagliA: row[8] ? row[8].toString().trim() : '',   
            dettagliB: row[9] ? row[9].toString().trim() : '',   
            mvp: row[10] ? row[10].toString().trim() : '',
            doppiA: row[11] ? row[11].toString().trim() : '', 
            doppiB: row[12] ? row[12].toString().trim() : '',
            stato
          });

          // Aggiungiamo le squadre in campo sia se sono LIVE che in HT
          if (stato === 'LIVE' || stato === 'HT') {
            liveTeams.add(sA);
            liveTeams.add(sB);
          }

          if (golA === null || golB === null) continue;
          [sA, sB].forEach(s => { if (!dizionarioClassifica[s]) dizionarioClassifica[s] = { name: s, punti: 0, giocate: 0, vinte: 0, nulle: 0, perse: 0, gf: 0, gs: 0, dr: 0 }; });
          dizionarioClassifica[sA].giocate += 1; dizionarioClassifica[sB].giocate += 1;
          dizionarioClassifica[sA].gf += golA; dizionarioClassifica[sA].gs += golB;
          dizionarioClassifica[sB].gf += golB; dizionarioClassifica[sB].gs += golA;
          if (golA > golB) { dizionarioClassifica[sA].punti += 3; dizionarioClassifica[sA].vinte += 1; dizionarioClassifica[sB].perse += 1; }
          else if (golA < golB) { dizionarioClassifica[sB].punti += 3; dizionarioClassifica[sB].vinte += 1; dizionarioClassifica[sA].perse += 1; }
          else {
            dizionarioClassifica[sA].nulle += 1; dizionarioClassifica[sB].nulle += 1;
            if (vO === sA) { dizionarioClassifica[sA].punti += 2; dizionarioClassifica[sB].punti += 1; }
            else if (vO === sB) { dizionarioClassifica[sB].punti += 2; dizionarioClassifica[sA].punti += 1; }
            else { dizionarioClassifica[sA].punti += 1; dizionarioClassifica[sB].punti += 1; }
          }
          dizionarioClassifica[sA].dr = dizionarioClassifica[sA].gf - dizionarioClassifica[sA].gs;
          dizionarioClassifica[sB].dr = dizionarioClassifica[sB].gf - dizionarioClassifica[sB].gs;
        }
      }
      setClassifica(Object.values(dizionarioClassifica).sort((a: any, b: any) => b.punti - a.punti || b.dr - a.dr || b.gf - a.gf));
      setSquadreInCampo(liveTeams);

      const listaMarcatori: any[] = [];
      if (Array.isArray(rawMarcatori)) {
        for (const row of rawMarcatori) {
          if (!row[0] || row[2] === undefined || row[2] === '') continue;
          listaMarcatori.push({ nome: row[0].toString().trim(), squadra: row[1] ? row[1].toString().trim() : '-', gol: Number(row[2]) });
        }
      }
      setPartite(listaPartite);
      setMarcatori(listaMarcatori.sort((a, b) => b.gol - a.gol));
      
      if (!isSilentRefresh) setLoading(false);
    } catch (err) { 
      if (!isSilentRefresh) setLoading(false); 
    }
  };

  useEffect(() => {
    loadAllData(false);
    const intervalId = setInterval(() => {
      loadAllData(true);
    }, 45000); 
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="text-center text-zinc-400 py-12 font-mono animate-pulse">Sincronizzazione...</div>;

  const partiteFiltrate = partite.filter(p => p.dataMatch === dataAttiva);

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-16 pb-12">
      {/* HEADER */}
      <div className="text-center space-y-6 pt-6">
        <CountdownTimer />
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#cca100] via-[#ffea00] to-[#cca100] drop-shadow-[0_4px_15px_rgba(255,234,0,0.2)]">
          Calendario
        </h1>
      </div>

      {/* CALENDARIO */}
      <div className="space-y-6 text-center">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {DATE_TORNEO.map((data) => (
            <button key={data} onClick={() => setDataAttiva(data)} className={`px-4 py-2 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-colors ${dataAttiva === data ? 'bg-[#ffea00] text-black shadow-lg shadow-[#ffea00]/20' : 'bg-zinc-900/80 text-zinc-400 border border-white/5 hover:bg-zinc-800'}`}>
              {data}
            </button>
          ))}
        </div>
        
        {/* Griglia delle partite */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          {partiteFiltrate.length > 0 ? (
            partiteFiltrate.map((p, idx) => {
              const isGiocata = p.golsquadra1 !== null && p.golsquadra2 !== null;
              const hasDetails = Boolean(p.dettagliA || p.dettagliB || p.doppiA || p.doppiB || p.mvp);
              const isExpanded = isGiocata && (toggledMatches[idx] !== undefined ? toggledMatches[idx] : hasDetails);
              
              const isLive = p.stato === 'LIVE';
              const isHT = p.stato === 'HT';
              const isMatchActive = isLive || isHT;

              return (
                <div 
                  key={idx} 
                  onClick={() => isGiocata && setToggledMatches(prev => ({...prev, [idx]: !isExpanded}))}
                  className={`flex flex-col p-5 bg-zinc-900 rounded-2xl border transition-colors duration-200 h-fit ${
                    isGiocata ? 'cursor-pointer hover:bg-zinc-800' : ''
                  } ${isExpanded ? 'border-[#ffea00]/30 shadow-lg shadow-[#ffea00]/5' : 'border-white/5'} ${isLive ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : isHT ? 'border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : ''}`}
                >
                  {/* Intestazione */}
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-3">
                    <span>Girone Unico • {p.dataMatch}</span>
                    <div className="flex items-center gap-2">
                      {isGiocata && !isMatchActive && (
                        <span className="text-zinc-400 text-[9px] bg-white/5 px-1.5 py-0.5 rounded tracking-normal">
                          {isExpanded ? '▲ Chiudi' : '▼ Dettagli'}
                        </span>
                      )}
                      <span className="text-[#ffea00]/80 font-bold">L. Paolucci</span>
                    </div>
                  </div>
                  
                  {/* Risultato e Squadre */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 w-5/12 text-left">
                      <img loading="lazy" decoding="async" src={getLogoPath(p.squadra1)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0" />
                      <span className="text-xs md:text-sm font-bold text-white uppercase break-words leading-tight">{p.squadra1}</span>
                    </div>

                    {isMatchActive ? (
                      <div className="flex flex-col items-center shrink-0 min-w-[70px]">
                        {isLive ? (
                          <div className="bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 rounded text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse mb-1">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>LIVE
                          </div>
                        ) : (
                          <div className="bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 rounded text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            ⏱️ HT
                          </div>
                        )}
                        {isGiocata && (
                          <div className="font-mono font-bold text-[#ffea00] text-sm md:text-base leading-none">
                            {p.golsquadra1} - {p.golsquadra2}
                          </div>
                        )}
                      </div>
                    ) : isGiocata ? (
                      <div className="flex items-center gap-2.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 font-mono font-bold text-[#ffea00] text-xs md:text-sm shrink-0">
                        <span>{p.golsquadra1}</span><span className="text-zinc-600 text-xs">-</span><span>{p.golsquadra2}</span>
                      </div>
                    ) : (
                      <div className="bg-[#ffea00]/10 border border-[#ffea00]/20 px-2.5 py-1 rounded-xl text-center font-mono text-[11px] font-bold text-[#ffea00] whitespace-nowrap shrink-0">⏱️ {p.orario}</div>
                    )}

                    <div className="flex items-center justify-end gap-2 w-5/12 text-right">
                      <span className="text-xs md:text-sm font-bold text-white uppercase break-words leading-tight">{p.squadra2}</span>
                      <img loading="lazy" decoding="async" src={getLogoPath(p.squadra2)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0" />
                    </div>
                  </div>

                  {/* ANIMAZIONE A TENDINA */}
                  {isGiocata && (
                    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        {hasDetails ? (
                          <div className="mt-3 pt-3 border-t border-white/5 space-y-4 text-[11px] font-mono">
                            <div className="grid grid-cols-2 gap-4 pt-1">
                              <div className="border-r border-white/5 pr-2 space-y-2">
                                <p className="text-zinc-300 font-medium whitespace-pre-line leading-relaxed">{p.dettagliA || '-'}</p>
                                {p.doppiA && (
                                  <div className="mt-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-1.5 inline-block text-left max-w-full">
                                    <span className="text-[8px] text-fuchsia-400 font-bold uppercase tracking-wider block mb-0.5"> GOL DOPPI</span>
                                    <p className="text-fuchsia-300 font-bold whitespace-pre-line leading-normal">{p.doppiA}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="pl-1 space-y-2 text-right flex flex-col items-end">
                                <p className="text-zinc-300 font-medium whitespace-pre-line leading-relaxed w-full">{p.dettagliB || '-'}</p>
                                {p.doppiB && (
                                  <div className="mt-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-1.5 inline-block text-right max-w-full">
                                    <span className="text-[8px] text-fuchsia-400 font-bold uppercase tracking-wider block mb-0.5">GOL DOPPI</span>
                                    <p className="text-fuchsia-300 font-bold whitespace-pre-line leading-normal">{p.doppiB}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {p.mvp && (
                              <div className="bg-[#ffea00]/5 border border-[#ffea00]/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                                <span className="text-[9px] uppercase tracking-wider text-[#ffea00]/80 font-bold">⭐ MVP</span>
                                <span className="text-white font-bold text-xs uppercase tracking-wide">{p.mvp}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-white/5 text-center text-zinc-500 text-[10px] font-mono italic">
                            Nessun dettaglio extra disponibile per questo match
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <>
              {/* MESSAGGIO RINvio PER PIOGGIA - 01/07 */}
              {dataAttiva === '01/07' && (
                <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-6 md:p-10 bg-zinc-900/60 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] text-center backdrop-blur-sm">
                  <span className="text-4xl md:text-5xl mb-4 opacity-90 drop-shadow-lg">⛈️</span>
                  <h3 className="text-blue-400 font-display font-black uppercase text-xl md:text-2xl tracking-widest mb-3">
                    Partite Rinviate
                  </h3>
                  <p className="text-zinc-400 font-mono text-xs md:text-sm leading-relaxed max-w-md">
                    A causa delle avverse condizioni meteo, le partite in programma per questa data sono state posticipate al <strong className="text-white bg-white/10 px-2 py-0.5 rounded ml-1">07/07</strong>.
                  </p>
                </div>
              )}

              {/* PLACEHOLDER FASI FINALI - 08/07 e 10/07 */}
              {(dataAttiva === '08/07' || dataAttiva === '10/07') && (
                (dataAttiva === '08/07' 
                  ? [{ fase: 'Semifinale 1', orario: '21:00' }, { fase: 'Semifinale 2', orario: '22:00' }] 
                  : [{ fase: 'Finale 3°/4° Posto', orario: '21:00' }, { fase: 'Finale 1°/2° Posto', orario: '22:00' }]
                ).map((match, i) => (
                  <div key={i} className="flex flex-col p-5 bg-zinc-900/30 rounded-2xl border border-dashed border-white/10 h-fit backdrop-blur-sm">
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-4">
                      <span className="text-[#ffea00]/60 font-bold">{match.fase} • {dataAttiva}</span>
                      <span>L. Paolucci</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 w-5/12 text-left opacity-40">
                        <div className="w-6 h-6 rounded-full bg-black/50 border border-white/10 shrink-0"></div>
                        <span className="text-xs md:text-sm font-bold text-zinc-300 uppercase">Da definire</span>
                      </div>
                      
                      <div className="bg-[#ffea00]/5 border border-[#ffea00]/10 px-2.5 py-1 rounded-xl text-center font-mono text-[11px] font-bold text-[#ffea00]/40 whitespace-nowrap shrink-0">
                        ⏱️ {match.orario}
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 w-5/12 text-right opacity-40">
                        <span className="text-xs md:text-sm font-bold text-zinc-300 uppercase">Da definire</span>
                        <div className="w-6 h-6 rounded-full bg-black/50 border border-white/10 shrink-0"></div>
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-3 border-t border-dashed border-white/5 text-center">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse"></span>
                        In attesa dei sorteggi
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* FALLBACK PER ALTRE DATE VUOTE SE NECESSARIO */}
              {(!['01/07', '08/07', '10/07'].includes(dataAttiva)) && (
                <div className="col-span-1 md:col-span-2 text-center text-zinc-600 text-xs font-mono py-12 italic">
                  Nessuna partita programmata o caricata per questa data.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CLASSIFICA GENERALE */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-display font-black text-white text-center uppercase tracking-wider">Classifica Generale</h2>
        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-4 md:p-6 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm font-mono text-zinc-400 min-w-[500px]">
              <thead>
                <tr className="text-zinc-600 uppercase text-[10px] md:text-xs border-b border-white/5">
                  <th className="pb-3 pl-2">Pos</th><th className="pb-3">Squadra</th><th className="pb-3 text-center">Punti</th><th className="pb-3 text-center">G</th><th className="pb-3 text-center">V</th><th className="pb-3 text-center">N</th><th className="pb-3 text-center">P</th><th className="pb-3 text-center">DR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {classifica.map((s: any, idx: number) => {
                  const isPlaying = squadreInCampo.has(s.name);
                  
                  return (
                    <tr key={idx} className={`transition-colors ${isPlaying ? 'bg-red-500/5 relative' : idx < 4 ? 'bg-[#ffea00]/[0.02]' : ''}`}>
                      <td className={`py-3 pl-2 font-bold ${idx < 4 ? 'text-[#ffea00]' : 'text-zinc-500'}`}>
                        {isPlaying && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}
                        #{idx + 1}
                      </td>
                      <td className="py-3 font-bold text-white uppercase max-w-[160px] whitespace-normal leading-tight">
                        <div className="flex items-center gap-2">
                          <img loading="lazy" decoding="async" src={getLogoPath(s.name)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} className="w-4 h-4 object-contain shrink-0" />
                          <span>{s.name}</span>
                          {isPlaying && (
                            <span className="hidden md:inline-flex bg-red-500/20 text-red-500 border border-red-500/40 text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse ml-2">IN CAMPO</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-center font-black text-base text-[#ffea00]">{s.punti}</td>
                      <td className="py-3 text-center">{s.giocate}</td><td className="py-3 text-center">{s.vinte}</td><td className="py-3 text-center">{s.nulle}</td><td className="py-3 text-center">{s.perse}</td>
                      <td className={`py-3 text-center font-bold ${s.dr > 0 ? 'text-green-400' : s.dr < 0 ? 'text-red-400' : ''}`}>{s.dr > 0 ? `+${s.dr}` : s.dr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-zinc-500 pl-2">
              <span className="w-2.5 h-2.5 rounded bg-[#ffea00]/20 border border-[#ffea00]/40"></span><span>Top 4: Semifinali</span>
            </div>
            {squadreInCampo.size > 0 && (
              <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-red-500/80 pr-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span><span>Partita in corso</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CLASSIFICA MARCATORI */}
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider text-center">🏆 Classifica Marcatori</h2>
        <div className="grid gap-3">
          {marcatori.length === 0 ? (
            <p className="text-center text-zinc-600 text-xs py-4 italic">In attesa dei primi gol...</p>
          ) : (
            marcatori.map((m: any, idx: number) => {
              const teamColor = COLOR_MAP[m.squadra] || 'rgba(24, 24, 27, 0.6)';
              const teamLogo = getLogoPath(m.squadra);

              return (
                <div 
                  key={idx} 
                  className="relative overflow-hidden rounded-2xl border border-white/5 transition-transform hover:scale-[1.01]"
                  style={{ backgroundColor: teamColor }}
                >
                  <div 
                    className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-32 h-32 opacity-[0.08] pointer-events-none grayscale brightness-200"
                    style={{ 
                      backgroundImage: `url(${teamLogo})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />

                  <div className="relative z-10 flex justify-between items-center p-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`text-lg font-black shrink-0 ${idx === 0 ? 'text-[#ffea00]' : 'text-zinc-500'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-sm md:text-base uppercase tracking-wide leading-tight break-words">
                          {m.nome}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <img 
                            loading="lazy"
                            decoding="async"
                            src={teamLogo} 
                            alt="" 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }}
                            className="w-3.5 h-3.5 object-contain shrink-0" 
                          />
                          <span className="text-[10px] font-mono uppercase text-zinc-300 tracking-widest break-words leading-tight">
                            {m.squadra}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end shrink-0 ml-4">
                      <span className="text-[#ffea00] font-black text-lg md:text-xl leading-none">
                        {m.gol}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-[#ffea00]/60 tracking-tighter">
                        GOL
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}