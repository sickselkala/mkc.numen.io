import { useState } from 'react';

// ─── Types ──────────────────────────────────────────────
interface Match {
  id: number;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  time: string;
  field: string;
  status: 'upcoming' | 'live' | 'finished';
}

interface Round {
  id: number;
  name: string;
  date: string;
  matches: Match[];
}

// ─── Data: 3 Rounds, 4 Matches Each ─────────────────────
const tournamentData: Round[] = [
  {
    id: 1,
    name: 'Prima Giornata',
    date: '15 Giugno 2025',
    matches: [
      { id: 1,  teamA: 'FC Matenano',   teamB: 'Real Valle',    scoreA: 3, scoreB: 1, time: '16:00', field: 'Campo A', status: 'finished' },
      { id: 2,  teamA: 'Atletico Monti',teamB: 'Sporting Lago', scoreA: 2, scoreB: 2, time: '16:45', field: 'Campo B', status: 'finished' },
      { id: 3,  teamA: 'Inter Collina', teamB: 'Juve Borgo',    scoreA: null, scoreB: null, time: '17:30', field: 'Campo A', status: 'upcoming' },
      { id: 4,  teamA: 'Milan Costa',   teamB: 'Roma Pianura',  scoreA: null, scoreB: null, time: '18:15', field: 'Campo B', status: 'upcoming' },
    ],
  },
  {
    id: 2,
    name: 'Seconda Giornata',
    date: '22 Giugno 2025',
    matches: [
      { id: 5,  teamA: 'FC Matenano',   teamB: 'Atletico Monti',scoreA: null, scoreB: null, time: '16:00', field: 'Campo A', status: 'upcoming' },
      { id: 6,  teamA: 'Real Valle',    teamB: 'Sporting Lago', scoreA: null, scoreB: null, time: '16:45', field: 'Campo B', status: 'upcoming' },
      { id: 7,  teamA: 'Inter Collina', teamB: 'Milan Costa',   scoreA: null, scoreB: null, time: '17:30', field: 'Campo A', status: 'upcoming' },
      { id: 8,  teamA: 'Juve Borgo',    teamB: 'Roma Pianura',  scoreA: null, scoreB: null, time: '18:15', field: 'Campo B', status: 'upcoming' },
    ],
  },
  {
    id: 3,
    name: 'Terza Giornata',
    date: '29 Giugno 2025',
    matches: [
      { id: 9,  teamA: 'FC Matenano',   teamB: 'Sporting Lago', scoreA: null, scoreB: null, time: '16:00', field: 'Campo A', status: 'upcoming' },
      { id: 10, teamA: 'Real Valle',    teamB: 'Atletico Monti',scoreA: null, scoreB: null, time: '16:45', field: 'Campo B', status: 'upcoming' },
      { id: 11, teamA: 'Inter Collina', teamB: 'Roma Pianura',  scoreA: null, scoreB: null, time: '17:30', field: 'Campo A', status: 'upcoming' },
      { id: 12, teamA: 'Juve Borgo',    teamB: 'Milan Costa',   scoreA: null, scoreB: null, time: '18:15', field: 'Campo B', status: 'upcoming' },
    ],
  },
];

// ─── Classification Data ─────────────────────────────────
const classification = [
  { pos: 1, team: 'FC Matenano',    pt: 6, g: 2, v: 2, n: 0, p: 0, gf: 5, gs: 2, dr: 3 },
  { pos: 2, team: 'Atletico Monti', pt: 4, g: 2, v: 1, n: 1, p: 0, gf: 4, gs: 3, dr: 1 },
  { pos: 3, team: 'Inter Collina',  pt: 3, g: 2, v: 1, n: 0, p: 1, gf: 3, gs: 2, dr: 1 },
  { pos: 4, team: 'Sporting Lago',  pt: 3, g: 2, v: 0, n: 2, p: 0, gf: 3, gs: 3, dr: 0 },
  { pos: 5, team: 'Milan Costa',    pt: 3, g: 2, v: 1, n: 0, p: 1, gf: 2, gs: 3, dr: -1 },
  { pos: 6, team: 'Juve Borgo',     pt: 1, g: 2, v: 0, n: 1, p: 1, gf: 2, gs: 4, dr: -2 },
  { pos: 7, team: 'Real Valle',     pt: 0, g: 2, v: 0, n: 0, p: 2, gf: 2, gs: 5, dr: -3 },
  { pos: 8, team: 'Roma Pianura',   pt: 0, g: 2, v: 0, n: 0, p: 2, gf: 1, gs: 4, dr: -3 },
];

