import React, { useEffect } from 'react';
import { X, Film } from 'lucide-react';

export function TrailerModal({ trailerKey, title, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl glass-elevated overflow-hidden border border-cinema-stroke shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cinema-stroke bg-surface-2/90">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-accent" />
            <h3 className="font-outfit font-semibold text-sm sm:text-base text-cinema-heading truncate max-w-md">
              {title ? `${title} — Official Trailer` : 'Official Trailer'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cinema-muted hover:text-cinema-heading hover:bg-white/10 transition-colors"
            aria-label="Close trailer modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {trailerKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=0&rel=0`}
              title={`${title} Trailer`}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="text-center p-8 text-cinema-muted">
              <Film className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-accent" />
              <p className="text-sm">No official trailer video available for this title.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
