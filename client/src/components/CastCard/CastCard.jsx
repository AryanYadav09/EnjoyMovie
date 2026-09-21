import React from 'react';
import { User } from 'lucide-react';

export function CastCard({ member }) {
  if (!member) return null;

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-2/60 border border-cinema-stroke hover:border-white/20 transition-all flex-shrink-0 w-56">
      <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-3 flex-shrink-0 border border-white/10">
        {member.avatar ? (
          <img
            src={member.avatar}
            alt={member.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cinema-muted">
            <User className="w-5 h-5 opacity-40" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="font-outfit font-semibold text-sm text-cinema-heading truncate leading-tight">
          {member.name}
        </h4>
        <p className="text-xs text-cinema-muted truncate mt-0.5">
          {member.character || 'Cast'}
        </p>
      </div>
    </div>
  );
}
