import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Bookmark, Sparkles, Menu, X, Film, Key, Database } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { movieApi } from '../../services/api';

export function Navbar({ onOpenQuiz, onOpenApiKeyModal }) {
  const { count } = useWatchlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearchOpen, setNavSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    movieApi.getConfigStatus()
      .then(res => {
        setIsLiveConnected(Boolean(res.tmdbConfigured));
      })
      .catch(() => setIsLiveConnected(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setNavSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Discover', path: '/discover' },
    { label: 'Top Rated', path: '/discover?sort=rating&minRating=7.5' },
    { label: 'Recent', path: '/discover?sort=newest' },
    { label: 'Watchlist', path: '/watchlist', badge: count },
    { label: 'About', path: '/about' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-surface border-b border-cinema-stroke">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-surface-2 border border-white/10 flex items-center justify-center group-hover:border-amber-accent/60 group-hover:shadow-cinema-glow transition-all duration-300">
            <Film className="w-5 h-5 text-amber-accent" />
          </div>
          <div className="flex flex-col">
            <span className="font-outfit font-extrabold text-lg text-cinema-heading tracking-tight flex items-center gap-1">
              Movie<span className="text-amber-accent">Finder</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-amber-accent bg-white/5 font-semibold'
                    : 'text-cinema-body hover:text-cinema-heading hover:bg-white/5'
                }`
              }
            >
              {link.label}
              {typeof link.badge === 'number' && link.badge > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-accent text-canvas tnum">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          {/* TMDB Live Connection Status Chip */}
          <button
            onClick={onOpenApiKeyModal}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              isLiveConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-accent/15 text-amber-accent border-amber-accent/40 shadow-cinema-glow hover:bg-amber-accent/25'
            }`}
            title="Configure TMDB API key to search 800,000+ movies"
          >
            {isLiveConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live TMDB (800K+)</span>
              </>
            ) : (
              <>
                <Key className="w-3 h-3 text-amber-accent" />
                <span>Connect Live TMDB</span>
              </>
            )}
          </button>

          {/* Quick Search Toggle */}
          {navSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                autoFocus
                className="w-48 sm:w-64 h-9 pl-3 pr-8 rounded-lg bg-surface-2 border border-amber-accent text-cinema-heading text-xs focus:outline-none focus:ring-1 focus:ring-amber-accent"
              />
              <button
                type="button"
                onClick={() => setNavSearchOpen(false)}
                className="absolute right-2 text-cinema-muted hover:text-cinema-heading"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setNavSearchOpen(true)}
              className="p-2 rounded-lg text-cinema-muted hover:text-cinema-heading hover:bg-white/5 transition-colors"
              aria-label="Open search input"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* "What Should I Watch?" Modal Trigger */}
          <button
            onClick={onOpenQuiz}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-accent to-amber-deep text-canvas text-xs font-bold hover:brightness-110 shadow-cinema-glow transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>What Should I Watch?</span>
          </button>

          {/* Mobile Watchlist shortcut */}
          <Link
            to="/watchlist"
            className="md:hidden relative p-2 rounded-lg text-cinema-muted hover:text-cinema-heading"
            aria-label="Watchlist"
          >
            <Bookmark className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-accent text-canvas text-[10px] font-bold flex items-center justify-center tnum">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-cinema-muted hover:text-cinema-heading"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cinema-stroke glass-elevated px-4 pt-3 pb-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-cinema-body hover:bg-white/5 hover:text-amber-accent"
            >
              <span>{link.label}</span>
              {typeof link.badge === 'number' && link.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-accent text-canvas tnum">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="pt-2 border-t border-cinema-stroke space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenApiKeyModal) onOpenApiKeyModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-2 border border-amber-accent/40 text-amber-accent text-xs font-semibold"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isLiveConnected ? 'TMDB API Configured (Active)' : 'Connect Live TMDB (800K+ Movies)'}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenQuiz) onOpenQuiz();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-accent text-canvas text-sm font-bold shadow-cinema-glow"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>What Should I Watch?</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