// ─── Shield Color Generator ──────────────────────────────
const getShieldGradient = (index: number, side: 'a' | 'b') => {
  const gradientsA = [
    'from-amber-500 to-amber-600',
    'from-emerald-500 to-emerald-600',
    'from-blue-500 to-blue-600',
    'from-rose-500 to-rose-600',
    'from-violet-500 to-violet-600',
    'from-orange-500 to-orange-600',
    'from-cyan-500 to-cyan-600',
    'from-pink-500 to-pink-600',
  ];
  const gradientsB = [
    'from-zinc-600 to-zinc-700',
    'from-slate-600 to-slate-700',
    'from-gray-600 to-gray-700',
    'from-neutral-600 to-neutral-700',
    'from-stone-600 to-stone-700',
    'from-zinc-700 to-zinc-800',
    'from-slate-700 to-slate-800',
    'from-gray-700 to-gray-800',
  ];
  return side === 'a' ? gradientsA[index % gradientsA.length] : gradientsB[index % gradientsB.length];
};

// ─── Match Card Component ────────────────────────────────
function MatchCard({ match, index }: { match: Match; index: number }) {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const isUpcoming = match.status === 'upcoming';

  return (
    <div
      className={`
        relative rounded-2xl border backdrop-blur-md transition-all duration-300
        ${isUpcoming
          ? 'border-dashed border-white/10 bg-white/[0.02] opacity-80'
          : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40'
        }
        ${isLive ? 'border-green-500/30 shadow-lg shadow-green-500/5' : ''}
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/5 rounded">
            {match.field}
          </span>
          <span className="text-xs font-semibold text-zinc-400 tabular-nums">{match.time}</span>
        </div>
        <div className={`
          flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest
          ${isFinished ? 'bg-white/5 text-zinc-500' : ''}
          ${isLive ? 'bg-green-500/15 text-green-400' : ''}
          ${isUpcoming ? 'bg-blue-500/10 text-blue-400' : ''}
        `}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
          {isFinished ? 'Finale' : isLive ? 'Live' : 'Prossima'}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between px-5 pb-5 gap-4">
        {/* Team A */}
        <div className={`flex items-center gap-3 flex-1 ${isFinished && match.scoreA! > match.scoreB! ? 'text-amber-400' : 'text-zinc-100'}`}>
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getShieldGradient(match.id, 'a')} flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0`}>
            {match.teamA.charAt(0)}
          </div>
          <span className="font-semibold text-sm tracking-wide truncate">{match.teamA}</span>
        </div>

        {/* Score / VS */}
        <div className="flex-shrink-0">
          {isFinished ? (
            <div className="flex items-center gap-2.5">
              <span className="text-3xl font-black text-zinc-100 tabular-nums">{match.scoreA}</span>
              <span className="text-lg font-light text-zinc-600">-</span>
              <span className="text-3xl font-black text-zinc-100 tabular-nums">{match.scoreB}</span>
            </div>
          ) : isLive ? (
            <div className="flex items-center gap-2.5">
              <span className="text-3xl font-black text-zinc-100 tabular-nums">{match.scoreA ?? 0}</span>
              <span className="text-lg font-light text-zinc-600">-</span>
              <span className="text-3xl font-black text-zinc-100 tabular-nums">{match.scoreB ?? 0}</span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-extrabold text-xs tracking-wider">
              VS
            </div>
          )}
        </div>

        {/* Team B */}
        <div className={`flex items-center gap-3 flex-1 flex-row-reverse text-right ${isFinished && match.scoreB! > match.scoreA! ? 'text-amber-400' : 'text-zinc-100'}`}>
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getShieldGradient(match.id, 'b')} flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0`}>
            {match.teamB.charAt(0)}
          </div>
          <span className="font-semibold text-sm tracking-wide truncate">{match.teamB}</span>
        </div>
      </div>

      {/* Result Bar */}
      {isFinished && (
        <div className="mx-5 mb-4 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000"
            style={{ width: `${(match.scoreA! / (match.scoreA! + match.scoreB!)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function TournamentRounds() {
  const [activeRound, setActiveRound] = useState(0);
  const currentRound = tournamentData[activeRound];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Round Tabs */}
      <div className="flex gap-2 justify-center flex-wrap mb-8">
        {tournamentData.map((round, index) => (
          <button
            key={round.id}
            onClick={() => setActiveRound(index)}
            className={`
              relative flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-6 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300 min-w-[130px]
              ${activeRound === index
                ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5'
              }
            `}
          >
            <span className={`text-2xl font-black transition-colors ${activeRound === index ? 'text-amber-400' : 'text-zinc-600'}`}>
              G{round.id}
            </span>
            <div className="flex flex-col items-center sm:items-start">
              <span className={`text-xs font-bold uppercase tracking-widest ${activeRound === index ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {round.name}
              </span>
              <span className="text-[10px] text-zinc-600 tracking-wide">{round.date}</span>
            </div>
            {activeRound === index && (
              <div className="absolute -bottom-px left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Round Info */}
      <div className="text-center mb-6 animate-[fadeIn_0.5s_ease]">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Giornata {currentRound.id} di 3
          </span>
          <span className="text-zinc-700">&middot;</span>
          <span className="text-xs font-medium text-zinc-500 tracking-wide">
            {currentRound.matches.filter(m => m.status === 'finished').length}/{currentRound.matches.length} completate
          </span>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {currentRound.matches.map((match, index) => (
          <MatchCard key={match.id} match={match} index={index} />
        ))}
      </div>

      {/* Classification Table */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-zinc-100 mb-5">
          <span className="text-amber-400 text-lg">&#9733;</span>
          Classifica Giornata {currentRound.id}
        </h2>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                {['#', 'SQUADRA', 'PT', 'G', 'V', 'N', 'P', 'GF', 'GS', 'DR'].map((col) => (
                  <th key={col} className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classification.map((row) => (
                <tr
                  key={row.pos}
                  className={`
                    border-b border-white/[0.03] transition-colors hover:bg-white/[0.03]
                    ${row.pos <= 4 ? 'bg-amber-500/[0.02]' : ''}
                  `}
                >
                  <td className="px-4 py-3.5 text-center">
                    <span className={`
                      inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold
                      ${row.pos === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/30' : ''}
                      ${row.pos === 2 ? 'bg-gradient-to-br from-zinc-300 to-zinc-400 text-black' : ''}
                      ${row.pos === 3 ? 'bg-gradient-to-br from-orange-600 to-amber-700 text-white' : ''}
                      ${row.pos > 3 ? 'bg-white/5 text-zinc-500' : ''}
                    `}>
                      {row.pos}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                        {row.team.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-zinc-300">{row.team}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-sm font-extrabold text-amber-400 tabular-nums">{row.pt}</td>
                  <td className="px-4 py-3.5 text-center text-sm font-semibold text-zinc-500 tabular-nums">{row.g}</td>
                  <td className="px-4 py-3.5 text-center text-sm font-semibold text-zinc-500 tabular-nums">{row.v}</td>
                  <td className="px-4 py-3.5 text-center text-sm font-semibold text-zinc-500 tabular-nums">{row.n}</td>
                  <td className="px-4 py-3.5 text-center text-sm font-semibold text-zinc-500 tabular-nums">{row.p}</td>
                  <td className="px-4 py-3.5 text-center text-sm font-semibold text-zinc-500 tabular-nums">{row.gf}</td>
                  <td className="px-4 py-3.5 text-center text-sm font-semibold text-zinc-500 tabular-nums">{row.gs}</td>
                  <td className={`
                    px-4 py-3.5 text-center text-sm font-bold tabular-nums
                    ${row.dr > 0 ? 'text-green-400' : row.dr < 0 ? 'text-red-400' : 'text-zinc-500'}
                  `}>
                    {row.dr > 0 ? `+${row.dr}` : row.dr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
