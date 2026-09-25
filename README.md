# 🎬 EnjoyMovie — Movie Discovery & Recommendation Web App

A production-ready, dark cinematic movie discovery platform built with **React.js + Tailwind CSS** on the frontend and **Node.js + Express.js** on the backend. Designed using the **Cinematic Luxe** design system created in Stitch.

---

## 🌟 Key Highlights

- **Multi-Genre Logic**: Select complex genre intersections (e.g. *Horror AND Mystery* or *Horror OR Thriller*) to instantly uncover tailored movie collections.
- **Authoritative Metrics**: Displays genuine **IMDb ratings** and vote counts via OMDb API alongside official **TMDB scores**, Metascores, and Rotten Tomatoes ratings—never confusing or faking scores.
- **Bayesian Quality Score**: Prioritizes genuine cinematic quality over obscure raw averages (e.g., an 8.7 backed by 500,000 votes rightfully outranks a 9.1 with only 300 votes).
- **Interactive Matchmaker ("What Should I Watch?")**: A 5-step guided questionnaire filtering by mood, genre, rating threshold, release era, and runtime constraints.
- **Natural Language Search Parser**: Converts natural user prompts like *"dark psychological thrillers from 2010 onwards"* into structured discover queries.
- **Continuous Browsing**: Clean 20–30 initial results with smooth "Load More" pagination and responsive grids (6-col desktop, 4-col tablet, 2-col mobile).
- **Two-Way URL State Sync**: Discover filters sync with the browser URL (`/discover?genres=Horror,Mystery&minRating=7.0...`) for bookmarks, page refreshes, and sharing.
- **Local Watchlist**: Seamless bookmarking and persistence backed by browser `localStorage`.
- **YouTube Trailer Integration**: Clean modal player without intrusive autoplay.
- **Audience & Critic Reviews**: Dedicated review cards sortable by highest rated, newest, oldest, and longest reviews.
- **In-Memory TTL Caching & Rate Limiting**: Built-in caching for genre lists, movie details, reviews, and searches to ensure fast responses and protect external APIs.

---

## 🎨 Design System: Cinematic Luxe (Stitch)

The application matches the **Cinematic Luxe** design specifications:

- **Deep Canvas (`#090A0E`)**: Immersive void staging canvas.
- **Surfaces (`#0D0F15` / `#161A24` / `#1D2230`)**: Layered optical glass panels with subtle edge illumination.
- **Electric Amber (`#F59E0B`)**: Interactive CTAs, active pills, and focus glows.
- **Cinema Gold (`#F5C518`)**: Reserved for verified IMDb scores, gold stars, and awards.
- **Vivid Cyan (`#38BDF8`)**: TMDB score accents, technical specs, and badges.
- **Typography**: **Outfit** for cinematic headings and display; **Inter** with tabular figures (`tnum`) for body copy and aligned score badges.

---

## 📂 Project Architecture

