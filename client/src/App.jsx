import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { ActivityProvider } from './context/ActivityContext';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { TrailerModal } from './components/TrailerModal/TrailerModal';
import { WhatShouldIWatchModal } from './components/WhatShouldIWatchModal/WhatShouldIWatchModal';
import { ApiKeyModal } from './components/ApiKeyModal/ApiKeyModal';

import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { MovieDetails } from './pages/MovieDetails';
import { Search } from './pages/Search';
import { Watchlist } from './pages/Watchlist';
import { About } from './pages/About';

export function App() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [trailerData, setTrailerData] = useState({
    isOpen: false,
    trailerKey: null,
    title: ''
  });

  const handleWatchTrailer = (movie) => {
    if (!movie) return;
    setTrailerData({
      isOpen: true,
      trailerKey: movie.trailerKey || null,
      title: movie.title || ''
    });
  };

  const handleCloseTrailer = () => {
    setTrailerData({
      isOpen: false,
      trailerKey: null,
      title: ''
    });
  };

  return (
    <WatchlistProvider>
      <ActivityProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-canvas text-cinema-body selection:bg-amber-accent selection:text-canvas">
          {/* Top Navigation */}
          <Navbar
            onOpenQuiz={() => setQuizOpen(true)}
            onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
          />

          {/* Main Routing Views */}
          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    onOpenQuiz={() => setQuizOpen(true)}
                    onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
                    onWatchTrailer={handleWatchTrailer}
                  />
                }
              />
              <Route
                path="/discover"
                element={
                  <Discover
                    onWatchTrailer={handleWatchTrailer}
                    onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
                  />
                }
              />
              <Route
                path="/movie/:id"
                element={<MovieDetails onWatchTrailer={handleWatchTrailer} />}
              />
              <Route
                path="/search"
                element={<Search onWatchTrailer={handleWatchTrailer} />}
              />
              <Route
                path="/watchlist"
                element={<Watchlist onWatchTrailer={handleWatchTrailer} />}
              />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />

          {/* Global Modals */}
          <TrailerModal
            isOpen={trailerData.isOpen}
            trailerKey={trailerData.trailerKey}
            title={trailerData.title}
            onClose={handleCloseTrailer}
          />

          <WhatShouldIWatchModal
            isOpen={quizOpen}
            onClose={() => setQuizOpen(false)}
            onWatchTrailer={handleWatchTrailer}
          />

          <ApiKeyModal
            isOpen={apiKeyModalOpen}
            onClose={() => setApiKeyModalOpen(false)}
          />
        </div>
      </BrowserRouter>
    </ActivityProvider>
  </WatchlistProvider>
  );
}

export default App;
