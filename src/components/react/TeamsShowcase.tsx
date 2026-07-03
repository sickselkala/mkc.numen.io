import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// IL TUO NUOVO FOGLIO CON LE ROSE 
const URL_GIOCATORI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9nQaHHo-bzfF-SZEbc8Xx6Zi38yBnjg32qF_E1Dbjl0PTgLT95qqkaiDX14Itz28xyyh0DTBgCx7d/pub?gid=2086636257&single=true&output=csv'; 
const URL_MARCATORI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwR6Zoknvo93RrtMTQM7oRHeCUfmPFAmLt7scaK88WG1_vcj9top8QITU9jTtAon1i5ali9bcMhyJH/pub?gid=1767066330&single=true&output=csv';

const SQUADRE_UFFICIALI = ['Edil Pennello Fc', 'Godo Glimt', 'ASD Polisportiva Forcese', 'Sold Out', 'Talamonti Garden', 'Bar Igloo', 'Club'];

function getLogoPath(squadraNome: string): string {
  if (!squadraNome) return '/assets/logo-big.jpg';
  const nomeTrimmed = squadraNome.trim();
  if (nomeTrimmed === 'Sold Out') return '/assets/soldoutl.png';
  const nomePulito = nomeTrimmed.toLowerCase().replace(/\s+/g, '');
  return `/assets/${nomePulito}.png`;
}

async function fetchCsvData(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return [];
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
    return parsed.data.slice(1) || []; 
  } catch (error) { return []; }
}

export default function TeamsShowcase() {
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [marcatoriMap, setMarcatoriMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Legge il parametro "?team=" dall'URL per aprire direttamente una squadra
    const params = new URLSearchParams(window.location.search);
    const teamParam = params.get('team');
    if (teamParam && SQUADRE_UFFICIALI.includes(teamParam)) {
      setActiveTeam(teamParam);
    }

    async function loadData() {
      const [rawGiocatori, rawMarcatori] = await Promise.all([
        fetchCsvData(URL_GIOCATORI),
        fetchCsvData(URL_MARCATORI)
      ]);

      // Mappa i marcatori per incrociarli con le rose
      const goalMap: Record<string, number> = {};
      if (Array.isArray(rawMarcatori)) {
        for (const row of rawMarcatori as any[][]) {
          if (!row[0] || !row[2]) continue;
          const nome = row[0].toString().trim().toUpperCase();
          goalMap[nome] = Number(row[2]);
        }
      }
      setMarcatoriMap(goalMap);

      // Mappa i giocatori e interpreta correttamente la tua Legenda
      const listaGiocatori: any[] = [];
      if (Array.isArray(rawGiocatori)) {
        for (const row of rawGiocatori as any[][]) {
          // row[0] = Ruolo | row[1] = Nome | row[2] = Squadra
          if (!row[1] || !row[2]) continue;
          
          let rawRuolo = row[0]?.toString().trim().toUpperCase() || 'G';
          
          // Seleziona i minorenni come giocatori standard per l'interfaccia
          if (rawRuolo === 'G(M)') {
            rawRuolo = 'G';
          }

          listaGiocatori.push({
            ruolo: rawRuolo,
            nome: row[1]?.toString().trim().toUpperCase(),
            squadra: row[2]?.toString().trim()
          });
        }
      }
      setPlayers(listaGiocatori);
      setLoading(false);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="text-center text-[#ffea00] py-12 font-mono animate-pulse tracking-widest">Caricamento Rose...</div>;

  // VISTA 1: GRIGLIA DI TUTTE LE SQUADRE
  if (!activeTeam) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {SQUADRE_UFFICIALI.map(team => (
          <div 
            key={team} 
            onClick={() => setActiveTeam(team)}
            className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800 hover:border-[#ffea00]/30 transition-all group"
          >
            <img src={getLogoPath(team)} alt={team} className="w-32 h-32 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500 mb-6" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }}/>
            <h3 className="text-xl font-display font-black text-white uppercase text-center tracking-wider">{team}</h3>
            <span className="mt-4 text-[10px] font-mono text-[#ffea00] uppercase tracking-widest bg-[#ffea00]/10 px-3 py-1.5 rounded-full border border-[#ffea00]/20 opacity-0 group-hover:opacity-100 transition-opacity">
              Vedi Rosa
            </span>
          </div>
        ))}
      </div>
    );
  }

  // VISTA 2: DETTAGLIO SQUADRA ATTIVA
  const teamPlayers = players.filter(p => p.squadra.toUpperCase() === activeTeam.toUpperCase());
  
  // Suddivisione in base alla tua legenda
  const presidenti = teamPlayers.filter(p => p.ruolo === 'P');
  const allenatori = teamPlayers.filter(p => p.ruolo === 'A');
  const giocatori = teamPlayers.filter(p => p.ruolo === 'G');

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Intestazione Squadra */}
      <div className="flex flex-col items-center text-center space-y-6">
        <button onClick={() => { setActiveTeam(null); window.history.pushState({}, '', '/squadre'); }} className="text-zinc-500 hover:text-white font-mono text-xs uppercase tracking-widest mb-4">
          ← Torna alle squadre
        </button>
        <img src={getLogoPath(activeTeam)} alt={activeTeam} className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(255,234,0,0.15)]" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo-big.jpg'; }}/>
        <h2 className="text-5xl font-display font-black text-white uppercase tracking-widest">{activeTeam}</h2>
      </div>

      {/* Componenti della Rosa */}
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Sezione Dirigenza / Presidente (P) */}
        {presidenti.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-[#ffea00] uppercase tracking-[0.3em] font-bold border-b border-white/10 pb-2">Dirigenza</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {presidenti.map((p, i) => (
                <div key={i} className="bg-zinc-900 border border-[#ffea00]/20 shadow-[0_0_15px_rgba(255,234,0,0.05)] rounded-2xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#ffea00]/10 text-[#ffea00] text-[10px] font-bold px-2 py-1 rounded font-mono border border-[#ffea00]/20">PRE</span>
                    <span className="font-bold text-white uppercase">{p.nome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sezione Staff Tecnico / Allenatore (A) */}
        {allenatori.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-[#ffea00] uppercase tracking-[0.3em] font-bold border-b border-white/10 pb-2">Staff Tecnico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allenatori.map((p, i) => (
                <div key={i} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded font-mono border border-blue-500/20">ALL</span>
                    <span className="font-bold text-white uppercase">{p.nome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sezione Giocatori (G e G(M)) */}
        {giocatori.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-[#ffea00] uppercase tracking-[0.3em] font-bold border-b border-white/10 pb-2">Giocatori</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {giocatori.map((p, i) => {
                const golFatti = marcatoriMap[p.nome] || 0;
                return (
                  <div key={i} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex justify-between items-center hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded font-mono border border-white/5">GIO</span>
                      <span className="font-bold text-white uppercase">{p.nome}</span>
                    </div>
                    
                    {/* Gol importati dinamicamente */}
                    {golFatti > 0 && (
                      <div className="flex items-center gap-1.5 bg-[#ffea00]/10 border border-[#ffea00]/20 px-2 py-1 rounded-lg">
                        <span className="text-xs">⚽</span>
                        <span className="text-[#ffea00] font-black font-mono text-sm">{golFatti}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}