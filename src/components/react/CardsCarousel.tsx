import React, { useState, useEffect, useRef } from 'react';

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
  },
  /* La carta segreta è stata spostata ufficialmente alla fine dell'array */
  { 
    titolo: "???????", 
    immagine: "/assets/segreto.png", 
    descrizione: "?????????" 
  }
];

export default function CardsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  
  // Ref per tracciare l'inizio del touch su mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const changeCard = (newIndex: number, dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    
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

  // Gestione dello Swipe su Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Distanza minima in pixel per considerare il movimento uno swipe

    if (diffX > minSwipeDistance) {
      // Swipe verso sinistra -> Prossima carta
      nextCard();
    } else if (diffX < -minSwipeDistance) {
      // Swipe verso destra -> Carta precedente
      prevCard();
    }

    // Reset delle coordinate
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const carta = carteBonus[activeIndex];

  const getSlideClass = () => {
    if (!isAnimating) return 'translate-x-0 opacity-100 scale-100';
    return direction === 'next' 
      ? '-translate-x-12 opacity-0 scale-95' 
      : 'translate-x-12 opacity-0 scale-95';
  };

  return (
    <div className="relative max-w-xl mx-auto px-2 sm:px-4">
      
      {/* FRECCIA SINISTRA: Responsivizzata (Interna su Mobile, Esterna su PC via lg:) */}
      <button 
        onClick={prevCard} 
        className="absolute left-2 lg:left-[-70px] top-[40%] -translate-y-1/2 z-30 bg-[#292923]/80 backdrop-blur-md lg:bg-[#292923] hover:bg-[#ffea00] hover:text-black text-white w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center border border-white/10 hover:border-[#ffea00] transition-all font-bold text-base lg:text-lg group shadow-2xl"
        aria-label="Carta precedente"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
      </button>

      {/* FRECCIA DESTRA: Responsivizzata (Interna su Mobile, Esterna su PC via lg:) */}
      <button 
        onClick={nextCard} 
        className="absolute right-2 lg:right-[-70px] top-[40%] -translate-y-1/2 z-30 bg-[#292923]/80 backdrop-blur-md lg:bg-[#292923] hover:bg-[#ffea00] hover:text-black text-white w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center border border-white/10 hover:border-[#ffea00] transition-all font-bold text-base lg:text-lg group shadow-2xl"
        aria-label="Carta successiva"
      >
        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
      </button>

      {/* STRUTTURA DEL CAROSELLO ANIMATA CON FUNZIONALITÀ TOUCH */}
      <div 
        className="relative flex flex-col items-center justify-center text-center space-y-8 touch-none select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#ffea00] opacity-[0.03] blur-[100px] pointer-events-none -z-10"></div>

        {/* CONTENITORE IMMAGINE */}
        <div className="relative group w-full flex justify-center items-center min-h-[360px]">
          
          {/* ALONE NEON DI SFONDO */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-[#ffea00] rounded-full 
            blur-[60px] opacity-0 pointer-events-none -z-10 transition-all duration-300
            group-hover:opacity-40 group-hover:w-72 group-hover:h-96 group-hover:blur-[80px]
          `}></div>

          {/* IMMAGINE DELLA CARTA */}
          <img 
            src={carta.immagine} 
            alt={carta.titolo} 
            className={`w-64 sm:w-72 md:w-80 h-auto object-contain transition-all duration-300 ease-out cursor-pointer z-10
              ${getSlideClass()}
              drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]
              group-hover:scale-105 
              group-hover:drop-shadow-[0_0_20px_rgba(255,234,0,0.95)]
            `}
          />
        </div>

        {/* TESTI SOTTO L'IMMAGINE */}
        <div className={`max-w-xs sm:max-w-md space-y-3 pt-2 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}`}>
          <h3 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-wider text-[#ffea00]">
            {carta.titolo}
          </h3>
          <p className="font-mono text-xs sm:text-sm text-[#ffffff]/80 leading-relaxed min-h-[70px] px-2">
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
            aria-label={`Vai alla carta ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}