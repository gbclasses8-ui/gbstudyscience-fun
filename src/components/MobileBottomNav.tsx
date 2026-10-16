import React from 'react';
import { Home, Layers, FileText, Bookmark, Send } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'batches' | 'notes';
  onSelectTab: (tab: 'home' | 'batches' | 'notes') => void;
  onOpenSearch: () => void;
  onOpenTelegram: () => void;
  enrolledCount?: number;
  onSelectFavorites?: () => void;
  isFavoritesActive?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenTelegram,
  enrolledCount = 0,
  onSelectFavorites,
  isFavoritesActive = false,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full bg-[#0d0715]/95 backdrop-blur-xl border-t border-pink-500/25 px-1 py-1 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] shadow-[0_-5px_20px_rgba(0,0,0,0.5)] box-border"
    >
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        {/* 1. Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home' && !isFavoritesActive 
              ? 'text-pink-400 font-extrabold scale-105' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5 mb-0.5" />
            {activeTab === 'home' && !isFavoritesActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-pink-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight">Home</span>
        </button>

        {/* 2. All Batches */}
        <button
          onClick={() => onSelectTab('batches')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'batches' && !isFavoritesActive 
              ? 'text-pink-400 font-extrabold scale-105' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Layers className="w-5 h-5 mb-0.5" />
            {activeTab === 'batches' && !isFavoritesActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-pink-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight">Batches</span>
        </button>

        {/* 3. Enrolled / Favorites */}
        <button
          onClick={() => {
            if (onSelectFavorites) {
              onSelectFavorites();
            } else {
              onSelectTab('batches');
            }
          }}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
            isFavoritesActive 
              ? 'text-pink-400 font-extrabold scale-105' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 mb-0.5 ${isFavoritesActive ? 'fill-pink-500/30' : ''}`} />
            {enrolledCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                {enrolledCount}
              </span>
            )}
            {isFavoritesActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-pink-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight">Enrolled</span>
        </button>

        {/* 4. Notes / PDF */}
        <button
          onClick={() => onSelectTab('notes')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'notes' 
              ? 'text-pink-400 font-extrabold scale-105' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <FileText className="w-5 h-5 mb-0.5" />
            {activeTab === 'notes' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-pink-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight">Notes</span>
        </button>

        {/* 5. Telegram */}
        <button
          onClick={onOpenTelegram}
          className="flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-pink-400 hover:text-pink-300 font-bold transition-all cursor-pointer"
        >
          <div className="relative">
            <Send className="w-5 h-5 mb-0.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-tight text-pink-300">Telegram</span>
        </button>
      </div>
    </nav>
  );
};
