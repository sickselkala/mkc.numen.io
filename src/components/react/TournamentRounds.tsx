import React, { useState } from 'react';
// IMPORTAZIONE CORRETTA DALLA ROOT DEL PROGETTO
import datiTorneoRaw from '../../torneo.json';

// Definiamo rigorosamente le interfacce per TypeScript
interface Partita {
  giornata: number;
  girone: string;
  casa: string;
  fuori: string;
  golCasa: number | null;
  golFuori: number | null;
}

interface Marcatore {
  nome: string;
  squadra: string;
  gol: number;
}

interface StrutturaTorneo {
  gironi: Record<string, string[]>;
  partite: Partita[];
  marcatori: Marcatore[];
}

// Forziamo il JSON a seguire la nostra struttura definita
const datiTorneo = datiTorneoRaw as unknown as StrutturaTorneo;

interface Statistiche {
  nome: string;
  g: number;
  v: number;
  n: number;
  p: number;
  gf: number;
  gs: number;
  dr: number;
  pt: number;
}

export default function TournamentRounds() {
  const [giornata, setGiornata] = useState(1);

  const infoColori = {
    "Girone A": { stile: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" },
    "Girone B": { stile: "border-amber-500/30 bg-amber-950/20 text-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/50" },
    "Girone C": { stile: "border-sky-500/30 bg-sky-950/20 text-sky-400", badge: "bg-sky-500/20 text-sky-300 border-sky-500/50" }
  };

  // Generiamo la struttura delle classifiche partendo dai gironi nel JSON
  const classificheCalcolate: Record<string, Statistiche[]> = {};

  Object.entries(datiTorneo.gironi).forEach(([nomeGirone, squadre]) => {
    classificheCalcolate[nomeGirone] = squadre.map(nome => ({
      nome, g: 0, v: 0, n: 0, p: 0, gf: 0, gs: 0, dr: 0, pt: 0
    }));
  });

  // Calcolo matematico automatico basato sui risultati delle partite
  datiTorneo.partite.forEach(partita => {
    if (partita.golCasa !== null && partita.golFuori !== null) {
      const listaSquadre = classificheCalcolate[partita.girone];
      const squadraCasa = listaSquadre?.find(s => s.nome === partita.casa);
      const squadraFuori = listaSquadre?.find(s => s.nome === partita.fuori);

      if (squadraCasa && squadraFuori) {
        squadraCasa.g += 1;
        squadraFuori.g += 1;
        squadraCasa.gf += partita.golCasa;
        squadraCasa.gs += partita.golFuori;
        squadraFuori.gf += partita.golFuori;
        squadraFuori.gs += partita.golCasa;
        squadraCasa.dr = squadraCasa.gf - squadraCasa.gs;
        squadraFuori.dr = squadraFuori.gf - squadraFuori.gs;

        if (partita.golCasa > partita.golFuori) {
          squadraCasa.v += 1; squadraCasa.pt += 3;
          squadraFuori.p += 1;
        } else if (partita.golCasa < partita.golFuori) {
          squadraFuori.v += 1; squadraFuori.pt += 3;
          squadraCasa.p += 1;
        } else {
          squadraCasa.n += 1; squadraCasa.pt += 1;
          squadraFuori.n += 1; squadraFuori.pt += 1;
        }
      }
    }
  });

  // Ordina le squadre in classifica per Punti, e poi per Differenza Reti
  Object.keys(classificheCalcolate).forEach(girone => {
    classificheCalcolate[girone].sort((a, b) => b.pt - a.pt || b.dr - a.dr);
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-white font-sans">
      
      {/* SELETTORE GIORNATE */}
      <div className="flex justify-center gap-4 mb-10">
        {[1, 2, 3].map((g) => (
          <button
            key={g}
            onClick={() => setGiornata(g)}
            className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 ${
              giornata === g 
                ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Giornata {g}
          </button>
        ))}
      </div>

      {/* CALENDARIO MATCH TURNO ATTIVO */}
      <div className="mb-12 max-w-4xl mx-auto">
        <h4 className="text-center text-xs uppercase tracking-widest text-zinc-500 mb-4">Incontri del Turno {giornata}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datiTorneo.partite.filter(p => p.giornata === giornata).map((partita, idx) => (
            <div key={idx} className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-center justify-between text-sm">
              <span className="font-bold text-zinc-300">{partita.casa}</span>
              <div className="bg-black/50 px-3 py-1 rounded border border-zinc-800 font-mono font-black text-amber-400">
                {partita.golCasa !== null ? `${partita.golCasa} - ${partita.golFuori}` : 'vs'}
              </div>
              <span className="font-bold text-zinc-300">{partita.fuori}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TABELLE CLASSIFICHE GIRONI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {Object.entries(classificheCalcolate).map(([nomeGirone, squadre]) => {
          const colori = infoColori[nomeGirone as keyof typeof infoColori] || infoColori["Girone A"];
          return (
            <div key={nomeGirone} className={`p-5 rounded-2xl border backdrop-blur-md bg-zinc-900/40 shadow-xl flex flex-col ${colori.stile}`}>
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-black tracking-wider uppercase text-zinc-200">{nomeGirone}</h3>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${colori.badge}`}>Fase a Gruppi</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800/60 uppercase text-[10px] tracking-wider">
                      <th className="py-2 font-medium">Squadra</th>
                      <th className="py-2 text-center font-medium">G</th>
                      <th className="py-2 text-center font-medium">V</th>
                      <th className="py-2 text-center font-medium">N</th>
                      <th className="py-2 text-center font-medium">P</th>
                      <th className="py-2 text-center font-medium text-zinc-400">DR</th>
                      <th className="py-2 text-center font-medium text-zinc-300 font-bold">PT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                    {squadre.map((squadra, i) => (
                      <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 font-semibold flex items-center gap-2">
                          <span className="text-zinc-600 text-[10px] font-mono">#{i+1}</span>
                          {squadra.nome}
                        </td>
                        <td className="py-3 text-center font-mono text-zinc-500">{squadra.g}</td>
                        <td className="py-3 text-center font-mono text-zinc-500">{squadra.v}</td>
                        <td className="py-3 text-center font-mono text-zinc-500">{squadra.n}</td>
                        <td className="py-3 text-center font-mono text-zinc-500">{squadra.p}</td>
                        <td className={`py-3 text-center font-mono font-medium ${squadra.dr > 0 ? 'text-emerald-400' : squadra.dr < 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                          {squadra.dr > 0 ? `+${squadra.dr}` : squadra.dr}
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-amber-400">{squadra.pt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* TABELLA MARCATORI */}
      <div className="w-full max-w-2xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">⚽</div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wider text-zinc-100">Classifica Marcatori</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Matenano Kings Cup</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800 uppercase text-[10px] tracking-widest">
                <th className="py-2 pl-2 font-medium w-12">Pos</th>
                <th className="py-2 font-medium">Giocatore</th>
                <th className="py-2 font-medium">Squadra</th>
                <th className="py-2 text-right font-medium pr-4 text-amber-400">Gol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {[...datiTorneo.marcatori]
                .sort((a, b) => b.gol - a.gol)
                .map((player, index) => (
                  <tr key={index} className="hover:bg-zinc-800/30 transition-colors duration-200">
                    <td className="py-3.5 pl-2 font-mono font-bold text-zinc-500">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}
                    </td>
                    <td className="py-3.5 font-bold text-zinc-200">{player.nome}</td>
                    <td className="py-3.5 text-xs text-zinc-400 font-medium">
                      <span className="bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/50">{player.squadra}</span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-black text-lg text-amber-400 pr-4">{player.gol}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}