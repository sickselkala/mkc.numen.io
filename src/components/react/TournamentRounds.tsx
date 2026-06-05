import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// I tuoi link reali presi da "Pubblica sul web"
const URL_GIRONI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=0&single=true&output=csv'; 
const URL_PARTITE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=1934217749&single=true&output=csv';
const URL_MARCATORI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=1767066330&single=true&output=csv';

async function fetchCsvData(url: string): Promise<any[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Errore di caricamento: ${url} (Status ${response.status})`);
      return [];
    }
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true
    });
    return parsed.data.slice(1) || []; 
  } catch (error) {
    console.error("Errore di rete durante il fetch CSV:", error);
    return [];
  }
}

// Componente per il Countdown Dinamico sintonizzato sul 28 Giugno alle 20:30
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

      const dStr = days > 0 ? `${days}g ` : '';
      const hStr = hours.toString().padStart(2, '0');
      const mStr = minutes.toString().padStart(2, '0');
      const sStr = seconds.toString().padStart(2, '0');

      setTimeLeft(`START TRA: ${dStr}${hStr}:${mStr}:${sStr}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-block bg-[#ffea00] text-black font-mono text-xs font-black tracking-widest uppercase px-5 py-2 rounded-xl shadow-lg shadow-[#ffea00]/10 border border-[#ffea00]">
      ⏳ {timeLeft}
    </div>
  );
}

