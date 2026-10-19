# 🏆 Matenano Kings Cup — Sito Ufficiale

> Il sito ufficiale del **Matenano Kings Cup (MKC)**, il torneo di calcetto organizzato dall'associazione **Numen APS** a Santa Vittoria in Matenano.

[![Astro](https://img.shields.io/badge/Astro-6.4.2-ffea00?style=for-the-badge&logo=astro&logoColor=000)](https://astro.build/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=ffffff)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06b6d4?style=for-the-badge&logo=tailwind-css&logoColor=ffffff)](https://tailwindcss.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-f38bca?style=for-the-badge&logo=cloudflare&logoColor=ffffff)](https://pages.cloudflare.com/)

---

## 🌐 Live

- **Sito:** [mkc.numenaps.it](https://mkc.numenaps.it)
- **Repositorio:** `sickselkala/mkc.numen.io`

---

## 📋 Il Progetto

Un sito **statico** e **veloce** interamente costruito con **Astro** (SSR + generazione statica), arricchito da componenti **React** interattivi e uno stile dark moderno firmato **Tailwind CSS**.

### Cosa trovi qui
- 🎥 **Hero scroll-parallax** con la Coppa che si accende progressivamente allo scroll (`CoppaScroll.astro`)
- 📊 **Tabelloni, gironi e classifiche** (componenti React, dati in `src/data/`)
- 📜 **Regolamento e carte speciali** con carosello interattivo (`CardsCarousel.tsx`)
- 🗂️ **Archivio edizioni** (`/archivio/2026`)
- 🎮 **Smooth scroll** con Lenis + animazioni AOS

---

## 🛠️ Stack Tecnologico

| Tecnologia | Versione | Ruolo |
|---|---|---|
| [Astro](https://astro.build/) | `^6.4.2` | Framework, generazione statica, SEO |
| [React](https://react.dev/) | `^19.2.6` | Componenti interattivi avanzati |
| [Tailwind CSS](https://tailwindcss.com/) | `^3.4.1` | Styling responsive e utility-first |
| [aos](https://michalsnik.github.io/aos/) | `^2.3.4` | Animazioni al scroll |
| [lenis](https://lenis.studio/) | `^1.0.45` | Smooth scroll nativo |
| [papaparse](https://www.papaparse.com/) | `^5.5.3` | Parsing CSV tabelloni |
| [Cloudflare Pages](https://pages.cloudflare.com/) | — | Hosting e CI/CD |
| [Cloudflare KV](https://developers.cloudflare.com/kv/) | — | Storage serverless sessioni |

---

## 🚀 Guida allo Sviluppo Locale

### 1. Prerequisiti
- **Node.js** ≥ 22
- **Git**

### 2. Installazione
```bash
git clone git@github.com:sickselkala/mkc.numen.io.git
cd mkc.numen.io
npm install
```

### 3. Avvio
```bash
npm run dev
```
Il server di sviluppo è disponibile su `http://localhost:4321`.

### 4. Build di produzione
```bash
npm run build
```

### 5. Preview
```bash
npm run preview
```

---

## 📁 Struttura

```
src/
├── components/            # Componenti Astro + React
│   ├── CoppaScroll.astro  # Hero scroll-parallax con la Coppa
│   ├── EsploraSezioni.astro
│   ├── Footer.astro
│   ├── Navbar.astro
│   └── react/             # Componenti React
│       ├── CardsCarousel.tsx
│       ├── NewsPage.tsx
│       ├── TeamsShowcase.tsx
│       └── TournamentRounds.tsx
├── layouts/               # Layout condivisi
├── pages/                 # Route Astro
│   ├── index.astro
│   ├── iltorneo.astro
│   ├── albo.astro
│   ├── classifiche.astro
│   ├── news.astro
│   └── squadre.astro
└── data/                  # Dati torneo (edizione.ts, torneo.json)
public/
├── assets/                # Immagini, video, PDF
│   ├── coppa-oro.png      # Coppa d'oro (PNG RGBA scontornato)
│   ├── coppa-spenta.png   # Coppa spenta (PNG RGBA scontornato)
│   └── ...
```

---

## 🎨 Note di Stile

- **Palette:** background `#030302` (quasi nero), oro `#ffea00` e `#d4af37`, testo bianco / grigio `#ffffff`.
- **Tipografia:** `font-display` (titoli display, uppercase, tracking-wider) + `font-mono` (label, meta).
- **Griglia:** background `30px × 30px` semi-trasparente.
- **Effetti:** drop-shadow dorati, radial-gradient glow, animazioni AOS.

---

## 🤝 Contributi

1. Fork del repository.
2. Crea un branch feature (`git checkout -b feature/la-tua-feature`).
3. Commit delle modifiche con messaggi chiari.
4. Push e apri una **Pull Request**.

---

## 📄 Licenza

Progetto proprietario di **Numen APS**. Tutti i diritti riservati.