```
EnjoyMovie/
├── package.json               # Root scripts (runs client & server concurrently)
├── README.md
├── server/                    # Node.js + Express.js API
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── src/
│       ├── app.js             # Express application & middleware setup
│       ├── server.js          # Server entry point
│       ├── cache/
│       │   └── cache.js       # In-memory TTL cache
│       ├── config/
│       │   └── env.js         # Environment configuration
│       ├── controllers/
│       │   ├── genre.controller.js
│       │   └── movie.controller.js
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   └── rateLimiter.js
│       ├── routes/
│       │   ├── genre.routes.js
│       │   └── movie.routes.js
│       ├── services/
│       │   ├── tmdb.service.js
│       │   ├── omdb.service.js
│       │   ├── movie.service.js
│       │   ├── recommendation.service.js
│       │   ├── nlp.service.js
│       │   └── demoCatalog.js  # Rich real movie catalog for instant testing
│       └── utils/
│           ├── normalizer.js   # Unified API data schema
│           └── qualityScore.js # Bayesian ranking algorithm
└── client/                    # React 19 + Vite + Tailwind CSS
    ├── index.html             # Google Fonts (Outfit & Inter), metadata
    ├── package.json
    ├── vite.config.js         # Proxy /api to localhost:5000
    ├── tailwind.config.js     # Cinematic Luxe theme extension
    └── src/
        ├── App.jsx            # Router and modal orchestration
        ├── index.css          # Glassmorphism utilities & scrollbars
        ├── main.jsx
        ├── context/
        │   └── WatchlistContext.jsx
        ├── hooks/
        │   ├── useDebounce.js
        │   └── useGenres.js
        ├── services/
        │   └── api.js         # Axios client
        ├── components/
        │   ├── Navbar/
        │   ├── Footer/
        │   ├── MovieCard/
        │   ├── MovieGrid/
        │   ├── MovieCarousel/
        │   ├── SearchBar/
        │   ├── FilterPanel/
        │   ├── RatingBadge/
        │   ├── CastCard/
        │   ├── ReviewCard/
        │   ├── TrailerModal/
        │   ├── WhatShouldIWatchModal/
        │   ├── Skeleton/
        │   └── ErrorMessage/
        └── pages/
            ├── Home.jsx
            ├── Discover.jsx
            ├── MovieDetails.jsx
            ├── Search.jsx
            ├── Watchlist.jsx
            └── About.jsx
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended; verified on Node v25)
- npm

### 1. Install Dependencies
In the root directory, run:
```bash
npm run install:all
```
*(Or install individually: `npm install`, `cd server && npm install`, `cd ../client && npm install`)*

---

### 2. Configure API Keys

Copy the example file to `.env` in the `server` directory:
```bash
cp server/.env.example server/.env
```

Open `server/.env` and insert your credentials:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_ACCESS_TOKEN=your_tmdb_bearer_token_here
OMDB_API_KEY=your_omdb_api_key_here
```

#### How to obtain your TMDB API Key:
1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup).
2. Go to **Settings** → **API** (`https://www.themoviedb.org/settings/api`).
3. Request an API key (choose "Developer").
4. Copy your **API Key (v3 auth)** and/or **API Read Access Token (v4 auth)** into `server/.env`.

#### How to obtain your OMDb API Key:
1. Visit [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx).
2. Select the free 1,000 requests/day tier and enter your email.
3. Check your email, click the activation link, and paste the API key into `server/.env`.

> **Note**: Even if you test the app before adding API keys, a built-in collection of iconic movies (*Shutter Island, The Conjuring, Hereditary, Inception, Interstellar, Get Out, Se7en, etc.*) is provided so the entire application remains fully browsable and interactive!

---

### 3. Run Locally

From the root project directory:
```bash
npm run dev
```
This runs both the Express backend (`http://localhost:5000`) and the Vite client (`http://localhost:5173`) concurrently.

Open your browser to **`http://localhost:5173`**.

---

### 4. Production Build

To build the client bundle for production deployment:
```bash
npm run build
```
To run the backend server in production mode:
```bash
npm start
```

---

## 🧮 Quality Score Algorithm

Raw ratings can be misleading: an obscure title with a single 10/10 rating should not outrank a critically acclaimed film with an 8.7 rating backed by 500,000 votes.

EnjoyMovie calculates a balanced `qualityScore`:
$$WR = \left(\frac{v}{v + m}\right) \cdot R + \left(\frac{m}{v + m}\right) \cdot C + \text{Bonus}_{\text{pop}} + \text{Bonus}_{\text{recency}}$$

Where:
- $R$ = Primary IMDb rating (or TMDB fallback).
- $v$ = Verified vote volume.
- $m$ = Minimum vote threshold ($1,000$ votes).
- $C$ = Historical mean catalog rating ($6.8$).
- $\text{Bonus}_{\text{pop}}$ = Logarithmic popularity bonus.
- $\text{Bonus}_{\text{recency}}$ = Recency bonus for modern releases.

---

## 📜 Attribution & Legal

- This product uses the TMDB API but is not endorsed or certified by TMDB.
- Enriched ratings are retrieved using OMDb API.
- All movie posters and backdrop key art are hosted via TMDB CDN under non-commercial developer terms.
