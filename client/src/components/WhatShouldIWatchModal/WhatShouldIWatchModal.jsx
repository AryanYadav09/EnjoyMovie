import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { movieApi } from '../../services/api';
import { MovieGrid } from '../MovieGrid/MovieGrid';

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance',
  'Science Fiction', 'Thriller'
];

const MOOD_OPTIONS = [
  { id: 'adrenaline', label: 'Adrenaline Rush', desc: 'Fast, thrilling, heart-pounding tension', icon: '⚡' },
  { id: 'mind-bending', label: 'Mind-Bending', desc: 'Puzzles, twists, psychological intrigue', icon: '🧠' },
  { id: 'dark-chilling', label: 'Dark & Chilling', desc: 'Atmospheric dread, shadows, chills', icon: '👻' },
  { id: 'feel-good', label: 'Feel-Good', desc: 'Warmth, laughs, high spirits', icon: '☀️' },
  { id: 'emotional', label: 'Deep & Emotional', desc: 'Tears, poignant storytelling, love', icon: '❤️' },
  { id: 'escapist', label: 'Grand Escapism', desc: 'Worlds of wonder and epic adventure', icon: '🚀' }
];

const RATING_OPTIONS = [
  { value: 6.5, label: '6.5+ Good Watch' },
  { value: 7.0, label: '7.0+ High Quality' },
  { value: 7.5, label: '7.5+ Outstanding' },
  { value: 8.0, label: '8.0+ Masterpiece' }
];

const ERA_OPTIONS = [
  { id: 'any', label: 'Any Era', desc: 'From golden age to modern day' },
  { id: 'recent', label: '2021 – 2026', desc: 'Fresh from recent cinema' },
  { id: 'modern', label: '2010 – 2020', desc: 'Peak modern filmmaking' },
  { id: '2000s', label: '2000s', desc: 'Millennium classics' },
  { id: '90s', label: '1990s', desc: 'The golden decade of cinema' },
  { id: 'classic', label: 'Pre-1990s', desc: 'Timeless vintage cinema' }
];

const LENGTH_OPTIONS = [
  { id: 'any', label: 'Any Runtime', desc: 'Whatever the story demands' },
  { id: 'under-90', label: 'Under 90 min', desc: 'Quick, punchy, no filler' },
  { id: '90-120', label: '90 – 120 min', desc: 'Standard sweet-spot feature' },
  { id: '120-150', label: '120 – 150 min', desc: 'Immersive deep dive' },
  { id: '150-plus', label: '150+ min', desc: 'Epic blockbuster scale' }
];

