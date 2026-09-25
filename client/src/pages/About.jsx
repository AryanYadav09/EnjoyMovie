import React from 'react';
import { Film, ShieldCheck, Database, Award, ExternalLink } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2 border border-cinema-stroke text-amber-accent text-xs font-semibold uppercase tracking-wider">
          <Film className="w-3.5 h-3.5" />
          <span>Product Standards & Attribution</span>
        </div>
        <h1 className="font-outfit text-3xl sm:text-4xl font-extrabold text-cinema-heading">
          About EnjoyMovie
        </h1>
        <p className="text-sm sm:text-base text-cinema-muted max-w-xl mx-auto">
          Crafted to answer a single question: "What should I watch tonight?" with authoritative metrics and cinematic curation.
        </p>
      </div>

      {/* Required TMDB Attribution Section */}
      <div className="p-6 sm:p-8 rounded-2xl glass-elevated border border-cinema-stroke space-y-4">
        <div className="flex items-center gap-3 text-cyan-vivid">
          <Database className="w-6 h-6" />
          <h2 className="font-outfit text-xl font-bold text-cinema-heading">
            The Movie Database (TMDB) Attribution
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-cinema-body leading-relaxed">
          This product uses the TMDB API but is not endorsed or certified by TMDB. All movie titles, descriptions, backdrop images, poster imagery, genre taxonomies, credits, and community reviews are sourced directly through TMDB's public application programming interfaces under their non-commercial developer terms of use.
        </p>

        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-vivid hover:underline pt-2"
        >
          <span>Visit The Movie Database (TMDB)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* OMDb & IMDb Attribution Section */}
      <div className="p-6 sm:p-8 rounded-2xl glass-surface border border-cinema-stroke space-y-4">
        <div className="flex items-center gap-3 text-gold-cinema">
          <Award className="w-6 h-6" />
          <h2 className="font-outfit text-xl font-bold text-cinema-heading">
            IMDb & OMDb API Integration
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-cinema-body leading-relaxed">
          Verified IMDb ratings, vote counts, Metascores, and Rotten Tomatoes scores are enriched via the OMDb API service. No scraping is conducted against IMDb web properties. When IMDb data is not available for a specific title, official TMDB metrics are displayed and clearly identified as such.
        </p>

        <a
          href="https://www.omdbapi.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-cinema hover:underline pt-2"
        >
          <span>Visit OMDb API</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Ranking & Quality Score Philosophy */}
      <div className="p-6 sm:p-8 rounded-2xl glass-surface border border-cinema-stroke space-y-4">
        <div className="flex items-center gap-3 text-amber-accent">
          <ShieldCheck className="w-6 h-6" />
          <h2 className="font-outfit text-xl font-bold text-cinema-heading">
            Our Quality Score Metric
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-cinema-body leading-relaxed">
          Raw average ratings can easily deceive: an obscure film with a single 10/10 vote should never outrank a cinematic masterpiece with an 8.7 rating backed by 500,000 votes.
        </p>
        <p className="text-xs sm:text-sm text-cinema-body leading-relaxed">
          EnjoyMovie utilizes a Bayesian weighted rating algorithm with a credibility threshold of 1,000 votes, incorporating logarithmic popularity and subtle recency factors to deliver dependable, high-yield recommendations.
        </p>
      </div>
    </div>
  );
}
