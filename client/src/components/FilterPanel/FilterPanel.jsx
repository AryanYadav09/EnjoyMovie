import React from 'react';
import { RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import { useGenres } from '../../hooks/useGenres';

export function FilterPanel({
  filters,
  onChange,
  onReset,
  className = ''
}) {
  const { genres } = useGenres();

  const handleGenreToggle = (genreName) => {
    const current = filters.genres || [];
    const exists = current.includes(genreName);
    const updated = exists
      ? current.filter(g => g !== genreName)
      : [...current, genreName];
    onChange({ genres: updated });
  };

  const handleLogicToggle = (logic) => {
    onChange({ genreLogic: logic });
  };

  const handleMinRatingChange = (e) => {
    onChange({ minRating: parseFloat(e.target.value) });
  };

  const handleVoteCountSelect = (votes) => {
    onChange({ minVotes: votes });
  };

  const handleEraSelect = (eraKey) => {
    const currentYear = new Date().getFullYear();
    switch (eraKey) {
      case 'this-year':
        onChange({ fromYear: currentYear, toYear: currentYear });
        break;
      case 'last-5':
        onChange({ fromYear: currentYear - 5, toYear: currentYear });
        break;
      case 'last-10':
        onChange({ fromYear: currentYear - 10, toYear: currentYear });
        break;
      case '2010s':
        onChange({ fromYear: 2010, toYear: 2019 });
        break;
      case '2000s':
        onChange({ fromYear: 2000, toYear: 2009 });
        break;
      case '1990s':
        onChange({ fromYear: 1990, toYear: 1999 });
        break;
      case '1980s':
        onChange({ fromYear: 1980, toYear: 1989 });
        break;
      case 'all':
      default:
        onChange({ fromYear: '', toYear: '' });
        break;
    }
  };

  const voteOptions = [
    { label: '100+', value: 100 },
    { label: '500+', value: 500 },
    { label: '1K+', value: 1000 },
    { label: '5K+', value: 5000 },
    { label: '10K+', value: 10000 },
    { label: '50K+', value: 50000 },
    { label: '100K+', value: 100000 }
  ];

  const eraOptions = [
    { label: 'All Time', key: 'all' },
    { label: 'This Year', key: 'this-year' },
    { label: 'Last 5 Yrs', key: 'last-5' },
    { label: 'Last 10 Yrs', key: 'last-10' },
    { label: '2010s', key: '2010s' },
    { label: '2000s', key: '2000s' },
    { label: '1990s', key: '1990s' },
    { label: '1980s', key: '1980s' }
  ];

  return (
    <aside className={`flex flex-col gap-6 p-5 rounded-2xl glass-surface border border-cinema-stroke ${className}`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cinema-stroke">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-accent" />
          <h2 className="font-outfit font-bold text-base text-cinema-heading">
            Filter System
          </h2>
        </div>

        <button
          onClick={onReset}
          className="text-xs text-cinema-muted hover:text-amber-accent flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Genres Multi-Select */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-cinema-heading uppercase tracking-wider">
            Genres {filters.genres?.length > 0 && `(${filters.genres.length})`}
          </label>

          {/* AND / OR logic switch */}
          <div className="flex items-center rounded-lg bg-surface-2 p-0.5 border border-cinema-stroke text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleLogicToggle('AND')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                filters.genreLogic === 'AND'
                  ? 'bg-amber-accent text-canvas shadow-sm'
                  : 'text-cinema-muted hover:text-cinema-body'
              }`}
              title="Movies matching ALL selected genres"
            >
              AND
            </button>
            <button
              type="button"
              onClick={() => handleLogicToggle('OR')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                filters.genreLogic === 'OR'
                  ? 'bg-amber-accent text-canvas shadow-sm'
                  : 'text-cinema-muted hover:text-cinema-body'
              }`}
              title="Movies matching ANY selected genre"
            >
              OR
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
          {genres.map((g) => {
            const isSelected = filters.genres?.includes(g.name);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGenreToggle(g.name)}
                className={`h-7 px-2.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-accent text-canvas border-amber-accent font-semibold shadow-cinema-glow'
                    : 'bg-white/5 border-cinema-stroke text-cinema-body hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Minimum Rating Slider */}
      <div className="pt-2 border-t border-cinema-stroke">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-cinema-heading uppercase tracking-wider">
            Minimum Rating
          </label>
          <span className="font-outfit font-bold text-sm text-gold-cinema tnum bg-gold-cinema/10 border border-gold-cinema/30 px-2 py-0.5 rounded-md">
            ★ {filters.minRating?.toFixed(1) || '0.0'}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="9.5"
          step="0.5"
          value={filters.minRating || 0}
          onChange={handleMinRatingChange}
          className="w-full h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-amber-accent"
        />

        <div className="flex justify-between text-[10px] text-cinema-muted mt-1 tnum">
          <span>0.0</span>
          <span>5.0</span>
          <span>7.0 (Recommended)</span>
          <span>9.0+</span>
        </div>
      </div>

      {/* 3. Minimum Vote Count Filter */}
      <div className="pt-2 border-t border-cinema-stroke">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-cinema-heading uppercase tracking-wider">
            Minimum Votes
          </label>
          <span className="text-xs text-cinema-muted tnum">
            {filters.minVotes?.toLocaleString()} votes
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {voteOptions.map((opt) => {
            const isSelected = filters.minVotes === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleVoteCountSelect(opt.value)}
                className={`py-1 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                  isSelected
                    ? 'bg-amber-accent/20 border-amber-accent text-amber-accent font-semibold'
                    : 'bg-white/5 border-cinema-stroke text-cinema-muted hover:text-cinema-body hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Release Era & Years */}
      <div className="pt-2 border-t border-cinema-stroke">
        <label className="text-xs font-semibold text-cinema-heading uppercase tracking-wider block mb-2">
          Release Era
        </label>

        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {eraOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleEraSelect(opt.key)}
              className="py-1 px-1 rounded-lg text-[11px] font-medium bg-white/5 border border-cinema-stroke text-cinema-muted hover:text-cinema-body hover:bg-white/10 text-center transition-colors truncate"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom Year Inputs */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <span className="text-[10px] text-cinema-muted mb-0.5 block">From</span>
            <input
              type="number"
              min="1900"
              max="2030"
              placeholder="1990"
              value={filters.fromYear || ''}
              onChange={(e) => onChange({ fromYear: e.target.value ? parseInt(e.target.value, 10) : '' })}
              className="w-full h-8 px-2 rounded-lg bg-surface-2 border border-cinema-stroke text-cinema-heading text-xs focus:outline-none focus:border-amber-accent"
            />
          </div>

          <span className="text-cinema-muted mt-4">→</span>

          <div className="flex-1">
            <span className="text-[10px] text-cinema-muted mb-0.5 block">To</span>
            <input
              type="number"
              min="1900"
              max="2030"
              placeholder="2026"
              value={filters.toYear || ''}
              onChange={(e) => onChange({ toYear: e.target.value ? parseInt(e.target.value, 10) : '' })}
              className="w-full h-8 px-2 rounded-lg bg-surface-2 border border-cinema-stroke text-cinema-heading text-xs focus:outline-none focus:border-amber-accent"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
