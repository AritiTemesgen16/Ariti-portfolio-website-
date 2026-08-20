import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PROFILE } from '../../data/portfolioData';
import { useProfilePhoto } from '../../context/ProfilePhotoContext';

interface ProfilePhotoCardProps {
  className?: string;
  showUploadButton?: boolean;
}

/**
 * Public profile photo display.
 * Photo management controls are intentionally not rendered here.
 * Upload/replace functionality must live behind an authenticated owner workflow.
 */
export const ProfilePhotoCard: React.FC<ProfilePhotoCardProps> = ({ className = '' }) => {
  const { photoUrl, isCustom } = useProfilePhoto();

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl group ${className}`}>
      <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-square relative overflow-hidden bg-slate-950">
        <img
          src={photoUrl || PROFILE.profileImage}
          alt={`${PROFILE.name} - Software Developer & Full-Stack Engineer`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {isCustom && (
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-emerald-300 text-[11px] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified profile photo</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1 z-10">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lg font-bold text-white tracking-tight">{PROFILE.name}</h4>
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-mono-tech whitespace-nowrap">
            Full-Stack Engineer
          </span>
        </div>
        <p className="text-xs text-slate-300 font-mono-tech flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Computer Science & Management • {PROFILE.location}
        </p>
      </div>
    </div>
  );
};
