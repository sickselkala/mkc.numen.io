import React, { useState } from 'react';

const carteBonus = [
  { 
    titolo: "Carta Jolly", 
    immagine: "/assets/jolly.png", 
    descrizione: "Ruba la carta avversaria o gioca una carta a tua scelta" 
  },
  { 
    titolo: "Rigore Istantaneo", 
    immagine: "/assets/rigore.png", 
    descrizione: "Un calcio di rigore automatico" 
  },
  { 
    titolo: "???????", 
    immagine: "/assets/segreto.png", 
    descrizione: "????????" 
  },
  { 
    titolo: "Shootout", 
    immagine: "/assets/shootout.png", 
    descrizione: "5 sec. per tirare un rigore in movimento partendo da metà campo. Il portiere non può uscire dall'area. Viene fermato se il tempo finisce o il portiere tocca la palla in avanti." 
  },
  { 
    titolo: "Sospensione Giocatore", 
    immagine: "/assets/sospensionegiocatore.png", 
    descrizione: "Un giocatore di movimento avversario a scelta può essere sospeso per 3 min." 
  },
  { 
    titolo: "Star Player", 
    immagine: "/assets/starplayer.png", 
    descrizione: "Per 6 min. il gol segnato dal giocatore vale doppio. La carta si annulla dopo un gol o dopo i 6 min." 
  },
  { 
    titolo: "Tiro Libero", 
    immagine: "/assets/tirolibero.png", 
    descrizione: "Punizione diretta dalla posizione dei tiri liberi (9 metri)." 
  }
];

export default function CardsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const changeCard = (newIndex: number, dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    
    // Tempo dell'animazione di uscita (200ms)
    setTimeout(() => {
      setActiveIndex(newIndex);
      setIsAnimating(false);
    }, 200);
  };

  const prevCard = () => {
    const nextIdx = activeIndex === 0 ? carteBonus.length - 1 : activeIndex - 1;
    changeCard(nextIdx, 'prev');
  };

  const nextCard = () => {
    const nextIdx = activeIndex === carteBonus.length - 1 ? 0 : activeIndex + 1;
    changeCard(nextIdx, 'next');
  };

  const carta = carteBonus[activeIndex];

  // Calcolo delle classi di scorrimento basate sulla direzione
  const getSlideClass = () => {
    if (!isAnimating) return 'translate-x-0 opacity-100 scale-100';
    if (direction === 'next') {
      return '-translate-x-12 opacity-0 scale-95';
    } else {
      return 'translate-x-12 opacity-0 scale-95';
    }
  };

  return (
    <div className="relative max-w-xl mx-auto px-4">
      
      {/* FRECCE LATERALI MINIMALI */}
      <button 
        onClick={prevCard} 
        className="absolute left-[-70px] top-[40%] -translate-y-1/2 z-20 bg-[#292923] hover:bg-[#ffea00] hover:text-black text-white w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 hover:border-[#ffea00] transition-all font-bold text-lg group shadow-xl"
        aria-label="Carta precedente"
      >
        {/* Modifica la freccia sinistra */}
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
      </button>

      <button 
        onClick={nextCard} 
        className="absolute right-[-70px] top-[40%] -translate-y-1/2 z-20 bg-[#292923] hover:bg-[#ffea00] hover:text-black text-white w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 hover:border-[#ffea00] transition-all font-bold text-lg group shadow-xl"
        aria-label="Carta successiva"
      >
        {/* Modifica la freccia destra */}
        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
      </button>

      {/* STRUTTURA DEL CAROSELLO ANIMATA */}
      <div className="relative flex flex-col items-center justify-center text-center space-y-8">
        
        {/* Ambient Glow di sfondo fisso e leggero */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#ffea00] opacity-[0.03] blur-[100px] pointer-events-none -z-10"></div>

        {/* CONTENITORE IMMAGINE CON DOPPIO GLOW ESPLOSIVO (LARGHEZZA + INTENSITÀ) */}
<div className="relative group w-full flex justify-center items-center min-h-[360px]">
  
  {/* ALONE NEON DI SFONDO: Diventa gigante, largo e acceso solo in Hover */}
  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-[#ffea00] rounded-full 
    blur-[60px] opacity-0 pointer-events-none -z-10 transition-all duration-300
    group-hover:opacity-40 group-hover:w-72 group-hover:h-96 group-hover:blur-[80px]
  `}></div>

  {/* IMMAGINE CON LUCE ACCESA SUI BORDI */}
  <img 
    src={carta.immagine} 
    alt={carta.titolo} 
    className={`w-72 md:w-80 h-auto object-contain transition-all duration-300 ease-out cursor-pointer z-10
      ${getSlideClass()}
      
      /* Stato normale */
      drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]

      /* Hover sulla carta: luce intensa sui bordi + ingrandimento */
      group-hover:scale-105 
      group-hover:drop-shadow-[0_0_20px_rgba(255,234,0,0.95)]
    `}
  />
</div>

        {/* TESTI SOTTO L'IMMAGINE ANIMATI IN SINCRONIA */}
        <div className={`max-w-md space-y-3 pt-2 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}`}>
          <h3 className="text-3xl font-display font-black uppercase tracking-wider text-[#ffea00]">
            {carta.titolo}
          </h3>
          <p className="font-mono text-sm text-[#ffffff]/80 leading-relaxed min-h-[60px]">
            {carta.descrizione}
          </p>
          <div className="text-[10px] font-mono uppercase text-[#ffffff]/30 tracking-widest pt-2">
            ▲ CARTA SPECIALE MKC ▲
          </div>
        </div>
      </div>

      {/* PUNTINI DI POSIZIONE IN BASSO */}
      <div className="flex justify-center gap-2 mt-8">
        {carteBonus.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => {
              if (idx !== activeIndex) {
                changeCard(idx, idx > activeIndex ? 'next' : 'prev');
              }
            }} 
            className={`h-1.5 transition-all rounded-full ${activeIndex === idx ? 'w-6 bg-[#ffea00]' : 'w-1.5 bg-[#ffffff]/20'}`} 
          />
        ))}
      </div>
    </div>
  );
}