import React, { useState } from 'react';
import { Star, User, Calendar } from 'lucide-react';

export function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);

  if (!review) return null;

  const isLong = review.content && review.content.length > 320;
  const displayContent = expanded || !isLong 
    ? review.content 
    : review.content.slice(0, 320) + '...';

  const formattedDate = review.createdAt 
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-surface-2 border border-cinema-stroke hover:border-white/15 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        {/* Author Avatar & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-3 flex-shrink-0 border border-white/10 flex items-center justify-center">
            {review.avatar ? (
              <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-cinema-muted" />
            )}
          </div>

          <div>
            <h4 className="font-outfit font-semibold text-sm text-cinema-heading">
              {review.author}
            </h4>
            {formattedDate && (
              <div className="flex items-center gap-1 text-xs text-cinema-muted mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating if provided */}
        {review.rating ? (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-cinema/10 border border-gold-cinema/30 text-gold-cinema text-xs font-bold font-outfit tnum">
            <Star className="w-3.5 h-3.5 fill-gold-cinema" />
            <span>{review.rating}/10</span>
          </div>
        ) : null}
      </div>

      {/* Review Text */}
      <p className="text-xs sm:text-sm text-cinema-body/90 leading-relaxed whitespace-pre-line">
        {displayContent}
      </p>

      {/* Read More / Read Less Toggle */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-semibold text-amber-accent hover:text-amber-deep transition-colors"
        >
          {expanded ? 'Show Less' : 'Read Full Review'}
        </button>
      )}
    </div>
  );
}
