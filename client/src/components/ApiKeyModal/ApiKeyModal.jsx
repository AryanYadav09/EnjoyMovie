import React, { useState } from 'react';
import { X, Key, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Database } from 'lucide-react';
import { movieApi } from '../../services/api';

export function ApiKeyModal({ isOpen, onClose, onKeyConnected }) {
  const [tmdbKey, setTmdbKey] = useState('');
  const [omdbKey, setOmdbKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tmdbKey.trim()) {
      setStatus({ type: 'error', message: 'Please enter your TMDB API Key.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await movieApi.updateApiKey({
        tmdbApiKey: tmdbKey.trim(),
        omdbApiKey: omdbKey.trim() || undefined
      });

      setStatus({
        type: 'success',
        message: res.message || 'TMDB API connected! Unlocked live access to 800,000+ movies.'
      });

      if (onKeyConnected) {
        onKeyConnected();
      }

      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to immediately stream live discovery
      }, 1500);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Verification failed. Please verify your TMDB API Key.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl glass-elevated border border-cinema-stroke shadow-2xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-cinema-muted hover:text-cinema-heading hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 text-amber-accent mb-2">
          <Database className="w-5 h-5" />
          <span className="text-xs uppercase font-bold tracking-wider">Live Movie Database Access</span>
        </div>
        <h2 className="font-outfit text-2xl font-bold text-cinema-heading mb-2">
          Connect TMDB API
        </h2>
        <p className="text-xs sm:text-sm text-cinema-muted leading-relaxed mb-6">
          To unlock the complete library of over <strong className="text-cinema-heading">800,000+ movies</strong>, live box office rankings, and endless genre intersections, connect your free TMDB API key below.
        </p>

        {/* How to get a free key callout */}
        <div className="p-3.5 rounded-xl bg-surface-2 border border-cinema-stroke mb-6 text-xs text-cinema-body/90 space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-cinema-heading">
            <span>Don't have a TMDB key yet?</span>
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-vivid hover:underline flex items-center gap-1"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-cinema-muted text-[11px] leading-normal">
            1. Sign in or create a free account at themoviedb.org<br/>
            2. Go to Settings → API and click "Create" → "Developer"<br/>
            3. Copy your <strong className="text-cinema-heading">API Key (v3 auth)</strong> and paste it below.
          </p>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`p-3.5 rounded-xl mb-4 text-xs flex items-start gap-2.5 ${
              status.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border border-red-500/30 text-red-300'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{status.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cinema-heading uppercase tracking-wider mb-1.5">
              TMDB API Key (v3) <span className="text-amber-accent">*</span>
            </label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-cinema-muted absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
                value={tmdbKey}
                onChange={(e) => setTmdbKey(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-2 border border-cinema-stroke text-cinema-heading text-xs focus:outline-none focus:border-amber-accent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cinema-heading uppercase tracking-wider mb-1.5">
              OMDb API Key <span className="text-cinema-muted font-normal lowercase">(optional for IMDb enrichment)</span>
            </label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-cinema-muted absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. a1b2c3d4"
                value={omdbKey}
                onChange={(e) => setOmdbKey(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-2 border border-cinema-stroke text-cinema-heading text-xs focus:outline-none focus:border-amber-accent font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-cinema-muted hover:text-cinema-heading text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !tmdbKey.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-amber-accent text-canvas text-xs font-bold hover:bg-amber-deep shadow-cinema-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Key...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>Connect & Unlock Library</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
