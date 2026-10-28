import React, { useState } from 'react';
import { ArrowRight, Plus, Check, Folder, Video, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { EnhancedBatch } from '../services/api';
import { Batch } from '../data/batchesData';

export type UnifiedBatch = EnhancedBatch | Batch | {
  id: string;
  numericId?: number;
  batchIdNumeric?: number;
  title: string;
  thumbnail: string;
  category?: string;
  classCategory?: string;
  year?: string;
  academicYear?: string;
  mode?: string;
  description?: string;
  tag?: string;
  subjects?: Array<{ name: string; chapters: Array<{ lectures: any[]; notes: any[] }> }>;
};

interface BatchCardProps {
  batch: UnifiedBatch;
  isEnrolled?: boolean;
  onToggleEnroll?: (e: React.MouseEvent, batchId: string) => void;
  onSelect: (batch: any) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({
  batch,
  isEnrolled = false,
  onToggleEnroll,
  onSelect,
}) => {
  const [imgError, setImgError] = useState(false);

  // Normalize properties across EnhancedBatch and standard Batch
  const category = (batch as any).category || (batch as any).classCategory || 'Science & Boards';
  const year = (batch as any).year || (batch as any).academicYear || '2025-26';
  const mode = (batch as any).mode || 'Live & Recorded';
  const numericId = (batch as any).numericId || (batch as any).batchIdNumeric || batch.id;
  const tag = (batch as any).tag || 'Complete Batch';
  const description = batch.description || 'Full academic course with live & recorded video lectures, chapterwise PDF notes, tests and question banks.';

  // If standard Batch with subjects is provided, compute counts
  let subjectNames = '';
  if ((batch as any).subjects && Array.isArray((batch as any).subjects)) {
    subjectNames = (batch as any).subjects.map((s: any) => s.name).join(', ');
  }

  return (
    <div 
      onClick={() => onSelect(batch)}
      className="w-full max-w-full rounded-2xl sm:rounded-3xl bg-[#130720]/90 backdrop-blur-md border border-pink-500/25 hover:border-pink-500/70 overflow-hidden flex flex-col group shadow-lg hover:shadow-[0_10px_35px_rgba(236,72,153,0.22)] transition-all duration-300 hover:-translate-y-1 cursor-pointer box-border"
    >
      {/* 1. Large 16:9 Thumbnail with Overlay & Badges */}
      <div className="relative w-full aspect-video bg-[#0a0312] overflow-hidden select-none">
        {!imgError ? (
          <img
            src={batch.thumbnail}
            alt={batch.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2a103c] via-[#1b0829] to-[#0d0317] flex flex-col items-center justify-center p-4 text-center">
            <span className="text-pink-400 font-extrabold text-xs uppercase tracking-widest mb-1.5 px-2 py-0.5 rounded bg-pink-950/70 border border-pink-500/30">
              {category}
            </span>
            <span className="text-white font-bold text-sm sm:text-base line-clamp-2 px-3">
              {batch.title}
            </span>
          </div>
        )}

        {/* Soft bottom vignette for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#130720] via-transparent to-black/25 opacity-90 pointer-events-none" />

        {/* Top-Left: Class Category & Academic Year */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-[10px] sm:text-[11px] tracking-wide uppercase shadow-md shadow-pink-900/50">
            {category}
          </span>
          <span className="px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md text-pink-200 font-bold text-[10px] sm:text-[11px] border border-pink-500/30 shadow-sm">
            {year}
          </span>
        </div>

        {/* Top-Right: Enrolled status or 100% Free badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center">
          {isEnrolled ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600/95 backdrop-blur-md text-white font-black text-[10px] sm:text-[11px] flex items-center gap-1 shadow-md shadow-emerald-950/60 border border-emerald-400/40">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span>ENROLLED</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-emerald-400 font-extrabold text-[10px] sm:text-[11px] border border-emerald-500/35 shadow-sm">
              100% FREE
            </span>
          )}
        </div>

        {/* Bottom-Right: Mode Badge */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3">
          <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-pink-300 font-bold text-[10px] sm:text-[11px] border border-pink-500/30 flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{mode}</span>
          </span>
        </div>
      </div>

      {/* 2. Card Body: Clean, readable & nicely spaced */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata chips row */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="text-pink-400 font-bold">Batch #{numericId}</span>
            <span className="text-slate-600" aria-hidden="true">•</span>
            <span className="text-slate-300 font-medium">{category}</span>
            <span className="text-slate-600" aria-hidden="true">•</span>
            <span className="text-emerald-400 font-bold">Full Syllabus</span>
          </div>

          {/* Batch Title: Large, bold, easy to read on mobile */}
          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-pink-300 transition-colors line-clamp-2 leading-snug mb-2">
            {batch.title}
          </h3>

          {/* Batch Description or Subject List */}
          {subjectNames ? (
            <div className="text-xs text-slate-400 mb-3.5 bg-[#190b28] p-2.5 rounded-xl border border-pink-500/15">
              <span className="text-pink-400 font-semibold">Subjects: </span>
              <span className="text-slate-300 line-clamp-1">{subjectNames}</span>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed mb-3.5">
              {description}
            </p>
          )}

          {/* Feature Highlights Bar */}
          <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 mb-4 rounded-xl bg-[#170a24] border border-pink-500/15 text-[11px] text-slate-300 text-center">
            <div className="flex items-center justify-center gap-1 text-pink-300 font-medium">
              <Video className="w-3 h-3 text-pink-400 shrink-0" />
              <span className="truncate">HD Lectures</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-rose-300 font-medium border-x border-pink-500/15 px-1">
              <FileText className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="truncate">PDF Notes</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-fuchsia-300 font-medium">
              <Folder className="w-3 h-3 text-fuchsia-400 shrink-0" />
              <span className="truncate">All Folders</span>
            </div>
          </div>
        </div>

        {/* 3. Card Action Footer: Big Let's Study & Enroll buttons */}
        <div className="pt-3 border-t border-pink-500/15 flex items-center gap-2.5">
          {/* Primary Let's Study Button (Mobile Thumb Friendly & Prominent Pink) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(batch);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-pink-600/35 hover:shadow-pink-500/50 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Let's Study</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Enroll / Enrolled Button */}
          {onToggleEnroll && (
            <button
              onClick={(e) => onToggleEnroll(e, String(batch.id))}
              className={`py-3 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isEnrolled
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 shadow-sm'
                  : 'bg-[#220c38] hover:bg-pink-900/40 border-pink-500/35 text-pink-300 hover:text-white'
              }`}
              title={isEnrolled ? 'Enrolled Batch' : 'Enroll into this batch'}
              aria-label={isEnrolled ? 'Enrolled in batch' : 'Enroll in batch'}
            >
              {isEnrolled ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="hidden xs:inline sm:hidden md:inline">Enrolled</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-pink-400" />
                  <span className="hidden xs:inline sm:hidden md:inline">Enroll</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