export default function TournamentRounds() {
  const [loading, setLoading] = useState(true);
  const [gironiData, setGironiData] = useState<any>({});
  const [partite, setPartite] = useState<any[]>([]);
  const [marcatori, setMarcatori] = useState<any[]>([]);
  const [giornataAttiva, setGiornataAttiva] = useState<number>(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function loadAllData() {
      try {
        const [rawGironi, rawPartite, rawMarcatori] = await Promise.all([
          fetchCsvData(URL_GIRONI),    
          fetchCsvData(URL_PARTITE),   
          fetchCsvData(URL_MARCATORI)  
        ]);

        const classificheIniziali: any = {};

        // 1. GIRONI
        if (Array.isArray(rawGironi)) {
          for (const row of rawGironi) {
            if (!row[0] || !row[1]) continue;
            const gironeName = row[0].toString().trim();
            const squadraName = row[1].toString().trim();

            if (!classificheIniziali[gironeName]) {
              classificheIniziali[gironeName] = {};
            }
            classificheIniziali[gironeName][squadraName] = {
              punti: 0, giocate: 0, vinte: 0, nulle: 0, perse: 0, gf: 0, gs: 0, dr: 0
            };
          }
        }

        // 2. PARTITE
        const listaPartite: any[] = [];
        if (Array.isArray(rawPartite)) {
          for (const row of rawPartite) {
            if (!row[0] || !row[1] || !row[2] || !row[3]) continue;

            const giornata = Number(row[0]);
            const girone = row[1].toString().trim();
            const sA = row[2].toString().trim();
            const sB = row[3].toString().trim();
            
            if (isNaN(giornata)) continue;

            const haGolA = row[4] !== undefined && row[4].toString().trim() !== '';
            const haGolB = row[5] !== undefined && row[5].toString().trim() !== '';
            
            const golA = haGolA ? Number(row[4]) : null;
            const golB = haGolB ? Number(row[5]) : null;
            
            const vincenteOvertime = row[6] ? row[6].toString().trim() : '';
            const orario = row[7] ? row[7].toString().trim() : 'Da definire';

            listaPartite.push({ 
              giornata, 
              girone, 
              squadra1: sA, 
              squadra2: sB, 
              golsquadra1: golA, 
              golsquadra2: golB,
              orario
            });

            if (golA === null || golB === null || isNaN(golA) || isNaN(golB)) continue;

            if (!classificheIniziali[girone]) classificheIniziali[girone] = {};
            if (!classificheIniziali[girone][sA]) classificheIniziali[girone][sA] = { punti: 0, giocate: 0, vinte: 0, nulle: 0, perse: 0, gf: 0, gs: 0, dr: 0 };
            if (!classificheIniziali[girone][sB]) classificheIniziali[girone][sB] = { punti: 0, giocate: 0, vinte: 0, nulle: 0, perse: 0, gf: 0, gs: 0, dr: 0 };

            classificheIniziali[girone][sA].giocate += 1;
            classificheIniziali[girone][sB].giocate += 1;
            classificheIniziali[girone][sA].gf += golA;
            classificheIniziali[girone][sA].gs += golB;
            classificheIniziali[girone][sB].gf += golB;
            classificheIniziali[girone][sB].gs += golA;

            if (golA > golB) {
              classificheIniziali[girone][sA].punti += 3;
              classificheIniziali[girone][sA].vinte += 1;
              classificheIniziali[girone][sB].perse += 1;
            } else if (golA < golB) {
              classificheIniziali[girone][sB].punti += 3;
              classificheIniziali[girone][sB].vinte += 1;
              classificheIniziali[girone][sA].perse += 1;
            } else {
              if (vincenteOvertime === sA) {
                classificheIniziali[girone][sA].punti += 2;
                classificheIniziali[girone][sB].punti += 1;
              } else if (vincenteOvertime === sB) {
                classificheIniziali[girone][sB].punti += 2;
                classificheIniziali[girone][sA].punti += 1;
              } else {
                classificheIniziali[girone][sA].punti += 1;
                classificheIniziali[girone][sB].punti += 1;
              }
            }

            classificheIniziali[girone][sA].dr = classificheIniziali[girone][sA].gf - classificheIniziali[girone][sA].gs;
            classificheIniziali[girone][sB].dr = classificheIniziali[girone][sB].gf - classificheIniziali[girone][sB].gs;
          }
        }

        const gironiOrdinati: any = {};
        Object.keys(classificheIniziali).forEach(gName => {
          gironiOrdinati[gName] = Object.entries(classificheIniziali[gName])
            .map(([name, stats]: any) => ({ name, ...stats }))
            .sort((a, b) => b.punti - a.punti || b.dr - a.dr);
        });

        // 3. MARCATORI
        const listaMarcatori: any[] = [];
        if (Array.isArray(rawMarcatori)) {
          for (const row of rawMarcatori) {
            if (!row[0] || row[2] === undefined || row[2] === '') continue;
            listaMarcatori.push({
              nome: row[0].toString().trim(),
              squadra: row[1] ? row[1].toString().trim() : '-',
              gol: Number(row[2])
            });
          }
        }
        listaMarcatori.sort((a, b) => b.gol - a.gol);

        setGironiData(gironiOrdinati);
        setPartite(listaPartite);
        setMarcatori(listaMarcatori);
        setLoading(false);
      } catch (err) {
        console.error("Errore generale nell'applicazione:", err);
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  if (loading) {
    return <div className="text-center text-zinc-400 py-12 font-mono animate-pulse">Sincronizzazione tabelle in corso...</div>;
  }

  const partiteFiltrate = partite.filter(p => p.giornata === giornataAttiva);

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-16">
      
      {/* HEADER: CON EFFETTO COLPO DI LUCE CONTINUO SUL TITOLO */}
      <div className="text-center space-y-6 pt-6">
        <div>
          <CountdownTimer />
        </div>
        
        {/* BLOCCO ANIMAZIONE PERSONALIZZATO PER IL TAGLIO DI LUCE CROMATO */}
        <div className="relative inline-block">
          <style>{`
            @keyframes chromeShine {
              0% { background-position: 0% center; }
              100% { background-position: 200% center; }
            }
            .animate-chrome-shine {
              background-size: 200% auto;
              animation: chromeShine 5s linear infinite;
            }
          `}</style>
          
          <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#cca100] via-[#fffeb3] via-[#ffea00] via-[#fffeb3] to-[#cca100] animate-chrome-shine drop-shadow-[0_4px_15px_rgba(255,234,0,0.2)] pb-2">
            Gironi & Classifiche
          </h1>
        </div>
      </div>

      {/* GIORNATE */}
      <div className="space-y-6 text-center">
        <div className="flex justify-center gap-4">
          {[1, 2, 3].map((g) => (
            <button
              key={g}
              onClick={() => setGiornataAttiva(g)}
              className={`px-6 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all ${
                giornataAttiva === g ? 'bg-[#ffea00] text-black shadow-lg shadow-[#ffea00]/20' : 'bg-zinc-900/80 text-zinc-400 border border-white/5 hover:bg-zinc-800'
              }`}
            >
              Giornata {g}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          {partiteFiltrate.length === 0 ? (
            <div className="col-span-2 text-center text-zinc-500 font-mono text-xs py-6 bg-zinc-900/30 rounded-xl border border-white/5">
              // Nessun match inserito per la Giornata {giornataAttiva} nel foglio "partite"
            </div>
          ) : (
            partiteFiltrate.map((p, idx) => {
              const IsGiocata = p.golsquadra1 !== null && p.golsquadra2 !== null;

              return (
                <div key={idx} className="flex flex-col justify-between p-5 bg-zinc-900/60 rounded-2xl border border-white/5 backdrop-blur-sm space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-wider uppercase text-zinc-500">
                    <span>{p.girone}</span>
                    <span className="text-[#ffea00]/80 font-bold">📍 MKC Arena</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white uppercase tracking-wide truncate w-1/3">{p.squadra1}</span>
                    
                    {IsGiocata ? (
                      <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-xl border border-white/5 font-mono font-bold text-[#ffea00] text-sm">
                        <span>{p.golsquadra1}</span>
                        <span className="text-zinc-600 text-xs">-</span>
                        <span>{p.golsquadra2}</span>
                      </div>
                    ) : (
                      <div className="bg-[#ffea00]/10 border border-[#ffea00]/20 px-3 py-1 rounded-xl text-center font-mono text-xs font-bold text-[#ffea00] whitespace-nowrap">
                        ⏱️ {p.orario}
                      </div>
                    )}

                    <span className="text-sm font-bold text-white uppercase tracking-wide text-right truncate w-1/3">{p.squadra2}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* GIRONI */}
      <div className="space-y-8">
        <h2 className="text-2xl font-display font-black text-white text-center uppercase tracking-wider">Classifiche Generali</h2>
        {Object.keys(gironiData).length === 0 ? (
          <p className="text-center text-zinc-500 font-mono text-xs">In attesa che il torneo inizi...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Object.entries(gironiData).map(([nomeGirone, squadre]: any) => (
              <div key={nomeGirone} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                <h3 className="text-[#ffea00] font-display font-bold text-lg uppercase tracking-wide border-b border-white/5 pb-2">{nomeGirone}</h3>
                <table className="w-full text-left text-xs font-mono text-zinc-400">
                  <thead>
                    <tr className="text-zinc-600 uppercase text-[10px] border-b border-white/5">
                      <th className="pb-2">Squadra</th>
                      <th className="pb-2 text-center">Punti</th>
                      <th className="pb-2 text-center">G</th>
                      <th className="pb-2 text-center">DR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {squadre.map((s: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-bold text-white uppercase truncate max-w-[120px]">{s.name}</td>
                        <td className="py-2.5 text-center font-bold text-[#ffea00]">{s.punti}</td>
                        <td className="py-2.5 text-center">{s.giocate}</td>
                        <td className={`py-2.5 text-center ${s.dr > 0 ? 'text-green-400' : s.dr < 0 ? 'text-red-400' : ''}`}>{s.dr > 0 ? `+${s.dr}` : s.dr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MARCATORI */}
      <div className="max-w-2xl mx-auto bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
        <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2"> Classifica Marcatori</h2>
        <div className="divide-y divide-white/[0.03] font-mono text-sm text-zinc-300">
          {marcatori.length === 0 ? (
            <p className="text-center text-zinc-600 text-xs py-4">"In attesa che il torneo inizi"...</p>
          ) : (
            marcatori.map((m: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-2.5 px-2">
                <span className="text-white font-medium">#{idx + 1} {m.nome} <span className="text-zinc-500 text-xs">({m.squadra})</span></span>
                <span className="text-[#ffea00] font-black">{m.gol} GOL</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}