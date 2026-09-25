import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ArrowRight } from 'lucide-react';

export function SearchBar({
  initialValue = '',
  placeholder = 'Search movies, genres, or type "dark psychological thrillers from 2010 onwards"...',
  isNlpDefault = true,
  onSearch
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [isNlp, setIsNlp] = useState(isNlpDefault);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query.trim(), isNlp);
    } else {
      navigate(`/search?q=${encodeURIComponent(query.trim())}&nlp=${isNlp}`);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full group"
    >
      <div className="relative flex items-center h-[52px] rounded-xl bg-surface-2/80 backdrop-blur-md border border-cinema-stroke group-focus-within:border-amber-accent/80 group-focus-within:shadow-cinema-glow transition-all duration-300">
        {/* Left Search Icon */}
        <div className="pl-4 pr-2 text-cinema-muted group-focus-within:text-amber-accent transition-colors">
          <Search className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm sm:text-base text-cinema-heading placeholder:text-cinema-muted/70 focus:outline-none pr-3"
        />

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pr-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-cinema-muted hover:text-cinema-heading hover:bg-white/5 transition-colors"
              aria-label="Clear search text"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* NLP Toggle Button */}
          <button
            type="button"
            onClick={() => setIsNlp(!isNlp)}
            title={isNlp ? "Smart search filters enabled" : "Standard keyword search"}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isNlp
                ? 'bg-amber-accent/15 text-amber-accent border-amber-accent/40 shadow-sm'
                : 'bg-white/5 text-cinema-muted border-white/10 hover:text-cinema-body'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Smart Filters</span>
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!query.trim()}
            className="h-9 px-3.5 rounded-lg bg-amber-accent text-canvas text-xs font-bold hover:bg-amber-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-cinema-glow"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </form>
  );
}
