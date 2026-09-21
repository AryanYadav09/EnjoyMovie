import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorMessage({ title = 'Unable to Load Movies', message, onRetry }) {
  return (
    <div className="p-8 sm:p-12 rounded-2xl glass-surface border border-red-500/20 text-center my-8 max-w-xl mx-auto">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-outfit font-bold text-lg text-cinema-heading mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-cinema-muted leading-relaxed mb-6">
        {message || 'A network error or API timeout occurred while communicating with the movie provider. Please verify your connection or try again.'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-cinema-stroke text-cinema-heading text-xs font-semibold hover:border-amber-accent/50 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-accent" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
