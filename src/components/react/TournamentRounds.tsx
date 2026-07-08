import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// Link reali presi da "Pubblica sul web"
const URL_GIRONI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=0&single=true&output=csv'; 
const URL_PARTITE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=1934217749&single=true&output=csv';
const URL_MARCATORI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=1767066330&single=true&output=csv';

// Coordinate Campo Sportivo L. Paolucci - Santa Vittoria in Matenano (FM)
const LAT = 43.0189;
const LON = 13.4958;

const SQUADRE_UFFICIALI = [
  'Edil Pennello Fc',
  'Godo Glimt',
  'ASD Polisportiva Forcese',
  'Sold Out',
  'Talamonti Garden',
  'Bar Igloo',
  'Club'
];

// Date separate per logica
const DATE_GIRONI = ['28/06', '29/06', '30/06', '01/07', '02/07', '03/07', '06/07', '07/07'];
const DATE_FINALI = ['08/07', '10/07'];

const COLOR_MAP: Record<string, string> = {
  'Godo Glimt': 'rgba(204, 161, 0, 0.15)',        
  'Sold Out': 'rgba(127, 0, 0, 0.25)',            
  'Talamonti Garden': 'rgba(6, 78, 59, 0.25)',    
  'Bar Igloo': 'rgba(255, 255, 255, 0.08)',      
  'ASD Polisportiva Forcese': 'rgba(30, 58, 138, 0.25)', 
  'Edil Pennello Fc': 'rgba(3, 105, 161, 0.25)',  
  'Club': 'rgba(63, 63, 70, 0.4)',                
};

function getWeatherEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code === 1 || code === 2) return isDay ? '🌤️' : '☁️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '☁️';
}

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
  const [teamModal, setTeamModal] = useState<string | null>(null);
  
  const [meteoData, setMeteoData] = useState<Record<string, { temp: number; emoji: string }>>({});
  const [toggledMatches, setToggledMatches] = useState<Record<string, boolean>>({});
  const [showAllScorers, setShowAllScorers] = useState(false);

  // Data per la sezione gironi
  const [dataGironeAttiva, setDataGironeAttiva] = useState<string>('07/07');

  // Nuovi stati per l'animazione dei menu a tendina
  const [isClassificaOpen, setIsClassificaOpen] = useState(false);
  const [isArchivioOpen, setIsArchivioOpen] = useState(false);

  useEffect(() => {
    if (teamModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [teamModal]);

  const fetchMeteo = async () => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,weather_code,is_day&timezone=Europe%2FRome&past_days=14`);
      if (!res.ok) return;
      const data = await res.json();
      const parsedMeteo: Record<string, { temp: number; emoji: string }> = {};
      data.hourly.time.forEach((timeStr: string, idx: number) => {
        const [, month, dayAndHour] = timeStr.split('-');
        const [day, hourStr] = dayAndHour.split('T');
        const hour = parseInt(hourStr.split(':')[0], 10);
        const key = `${day}/${month}-${hour}`;
        const temp = Math.round(data.hourly.temperature_2m[idx]);
        const code = data.hourly.weather_code[idx];
        const isDay = data.hourly.is_day[idx] === 1;
        parsedMeteo[key] = { temp, emoji: getWeatherEmoji(code, isDay) };
      });
      setMeteoData(parsedMeteo);
    } catch (err) {
      console.error("Errore recupero meteo:", err);
    }
  };

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
          const isTavolino = stato === 'TAVOLINO' || stato === 'ANNULLATA';

          listaPartite.push({ 
            dataMatch, sA, sB, golA, golB, 
            orario: row[7] || 'Da definire',
            dettagliA: row[8] ? row[8].toString().trim() : '',   
            dettagliB: row[9] ? row[9].toString().trim() : '',   
            mvp: row[10] ? row[10].toString().trim() : '',
            doppiA: row[11] ? row[11].toString().trim() : '', 
            doppiB: row[12] ? row[12].toString().trim() : '',
            stato, isTavolino
          });

          if (stato === 'LIVE' || stato === 'HT') {
            liveTeams.add(sA);
            liveTeams.add(sB);
          }

          if (golA === null || golB === null) continue;
          [sA, sB].forEach(s => { if (!dizionarioClassifica[s]) dizionarioClassifica[s] = { name: s, punti: 0, giocate: 0, vinte: 0, nulle: 0, perse: 0, gf: 0, gs: 0, dr: 0 }; });
          
          // Classifica valida solo per i gironi
          if (DATE_GIRONI.includes(dataMatch)) {
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
    fetchMeteo(); 
    const intervalData = setInterval(() => { loadAllData(true); }, 45000); 
    const intervalMeteo = setInterval(() => { fetchMeteo(); }, 3600000);
    return () => { clearInterval(intervalData); clearInterval(intervalMeteo); };
  }, []);

  const getMatchMeteo = (dataMatch: string, orario: string) => {
    if (!orario || orario === 'Da definire') return null;
    const hour = parseInt(orario.split(':')[0], 10);
    if (isNaN(hour)) return null;
    return meteoData[`${dataMatch}-${hour}`] || null;
  };

  // --- FUNZIONI DI RENDER SCHEDE PARTITA CON OPZIONE "GRAND FINAL" ---
  const renderRealMatch = (p: any, uniqueKey: string, forcedLabel?: string, isGrandFinal: boolean = false) => {
    const isGiocata = p.golA !== null && p.golB !== null;
    const hasDetails = Boolean(p.dettagliA || p.dettagliB || p.doppiA || p.doppiB || p.mvp);
    const matchId = `${p.dataMatch}-${p.sA}-${p.sB}-${uniqueKey}`;
    const isExpanded = isGiocata && (toggledMatches[matchId] !== undefined ? toggledMatches[matchId] : hasDetails);
    
    const isLive = p.stato === 'LIVE';
    const isHT = p.stato === 'HT';
    const isTavolino = p.isTavolino;
    const isMatchActive = isLive || isHT;
    const matchWeather = getMatchMeteo(p.dataMatch, p.orario);

    // Etichetta Automatica se non forzata (AGGIORNATO A 'Finale')
    let faseEtichetta = forcedLabel || 'Girone Unico';
    if (!forcedLabel) {
      if (p.dataMatch === '08/07') faseEtichetta = 'Semifinale';
      if (p.dataMatch === '10/07') {
        faseEtichetta = p.orario.startsWith('21') ? 'Finale 3°/4° Posto' : 'Finale';
      }
    }

    return (
      <div 
        key={matchId} 
        onClick={() => isGiocata && setToggledMatches(prev => ({...prev, [matchId]: !isExpanded}))}
        className={`flex flex-col relative w-full h-fit rounded-2xl transition-colors duration-200 
        ${isGrandFinal ? 'p-5 md:p-8 bg-gradient-to-br from-zinc-900 to-zinc-800 border-2' : 'p-4 md:p-5 bg-zinc-900 border'} 
        ${isGiocata ? 'cursor-pointer hover:bg-zinc-800' : ''} 
        ${isExpanded && !isTavolino 
          ? (isGrandFinal ? 'border-[#ffea00] shadow-[0_0_40px_rgba(255,234,0,0.2)]' : 'border-[#ffea00]/30 shadow-lg shadow-[#ffea00]/5') 
          : isTavolino 
            ? 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] opacity-80 bg-purple-900/10' 
            : (isGrandFinal ? 'border-[#ffea00]/60 shadow-[0_0_20px_rgba(255,234,0,0.15)]' : 'border-white/5')
        } 
        ${isLive ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : isHT ? 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : ''}`}
      >
        <div className={`flex justify-between items-center font-mono tracking-wider uppercase mb-4 ${isGrandFinal ? 'text-xs md:text-sm text-[#ffea00]' : 'text-[10px] text-zinc-500'}`}>
          <span className="font-bold">{faseEtichetta} • {p.dataMatch}</span>
          <div className="flex items-center gap-2">
            {matchWeather && (
              <span className={`font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border ${isGrandFinal ? 'bg-[#ffea00]/10 text-white border-[#ffea00]/20' : 'bg-white/5 text-zinc-300 border-white/5'}`}>
                <span>{matchWeather.emoji}</span><span>{matchWeather.temp}°C</span>
              </span>
            )}
            {isGiocata && !isMatchActive && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded tracking-normal ${isGrandFinal ? 'text-zinc-300 bg-white/10' : 'text-zinc-400 bg-white/5'}`}>
                {isExpanded ? '▲ Chiudi' : '▼ Dettagli'}
              </span>
            )}
            <span className={`${isTavolino ? 'text-purple-400/80' : isGrandFinal ? 'text-[#ffea00]' : 'text-[#ffea00]/80'} font-bold hidden sm:inline`}>📍 L. Paolucci</span>
          </div>
        </div>
        
        <div className={`flex items-center justify-between gap-2 sm:gap-4 ${isTavolino ? 'grayscale-[30%]' : ''}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 flex-1 min-w-0 text-left">
            <img loading="lazy" src={getLogoPath(p.sA)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} className={`object-contain shrink-0 ${isGrandFinal ? 'w-10 h-10 md:w-16 md:h-16 drop-shadow-lg' : 'w-6 h-6 md:w-8 md:h-8'}`} />
            <span className={`text-white uppercase leading-tight line-clamp-2 sm:line-clamp-none break-words ${isGrandFinal ? 'text-sm sm:text-lg md:text-2xl font-black tracking-wide' : 'text-[10px] sm:text-xs md:text-sm font-bold'}`}>
              {p.sA}
            </span>
          </div>

          {isMatchActive ? (
            <div className={`flex flex-col items-center shrink-0 ${isGrandFinal ? 'w-[90px] sm:w-[120px]' : 'w-[70px] sm:w-[90px]'}`}>
              {isLive ? (
                <div className="bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse mb-1">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"></span>LIVE
                </div>
              ) : (
                <div className="bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                  ⏱️ HT
                </div>
              )}
              {isGiocata && (
                <div className={`font-mono font-bold text-[#ffea00] leading-none ${isGrandFinal ? 'text-2xl md:text-4xl' : 'text-sm md:text-base'}`}>
                  {p.golA} - {p.golB}
                </div>
              )}
            </div>
          ) : isGiocata ? (
            <div className={`flex flex-col items-center shrink-0 ${isGrandFinal ? 'w-[90px] sm:w-[120px]' : 'w-[70px] sm:w-[90px]'}`}>
              {isTavolino && (
                 <div className="bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1 whitespace-nowrap">
                   TAVOLINO
                 </div>
              )}
              <div className={`flex items-center justify-center gap-2 md:gap-3 bg-black/50 rounded-xl border font-mono font-bold w-full ${isTavolino ? 'text-purple-400 border-purple-500/20' : 'text-[#ffea00] border-white/10'} ${isGrandFinal ? 'px-3 py-2 md:px-4 md:py-3 text-lg md:text-3xl shadow-inner' : 'px-2 py-1.5 sm:px-3 text-xs md:text-base'}`}>
                <span>{p.golA}</span><span className={`text-zinc-600 ${isGrandFinal ? 'text-base md:text-xl' : 'text-xs'}`}>-</span><span>{p.golB}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`bg-[#ffea00]/10 border border-[#ffea00]/20 rounded-xl text-center font-mono font-bold text-[#ffea00] whitespace-nowrap ${isGrandFinal ? 'px-3 py-1.5 text-[11px] md:text-sm shadow-[0_0_15px_rgba(255,234,0,0.1)]' : 'px-2 py-1 text-[9px] sm:text-[11px]'}`}>
                ⏱️ {p.orario}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center justify-end gap-2 md:gap-3 flex-1 min-w-0 text-right">
            <span className={`text-white uppercase leading-tight line-clamp-2 sm:line-clamp-none break-words ${isGrandFinal ? 'text-sm sm:text-lg md:text-2xl font-black tracking-wide' : 'text-[10px] sm:text-xs md:text-sm font-bold'}`}>
              {p.sB}
            </span>
            <img loading="lazy" src={getLogoPath(p.sB)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} className={`object-contain shrink-0 ${isGrandFinal ? 'w-10 h-10 md:w-16 md:h-16 drop-shadow-lg' : 'w-6 h-6 md:w-8 md:h-8'}`} />
          </div>
        </div>

        {isGiocata && (
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              {isTavolino ? (
                <div className={`mt-4 pt-3 border-t border-purple-500/20 text-center text-purple-400/80 font-mono ${isGrandFinal ? 'text-xs' : 'text-[10px]'}`}>
                  Partita annullata e assegnata a tavolino (3-0).
                </div>
              ) : hasDetails ? (
                <div className={`mt-4 pt-4 border-t ${isGrandFinal ? 'border-white/10 text-xs sm:text-sm space-y-5' : 'border-white/5 text-[11px] space-y-4'} font-mono`}>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-1">
                    <div className="border-r border-white/5 pr-2 space-y-2">
                      <p className="text-zinc-300 font-medium whitespace-pre-line leading-relaxed">{p.dettagliA || '-'}</p>
                      {p.doppiA && (
                        <div className="mt-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-1.5 md:p-2 inline-block text-left max-w-full">
                          <span className={`text-fuchsia-400 font-bold uppercase tracking-wider block mb-0.5 ${isGrandFinal ? 'text-[9px]' : 'text-[8px]'}`}> GOL DOPPI</span>
                          <p className="text-fuchsia-300 font-bold whitespace-pre-line leading-normal">{p.doppiA}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="pl-1 space-y-2 text-right flex flex-col items-end">
                      <p className="text-zinc-300 font-medium whitespace-pre-line leading-relaxed w-full">{p.dettagliB || '-'}</p>
                      {p.doppiB && (
                        <div className="mt-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-1.5 md:p-2 inline-block text-right max-w-full">
                          <span className={`text-fuchsia-400 font-bold uppercase tracking-wider block mb-0.5 ${isGrandFinal ? 'text-[9px]' : 'text-[8px]'}`}>GOL DOPPI</span>
                          <p className="text-fuchsia-300 font-bold whitespace-pre-line leading-normal">{p.doppiB}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {p.mvp && (
                    <div className={`bg-[#ffea00]/5 border border-[#ffea00]/10 rounded-xl flex items-center justify-between gap-2 ${isGrandFinal ? 'p-3 md:p-4' : 'p-2.5'}`}>
                      <span className={`uppercase tracking-wider text-[#ffea00]/80 font-bold ${isGrandFinal ? 'text-[10px] md:text-xs' : 'text-[9px]'}`}>⭐ MVP</span>
                      <span className={`text-white font-bold uppercase tracking-wide ${isGrandFinal ? 'text-xs md:text-sm' : 'text-[10px] sm:text-xs'}`}>{p.mvp}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`mt-4 pt-3 border-t border-white/5 text-center text-zinc-500 font-mono italic ${isGrandFinal ? 'text-xs' : 'text-[10px]'}`}>
                  Nessun dettaglio disponibile
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPlaceholder = (data: string, match: any, idx: number, isGrandFinal: boolean = false) => {
    const matchWeather = getMatchMeteo(data, match.orario);
    return (
      <div key={`ph-${idx}`} className={`flex flex-col rounded-2xl border-dashed h-fit backdrop-blur-sm w-full 
        ${isGrandFinal ? 'p-6 md:p-10 border-2 border-[#ffea00]/40 shadow-[0_0_30px_rgba(255,234,0,0.1)] bg-zinc-900/60' : 'p-5 bg-zinc-900/30 border border-white/10'}`}>
        <div className={`flex justify-between items-center font-mono tracking-wider uppercase mb-4 md:mb-6 ${isGrandFinal ? 'text-xs md:text-sm text-[#ffea00]' : 'text-[10px] text-zinc-500'}`}>
          <span className="font-bold">{match.fase} • {data}</span>
          <div className="flex items-center gap-2">
            {matchWeather && (
              <span className={`font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border ${isGrandFinal ? 'bg-[#ffea00]/10 text-white border-[#ffea00]/20' : 'bg-white/5 text-zinc-300 border-white/5'}`}>
                <span>{matchWeather.emoji}</span><span>{matchWeather.temp}°C</span>
              </span>
            )}
            <span className="hidden sm:inline">L. Paolucci</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 text-left opacity-40">
            <div className={`rounded-full bg-black/50 border border-white/10 shrink-0 ${isGrandFinal ? 'w-10 h-10 md:w-16 md:h-16' : 'w-6 h-6 md:w-8 md:h-8'}`}></div>
            <span className={`font-bold text-zinc-300 uppercase line-clamp-2 ${isGrandFinal ? 'text-xs sm:text-base md:text-xl' : 'text-[10px] sm:text-sm'}`}>Da definire</span>
          </div>
          <div className={`bg-[#ffea00]/5 border border-[#ffea00]/10 rounded-xl text-center font-mono font-bold text-[#ffea00]/40 whitespace-nowrap shrink-0 ${isGrandFinal ? 'px-3 py-1.5 text-[11px] md:text-sm' : 'px-2 py-1 text-[9px] sm:text-[11px]'}`}>
            ⏱️ {match.orario}
          </div>
          <div className="flex items-center justify-end gap-2 md:gap-3 flex-1 min-w-0 text-right opacity-40">
            <span className={`font-bold text-zinc-300 uppercase line-clamp-2 ${isGrandFinal ? 'text-xs sm:text-base md:text-xl' : 'text-[10px] sm:text-sm'}`}>Da definire</span>
            <div className={`rounded-full bg-black/50 border border-white/10 shrink-0 ${isGrandFinal ? 'w-10 h-10 md:w-16 md:h-16' : 'w-6 h-6 md:w-8 md:h-8'}`}></div>
          </div>
        </div>
        <div className={`mt-6 pt-4 border-t border-dashed ${isGrandFinal ? 'border-white/10' : 'border-white/5'} text-center`}>
          <span className={`font-mono uppercase tracking-widest text-zinc-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 inline-flex items-center gap-2 ${isGrandFinal ? 'text-[10px] md:text-xs' : 'text-[9px] sm:text-[10px]'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse"></span>
            In attesa sorteggi
          </span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center text-zinc-400 py-12 font-mono animate-pulse">Sincronizzazione...</div>;

  const partiteSemifinali = partite.filter(p => p.dataMatch === '08/07');
  const partiteFinali = partite.filter(p => p.dataMatch === '10/07');
  
  // Smistamento logico delle finali (in base all'orario)
  let match34 = null;
  let match12 = null;
  if (partiteFinali.length > 0) {
    const sorted = [...partiteFinali].sort((a, b) => a.orario.localeCompare(b.orario));
    if (sorted.length === 2) {
      match34 = sorted[0]; // La prima (21:00)
      match12 = sorted[1]; // La seconda (22:00)
    } else if (sorted.length === 1) {
      if (sorted[0].orario.startsWith('22')) match12 = sorted[0];
      else match34 = sorted[0];
    }
  }

  const partiteGironeCorrente = partite.filter(p => p.dataMatch === dataGironeAttiva);
  const marcatoriVisibili = showAllScorers ? marcatori : marcatori.slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 space-y-16 pb-12 overflow-hidden">
      
      {/* HEADER */}
      <div className="text-center space-y-6 pt-6">
        <CountdownTimer />
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#cca100] via-[#ffea00] to-[#cca100] drop-shadow-[0_4px_15px_rgba(255,234,0,0.2)]">
          Fase Finale
        </h1>
      </div>

      {/* TABELLONE FASI FINALI */}
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* SEMIFINALI - 08/07 (Affiancate) */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider pl-2 border-l-4 border-[#ffea00]">
            Semifinali <span className="text-zinc-500 text-sm ml-2">08/07</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {partiteSemifinali.length > 0 
              ? partiteSemifinali.map((p, idx) => renderRealMatch(p, `semi-${idx}`))
              : [{ fase: 'Semifinale 1', orario: '21:00' }, { fase: 'Semifinale 2', orario: '22:00' }].map((m, i) => renderPlaceholder('08/07', m, i))
            }
          </div>
        </div>

        {/* FINALI - 10/07 (Verticali, con focus su 1°/2° Posto) */}
        <div className="space-y-6 md:space-y-8">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider pl-2 border-l-4 border-[#ffea00]">
            Finali <span className="text-zinc-500 text-sm ml-2">10/07</span>
          </h2>
          
          <div className="flex flex-col gap-8 md:gap-12">
            {/* FINALE 1°/2° POSTO (GRAND FINAL) */}
            <div className="flex flex-col items-center w-full relative">
               <div className="absolute -top-3 md:-top-4 z-10 bg-[#ffea00] text-black px-4 py-1 md:px-6 md:py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,234,0,0.4)] animate-pulse">
                  👑 Finalissima 👑
               </div>
               {match12 
                  ? renderRealMatch(match12, 'fin-12', 'Finale', true) 
                  : renderPlaceholder('10/07', { fase: 'Finale', orario: '22:00' }, 1, true)
               }
            </div>

            {/* FINALE 3°/4° POSTO */}
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center relative">
               <div className="w-0.5 h-6 md:h-10 bg-gradient-to-b from-white/10 to-transparent absolute -top-6 md:-top-10"></div>
               {match34 
                  ? renderRealMatch(match34, 'fin-34', 'Finale 3°/4° Posto', false) 
                  : renderPlaceholder('10/07', { fase: 'Finale 3°/4° Posto', orario: '21:00' }, 0, false)
               }
            </div>
          </div>
        </div>

      </div>

      {/* SEZIONE CLASSIFICA A SCOMPARSA ANIMATA */}
      <div className="max-w-4xl mx-auto border-t border-white/10 pt-8">
        <div className={`group bg-zinc-900/50 border border-white/10 rounded-2xl md:rounded-3xl shadow-xl w-full transition-colors duration-300 ${isClassificaOpen ? 'bg-zinc-900' : ''}`}>
          <div 
            className="p-4 md:p-6 cursor-pointer flex items-center justify-between"
            onClick={() => setIsClassificaOpen(!isClassificaOpen)}
          >
            <div>
              <h2 className={`text-lg md:text-xl font-display font-black uppercase tracking-wider transition-colors ${isClassificaOpen ? 'text-[#ffea00]' : 'text-white group-hover:text-[#ffea00]'}`}>
                Classifica Definitiva Gironi
              </h2>
              <p className="text-[10px] md:text-xs font-mono text-zinc-500 mt-1">Clicca per visualizzare l'esito della prima fase</p>
            </div>
            <div className={`text-zinc-400 transition-transform duration-300 ${isClassificaOpen ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </div>
          
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isClassificaOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-3 md:p-6 pt-0 md:pt-0 border-t border-white/5 mt-2">
                <div className="w-full overflow-x-auto pb-4">
                  <table className="w-full text-left text-[10px] sm:text-xs md:text-sm font-mono text-zinc-400 min-w-[500px]">
                    <thead>
                      <tr className="text-zinc-600 uppercase border-b border-white/5">
                        <th className="pb-2 font-bold w-[20px]">#</th>
                        <th className="pb-2 pl-1 md:pl-2">Squadra</th>
                        <th className="pb-2 text-center font-bold text-[#ffea00]/80">Pt</th>
                        <th className="pb-2 text-center">G</th>
                        <th className="pb-2 text-center">V</th>
                        <th className="pb-2 text-center">N</th>
                        <th className="pb-2 text-center hidden sm:table-cell">P</th>
                        <th className="pb-2 text-center">DR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {classifica.map((s: any, idx: number) => {
                        const isPlaying = squadreInCampo.has(s.name);
                        return (
                          <tr key={idx} className={`transition-colors ${isPlaying ? 'bg-red-500/5 relative' : idx < 4 ? 'bg-[#ffea00]/[0.02]' : ''}`}>
                            <td className={`py-2.5 font-bold ${idx < 4 ? 'text-[#ffea00]' : 'text-zinc-500'}`}>
                              {isPlaying && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}
                              {idx + 1}
                            </td>
                            <td 
                              className="py-2.5 pl-1 md:pl-2 font-bold text-white uppercase truncate max-w-[150px] md:max-w-[200px] cursor-pointer group/team"
                              onClick={() => setTeamModal(s.name)}
                            >
                              <div className="flex items-center gap-1.5 md:gap-2">
                                <img loading="lazy" src={getLogoPath(s.name)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain shrink-0 group-hover/team:scale-110 transition-transform" />
                                <span className="truncate border-b border-dashed border-transparent group-hover/team:border-[#ffea00]/60 group-hover/team:text-[#ffea00] transition-colors">{s.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 text-center font-black text-sm md:text-base text-[#ffea00]">{s.punti}</td>
                            <td className="py-2.5 text-center">{s.giocate}</td>
                            <td className="py-2.5 text-center">{s.vinte}</td>
                            <td className="py-2.5 text-center">{s.nulle}</td>
                            <td className="py-2.5 text-center hidden sm:table-cell">{s.perse}</td>
                            <td className={`py-2.5 text-center font-bold ${s.dr > 0 ? 'text-green-400' : s.dr < 0 ? 'text-red-400' : ''}`}>{s.dr > 0 ? `+${s.dr}` : s.dr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase font-mono text-zinc-500">
                    <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded bg-[#ffea00]/20 border border-[#ffea00]/40"></span><span>Top 4: Qualificate alle Semifinali</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEZIONE GIRONI A SCOMPARSA ANIMATA */}
      <div className="max-w-4xl mx-auto">
        <div className={`group bg-zinc-900/30 border border-white/10 rounded-2xl md:rounded-3xl shadow-xl w-full transition-colors duration-300 ${isArchivioOpen ? 'bg-zinc-900' : ''}`}>
          <div 
            className="p-4 md:p-6 cursor-pointer flex items-center justify-between"
            onClick={() => setIsArchivioOpen(!isArchivioOpen)}
          >
            <div>
              <h2 className={`text-lg md:text-xl font-display font-bold uppercase tracking-wider transition-colors ${isArchivioOpen ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                Archivio Fase a Gironi
              </h2>
              <p className="text-[10px] md:text-xs font-mono text-zinc-500 mt-1">Sfoglia tutte le partite della prima fase</p>
            </div>
            <div className={`text-zinc-500 transition-transform duration-300 ${isArchivioOpen ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </div>
          
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isArchivioOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-3 md:p-6 pt-2 md:pt-4 border-t border-white/5 space-y-6">
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  {DATE_GIRONI.map((data) => (
                    <button key={data} onClick={() => setDataGironeAttiva(data)} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-display font-bold text-[10px] md:text-xs uppercase tracking-widest transition-colors ${dataGironeAttiva === data ? 'bg-zinc-700 text-white shadow-lg shadow-black/20' : 'bg-zinc-900/80 text-zinc-500 border border-white/5 hover:bg-zinc-800 hover:text-zinc-300'}`}>
                      {data}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {partiteGironeCorrente.length > 0 ? (
                    partiteGironeCorrente.map((p, idx) => renderRealMatch(p, `girone-${idx}`))
                  ) : (
                    <>
                      {dataGironeAttiva === '01/07' && (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-6 md:p-10 bg-zinc-900/60 rounded-3xl border border-blue-500/20 text-center">
                          <span className="text-4xl md:text-5xl mb-4 opacity-90 drop-shadow-lg">⛈️</span>
                          <h3 className="text-blue-400 font-display font-black uppercase text-xl md:text-2xl tracking-widest mb-3">Partite Rinviate</h3>
                          <p className="text-zinc-400 font-mono text-xs md:text-sm leading-relaxed max-w-md">
                            A causa delle avverse condizioni meteo, le partite in programma per questa data sono state posticipate al <strong className="text-white bg-white/10 px-2 py-0.5 rounded ml-1">07/07</strong>.
                          </p>
                        </div>
                      )}
                      {dataGironeAttiva !== '01/07' && (
                        <div className="col-span-1 md:col-span-2 text-center text-zinc-600 text-xs font-mono py-8 italic">
                          Nessuna partita trovata per questa data.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE POP-UP SQUADRA */}
      {teamModal && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          style={{ animation: 'fadeInModal 0.2s ease-out forwards' }}
          onClick={() => setTeamModal(null)}
        >
          <style>{`
            @keyframes fadeInModal { from { opacity: 0; } to { opacity: 1; } }
            @keyframes popUpModal { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          `}</style>
          
          <div 
            className="bg-zinc-900 border border-[#ffea00]/20 rounded-3xl p-6 w-full max-w-sm relative shadow-[0_0_50px_rgba(255,234,0,0.15)] max-h-[90vh] overflow-y-auto"
            style={{ animation: 'popUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setTeamModal(null)} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl p-1 font-mono transition-colors"
            >
              ✕
            </button>
            
            <div className="flex flex-col items-center space-y-4 text-center mt-2">
              <img 
                src={getLogoPath(teamModal)} 
                alt={teamModal} 
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} 
                className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
              />
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-wider">
                {teamModal}
              </h3>
              
              {classifica.filter(s => s.name === teamModal).map(s => (
                <div key={s.name} className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-white/5">
                  <div className="bg-black/40 rounded-xl p-2 border border-white/5">
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">Punti</p>
                    <p className="text-xl font-black text-[#ffea00]">{s.punti}</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-2 border border-white/5">
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">Gol Fatti</p>
                    <p className="text-xl font-black text-white">{s.gf}</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-2 border border-white/5">
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">Vittorie</p>
                    <p className="text-xl font-black text-green-400">{s.vinte}</p>
                  </div>
                </div>
              ))}
              
              <a 
                href={`/squadre?team=${encodeURIComponent(teamModal)}`} 
                className="mt-6 flex items-center justify-center w-full py-3.5 bg-[#ffea00] text-black font-bold font-mono text-xs uppercase tracking-widest rounded-xl hover:bg-[#cca100] transition-colors shadow-lg shadow-[#ffea00]/20"
              >
                Esplora Rosa Completa →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CLASSIFICA MARCATORI */}
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider text-center">🏆 Classifica Marcatori</h2>
        <div className="grid gap-2.5 md:gap-3">
          {marcatoriVisibili.length === 0 ? (
            <p className="text-center text-zinc-600 text-xs py-4 italic">In attesa dei primi gol...</p>
          ) : (
            marcatoriVisibili.map((m: any, idx: number) => {
              const teamColor = COLOR_MAP[m.squadra] || 'rgba(24, 24, 27, 0.6)';
              const teamLogo = getLogoPath(m.squadra);

              return (
                <div 
                  key={idx} 
                  className="relative overflow-hidden rounded-xl md:rounded-2xl border border-white/5 transition-transform hover:scale-[1.01]"
                  style={{ backgroundColor: teamColor }}
                >
                  <div 
                    className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 opacity-[0.08] pointer-events-none grayscale brightness-200"
                    style={{ 
                      backgroundImage: `url(${teamLogo})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />

                  <div className="relative z-10 flex justify-between items-center p-3 md:p-4">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <span className={`text-base md:text-lg font-black shrink-0 ${idx === 0 ? 'text-[#ffea00]' : 'text-zinc-500'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-xs sm:text-sm md:text-base uppercase tracking-wide leading-tight truncate">
                          {m.nome}
                        </span>
                        <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                          <img 
                            loading="lazy"
                            decoding="async"
                            src={teamLogo} 
                            alt="" 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }}
                            className="w-3 h-3 md:w-3.5 md:h-3.5 object-contain shrink-0" 
                          />
                          <span className="text-[9px] md:text-[10px] font-mono uppercase text-zinc-300 tracking-widest truncate">
                            {m.squadra}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span className="text-[#ffea00] font-black text-lg md:text-xl leading-none">
                        {m.gol}
                      </span>
                      <span className="text-[8px] md:text-[9px] font-mono uppercase text-[#ffea00]/60 tracking-tighter">
                        GOL
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {marcatori.length > 10 && (
            <button
              onClick={() => setShowAllScorers(!showAllScorers)}
              className="mt-2 w-full py-3 md:py-4 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 font-mono text-[10px] md:text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              {showAllScorers ? (
                <>▲ Riduci lista</>
              ) : (
                <>▼ Mostra tutti ({marcatori.length})</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}