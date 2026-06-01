# 🏆 Matenano Kings Cup - Official Website

Il portale ufficiale della **Matenano Kings Cup**, il torneo estivo di punta organizzato dall'Associazione Giovanile **Numen APS** a Santa Vittoria in Matenano (FM).

Questo repository contiene il codice sorgente per il sottodominio `mkc.numenaps.it`. Il sito è progettato per offrire un'esperienza premium, veloce e fluida, pensata per informare atleti e tifosi su calendari, gironi, classifiche e statistiche del torneo.

## 🚀 Tech Stack

Il progetto è costruito con le tecnologie web più moderne per garantire performance estreme e un design impattante:

- **Framework:** [Astro](https://astro.build/) (v6.x) - Per una generazione di siti statici (SSG) superveloce.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v3.4) - Framework CSS utility-first.
- **Animazioni Scroll:** [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/) - Per far emergere gli elementi durante lo scorrimento.
- **Smooth Scroll:** [Lenis](https://lenis.studiofreight.com/) - Per un'esperienza di navigazione "effetto burro" e premium.
- **Hosting & CI/CD:** [Cloudflare Pages](https://pages.cloudflare.com/) - Deploy automatico dal branch `main`.

## 📂 Struttura del Progetto

```text
/
├── public/
│   └── assets/           # Immagini, loghi (es. mkc-bg.jpg, mkc-logo-big.png)
├── src/
│   ├── components/       # Componenti UI riutilizzabili (Navbar.astro, Footer.astro)
│   ├── layouts/          # Layout principale (MkcLayout.astro) con logica Lenis/AOS
│   └── pages/            # Pagine del sito (index, iltorneo, classifiche, albo)
├── astro.config.mjs      # Configurazione di base di Astro
├── tailwind.config.mjs   # Temi, font e configurazioni di Tailwind
├── package.json          # Dipendenze e script npm
└── .npmrc                # Regole di risoluzione dipendenze per Cloudflare Pages