export function WhatShouldIWatchModal({ isOpen, onClose, onWatchTrailer }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    genre: 'Horror',
    mood: 'dark-chilling',
    minRating: 7.0,
    era: 'recent',
    runtimeLength: '90-120'
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      executeQuizSearch();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const executeQuizSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieApi.quizRecommendations(answers);
      setResults(res.movies || []);
      setStep(6); // Show results
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl glass-elevated border border-cinema-stroke shadow-2xl p-6 sm:p-8 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-cinema-muted hover:text-cinema-heading hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-amber-accent mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs uppercase font-bold tracking-wider">Cinephile Matchmaker</span>
        </div>
        <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-cinema-heading mb-6">
          {step === 6 ? 'Personalized Discoveries' : 'What Should I Watch?'}
        </h2>

        {/* Step Progress Indicator (when on questions) */}
        {step <= 5 && (
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'bg-amber-accent shadow-cinema-glow'
                    : s < step
                    ? 'bg-amber-accent/50'
                    : 'bg-surface-3'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step 1: Choose Primary Genre */}
        {step === 1 && (
          <div>
            <h3 className="text-sm font-semibold text-cinema-heading uppercase tracking-wider mb-2">
              Step 1 of 5: What Genre are you in the mood for?
            </h3>
            <p className="text-xs text-cinema-muted mb-4">Pick a primary film genre to anchor recommendations.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {GENRE_OPTIONS.map((g) => {
                const selected = answers.genre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setAnswers({ ...answers, genre: g })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-amber-accent/20 border-amber-accent text-amber-accent font-semibold shadow-cinema-glow'
                        : 'bg-surface-2 border-cinema-stroke text-cinema-body hover:bg-surface-3'
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span>{g}</span>
                      {selected && <Check className="w-4 h-4 text-amber-accent" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Choose Mood */}
        {step === 2 && (
          <div>
            <h3 className="text-sm font-semibold text-cinema-heading uppercase tracking-wider mb-2">
              Step 2 of 5: What vibe or emotional tone do you want?
            </h3>
            <p className="text-xs text-cinema-muted mb-4">Match your energy with cinematic pacing and theme.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOOD_OPTIONS.map((m) => {
                const selected = answers.mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAnswers({ ...answers, mood: m.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-amber-accent/20 border-amber-accent text-amber-accent shadow-cinema-glow'
                        : 'bg-surface-2 border-cinema-stroke text-cinema-body hover:bg-surface-3'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{m.icon}</span>
                      <span className="font-semibold text-sm text-cinema-heading">{m.label}</span>
                    </div>
                    <p className="text-xs text-cinema-muted">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Minimum Rating */}
        {step === 3 && (
          <div>
            <h3 className="text-sm font-semibold text-cinema-heading uppercase tracking-wider mb-2">
              Step 3 of 5: Minimum Acceptable Rating
            </h3>
            <p className="text-xs text-cinema-muted mb-4">Filters out low-rated clutter using weighted IMDb/TMDB scores.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RATING_OPTIONS.map((r) => {
                const selected = answers.minRating === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setAnswers({ ...answers, minRating: r.value })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-gold-cinema/20 border-gold-cinema text-gold-cinema shadow-cinema-gold-glow'
                        : 'bg-surface-2 border-cinema-stroke text-cinema-body hover:bg-surface-3'
                    }`}
                  >
                    <div className="flex items-center justify-between text-base font-outfit font-bold">
                      <span>★ {r.label}</span>
                      {selected && <Check className="w-4 h-4 text-gold-cinema" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Release Era */}
        {step === 4 && (
          <div>
            <h3 className="text-sm font-semibold text-cinema-heading uppercase tracking-wider mb-2">
              Step 4 of 5: Which release era?
            </h3>
            <p className="text-xs text-cinema-muted mb-4">Choose modern high-def releases or retro masterpieces.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ERA_OPTIONS.map((era) => {
                const selected = answers.era === era.id;
                return (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() => setAnswers({ ...answers, era: era.id })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-amber-accent/20 border-amber-accent text-amber-accent shadow-cinema-glow'
                        : 'bg-surface-2 border-cinema-stroke text-cinema-body hover:bg-surface-3'
                    }`}
                  >
                    <h4 className="font-semibold text-sm text-cinema-heading mb-0.5">{era.label}</h4>
                    <p className="text-[11px] text-cinema-muted">{era.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Runtime Length */}
        {step === 5 && (
          <div>
            <h3 className="text-sm font-semibold text-cinema-heading uppercase tracking-wider mb-2">
              Step 5 of 5: How much time do you have tonight?
            </h3>
            <p className="text-xs text-cinema-muted mb-4">Picks films tailored to your schedule.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LENGTH_OPTIONS.map((len) => {
                const selected = answers.runtimeLength === len.id;
                return (
                  <button
                    key={len.id}
                    type="button"
                    onClick={() => setAnswers({ ...answers, runtimeLength: len.id })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-amber-accent/20 border-amber-accent text-amber-accent shadow-cinema-glow'
                        : 'bg-surface-2 border-cinema-stroke text-cinema-body hover:bg-surface-3'
                    }`}
                  >
                    <h4 className="font-semibold text-sm text-cinema-heading mb-0.5">{len.label}</h4>
                    <p className="text-[11px] text-cinema-muted">{len.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Personalized Results Display */}
        {step === 6 && (
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3.5 rounded-xl bg-surface-2 border border-cinema-stroke text-xs">
              <span className="text-cinema-muted">Your Recipe:</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-accent/20 text-amber-accent font-semibold">{answers.genre}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-cinema-heading">{answers.mood}</span>
              <span className="px-2 py-0.5 rounded-md bg-gold-cinema/20 text-gold-cinema font-bold font-outfit">★ {answers.minRating}+</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-cinema-heading">{answers.era}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-cinema-heading">{answers.runtimeLength}</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <RefreshCw className="w-8 h-8 text-amber-accent animate-spin mb-3" />
                <p className="text-sm font-semibold text-cinema-heading">Searching high-quality films matching your taste...</p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center text-red-400">
                <p className="text-sm">{error}</p>
                <button onClick={executeQuizSearch} className="mt-3 px-4 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold">Retry</button>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto pr-1">
                <MovieGrid movies={results} onWatchTrailer={onWatchTrailer} />
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-cinema-stroke flex items-center justify-between">
          {step > 1 && step <= 5 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-cinema-body text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : step === 6 ? (
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-cinema-body text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          ) : (
            <div />
          )}

          {step <= 5 && (
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-amber-accent text-canvas text-xs font-bold hover:bg-amber-deep shadow-cinema-glow transition-all"
            >
              <span>{step === 5 ? 'Find My Movies' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 6 && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-amber-accent text-canvas text-xs font-bold hover:bg-amber-deep shadow-cinema-glow transition-all"
            >
              Close & Browse
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
