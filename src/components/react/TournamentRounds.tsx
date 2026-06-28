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

// Mappatura colori per la classifica marcatori
const COLOR_MAP: Record<string, string> = {
  'Godo Glimt': 'rgba(204, 161, 0, 0.15)',        // Giallo scuro
  'Sold Out': 'rgba(127, 0, 0, 0.25)',           // Rosso scuro
  'Talamonti Garden': 'rgba(6, 78, 59, 0.25)',    // Verde
  'Bar Igloo': 'rgba(255, 255, 255, 0.08)',      // Bianco (faint)
  'ASD Polisportiva Forcese': 'rgba(30, 58, 138, 0.25)', // Blu
  'Edil Pennello Fc': 'rgba(3, 105, 161, 0.25)',  // Azzurro
  'Club': 'rgba(63, 63, 70, 0.4)',               // Grigio
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
    const response = await fetch(url);
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
  const [dataAttiva, setDataAttiva] = useState<string>('28/06');
  const dateTorneo = ['28/06', '29/06', '30/06', '01/07', '02/07', '03/07', '06/07'];

  useEffect(() => {
    async function loadAllData() {
      try {
        const [, rawPartite, rawMarcatori] = await Promise.all([
          fetchCsvData(URL_GIRONI),
          fetchCsvData(URL_PARTITE),    
          fetchCsvData(URL_MARCATORI)  
        ]);
        const dizionarioClassifica: any = {};
        SQUADRE_UFFICIALI.forEach(s => dizionarioClassifica[s] = { name: s, punti: 0, giocate: 0, vinte: 0, nulle: 0, perse: 0, gf: 0, gs: 0, dr: 0 });

        const listaPartite: any[] = [];
        if (Array.isArray(rawPartite)) {
          for (const row of rawPartite) {
            if (!row[0] || !row[2] || !row[3]) continue;
            const dataMatch = row[0].toString().trim(); 
            const sA = row[2].toString().trim();
            const sB = row[3].toString().trim();
            const golA = row[4] !== undefined && row[4] !== '' ? Number(row[4]) : null;
            const golB = row[5] !== undefined && row[5] !== '' ? Number(row[5]) : null;
            const vO = row[6] ? row[6].toString().trim() : '';
            listaPartite.push({ dataMatch, squadra1: sA, squadra2: sB, golsquadra1: golA, golsquadra2: golB, orario: row[7] || 'Da definire' });

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

        const listaMarcatori: any[] = [];
        if (Array.isArray(rawMarcatori)) {
          for (const row of rawMarcatori) {
            if (!row[0] || row[2] === undefined || row[2] === '') continue;
            listaMarcatori.push({ nome: row[0].toString().trim(), squadra: row[1] ? row[1].toString().trim() : '-', gol: Number(row[2]) });
          }
        }
        setPartite(listaPartite);
        setMarcatori(listaMarcatori.sort((a, b) => b.gol - a.gol));
        setLoading(false);
      } catch (err) { setLoading(false); }
    }
    loadAllData();
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
          {dateTorneo.map((data) => (
            <button key={data} onClick={() => setDataAttiva(data)} className={`px-4 py-2 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all ${dataAttiva === data ? 'bg-[#ffea00] text-black shadow-lg shadow-[#ffea00]/20' : 'bg-zinc-900/80 text-zinc-400 border border-white/5 hover:bg-zinc-800'}`}>
              {data}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          {partiteFiltrate.map((p, idx) => (
            <div key={idx} className="flex flex-col justify-between p-5 bg-zinc-900/60 rounded-2xl border border-white/5 backdrop-blur-sm space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                <span>Girone Unico • {p.dataMatch}</span>
                <span className="text-[#ffea00]/80 font-bold">📍 MKC Arena</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-5/12 min-w-0">
                  <img src={getLogoPath(p.squadra1)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0" />
                  <span className="text-xs md:text-sm font-bold text-white uppercase truncate">{p.squadra1}</span>
                </div>
                {p.golsquadra1 !== null ? (
                  <div className="flex items-center gap-2.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 font-mono font-bold text-[#ffea00] text-xs md:text-sm shrink-0">
                    <span>{p.golsquadra1}</span><span className="text-zinc-600 text-xs">-</span><span>{p.golsquadra2}</span>
                  </div>
                ) : (
                  <div className="bg-[#ffea00]/10 border border-[#ffea00]/20 px-2.5 py-1 rounded-xl text-center font-mono text-[11px] font-bold text-[#ffea00] whitespace-nowrap shrink-0">⏱️ {p.orario}</div>
                )}
                <div className="flex items-center justify-end gap-2 w-5/12 min-w-0 text-right">
                  <span className="text-xs md:text-sm font-bold text-white uppercase truncate">{p.squadra2}</span>
                  <img src={getLogoPath(p.squadra2)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLASSIFICA GENERALE */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-display font-black text-white text-center uppercase tracking-wider">Classifica Generale</h2>
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4 md:p-6 backdrop-blur-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm font-mono text-zinc-400 min-w-[500px]">
              <thead>
                <tr className="text-zinc-600 uppercase text-[10px] md:text-xs border-b border-white/5">
                  <th className="pb-3 pl-2">Pos</th><th className="pb-3">Squadra</th><th className="pb-3 text-center">Punti</th><th className="pb-3 text-center">G</th><th className="pb-3 text-center">V</th><th className="pb-3 text-center">N</th><th className="pb-3 text-center">P</th><th className="pb-3 text-center">DR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {classifica.map((s: any, idx: number) => (
                  <tr key={idx} className={`transition-colors ${idx < 4 ? 'bg-[#ffea00]/[0.02]' : ''}`}>
                    <td className={`py-3 pl-2 font-bold ${idx < 4 ? 'text-[#ffea00]' : 'text-zinc-500'}`}>#{idx + 1}</td>
                    <td className="py-3 font-bold text-white uppercase truncate max-w-[160px]">
                      <div className="flex items-center gap-2">
                        <img src={getLogoPath(s.name)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }} className="w-4 h-4 object-contain" />
                        <span className="truncate">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center font-black text-base text-[#ffea00]">{s.punti}</td>
                    <td className="py-3 text-center">{s.giocate}</td><td className="py-3 text-center">{s.vinte}</td><td className="py-3 text-center">{s.nulle}</td><td className="py-3 text-center">{s.perse}</td>
                    <td className={`py-3 text-center font-bold ${s.dr > 0 ? 'text-green-400' : s.dr < 0 ? 'text-red-400' : ''}`}>{s.dr > 0 ? `+${s.dr}` : s.dr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] uppercase font-mono text-zinc-500 pl-2">
            <span className="w-2.5 h-2.5 rounded bg-[#ffea00]/20 border border-[#ffea00]/40"></span><span>Top 4: Semifinali</span>
          </div>
        </div>
      </div>

      {/* CLASSIFICA MARCATORI (MODIFICATA CON COLORI E LOGHI SFONDO) */}
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider text-center"> Classifica Marcatori</h2>
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
                  className="relative overflow-hidden rounded-2xl border border-white/5 backdrop-blur-md transition-transform hover:scale-[1.01]"
                  style={{ backgroundColor: teamColor }}
                >
                  {/* Logo in Filigrana sullo Sfondo */}
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
                        <span className="text-white font-bold text-sm md:text-base truncate uppercase tracking-wide">
                          {m.nome}
                        </span>
                        <div className="flex items-center gap-2">
                          <img 
                            src={teamLogo} 
                            alt="" 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }}
                            className="w-3.5 h-3.5 object-contain" 
                          />
                          <span className="text-[10px] font-mono uppercase text-zinc-300 tracking-widest truncate">
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