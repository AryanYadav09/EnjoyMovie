import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-cinema-stroke bg-surface-1 py-12 text-sm text-cinema-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-surface-2 border border-white/10 flex items-center justify-center">
                <Film className="w-4 h-4 text-amber-accent" />
              </div>
              <span className="font-outfit font-bold text-base text-cinema-heading">
                Movie<span className="text-amber-accent">Finder</span>
              </span>
            </div>
            <p className="text-xs text-cinema-muted leading-relaxed max-w-sm mb-4">
              A modern movie discovery engine engineered for cinephiles. Discover high-quality films based on rich genre combinations, genuine IMDb ratings, and weighted quality metrics without manual research.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-outfit font-semibold text-cinema-heading text-xs uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/discover" className="hover:text-amber-accent transition-colors">Advanced Discovery</Link></li>
              <li><Link to="/discover?sort=rating&minRating=8.0" className="hover:text-amber-accent transition-colors">Top Rated (8.0+)</Link></li>
              <li><Link to="/discover?sort=newest" className="hover:text-amber-accent transition-colors">Recent Releases</Link></li>
              <li><Link to="/watchlist" className="hover:text-amber-accent transition-colors">My Watchlist</Link></li>
            </ul>
          </div>

          {/* Legal & Attribution */}
          <div>
            <h4 className="font-outfit font-semibold text-cinema-heading text-xs uppercase tracking-wider mb-3">
              Attribution
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-amber-accent transition-colors">API Credits & Notices</Link></li>
              <li>
                <a 
                  href="https://www.themoviedb.org/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-amber-accent transition-colors"
                >
                  The Movie Database (TMDB)
                </a>
              </li>
              <li>
                <a 
                  href="https://www.omdbapi.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-amber-accent transition-colors"
                >
                  OMDb API
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* TMDB Compliance Banner */}
        <div className="pt-8 border-t border-cinema-stroke/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cinema-muted/80">
          <p>
            This product uses the TMDB and OMDb APIs but is not endorsed or certified by TMDB or IMDb.
          </p>
          <p>
            © {new Date().getFullYear()} MovieFinder. Designed for film lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
