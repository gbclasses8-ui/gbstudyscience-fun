import React, { useState } from 'react';
import { Search, Send, Menu, X, BookOpen, Layers, FileText, Bookmark, Sparkles, Heart } from 'lucide-react';
import { BRAND_ASSETS } from '../data/batchesData';

interface NavbarProps {
  activeTab: 'home' | 'batches' | 'notes';
  onSelectTab: (tab: 'home' | 'batches' | 'notes') => void;
  onOpenSearch: () => void;
  onOpenTelegram: () => void;
  selectedClassFilter?: string;
  onSelectClassFilter?: (cls: string) => void;
  enrolledCount?: number;
  onSelectFavorites?: () => void;
  isFavoritesActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenTelegram,
  onSelectClassFilter,
  enrolledCount = 0,
  onSelectFavorites,
  isFavoritesActive = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'home' | 'batches' | 'notes', classFilter?: string) => {
    onSelectTab(tab);
    if (classFilter && onSelectClassFilter) {
      onSelectClassFilter(classFilter);
    }
    setMobileMenuOpen(false);
  };

  const handleFavoritesClick = () => {
    if (onSelectFavorites) {
      onSelectFavorites();
    } else {
      handleNavClick('batches');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0715]/95 backdrop-blur-md border-b border-pink-500/20 box-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 sm:h-18">
          
          {/* Zone 1: Brand Wordmark & Icon */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-3 group text-left cursor-pointer shrink-0"
            aria-label="GB STUDY Home"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-pink-500 shadow-md shadow-pink-500/30 group-hover:border-pink-400 group-hover:scale-105 transition-all shrink-0">
              <img
                src={BRAND_ASSETS.logo}
                alt="GB STUDY Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black tracking-tight text-white group-hover:text-pink-400 transition-colors whitespace-nowrap">
                GB <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500">STUDY</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-pink-300/80 -mt-1 tracking-wider uppercase hidden xs:inline">
                Free Education
              </span>
            </div>
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'home' && !isFavoritesActive
                  ? 'text-pink-400 font-bold border-b-2 border-pink-500 pb-0.5'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('batches')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'batches' && !isFavoritesActive
                  ? 'text-pink-400 font-bold border-b-2 border-pink-500 pb-0.5'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Batches
            </button>

            <button
              onClick={() => handleNavClick('notes')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'notes'
                  ? 'text-pink-400 font-bold border-b-2 border-pink-500 pb-0.5'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Notes & PDFs
            </button>

            <button
              onClick={() => handleNavClick('batches', 'Class 12th')}
              className="text-slate-300 hover:text-pink-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              Class 12th
            </button>

            <button
              onClick={() => handleNavClick('batches', 'Class 10th')}
              className="text-slate-300 hover:text-pink-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              Class 10th
            </button>
          </nav>

          {/* Zone 3: Search, Favorites & Telegram Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Search Trigger Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#190a26] hover:bg-[#25103a] border border-pink-500/25 hover:border-pink-500/50 rounded-xl transition-all shadow-sm cursor-pointer"
              title="Search batches, lectures, notes (/)"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-pink-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700">
                /
              </kbd>
            </button>

            {/* Favorites / Enrolled Quick Button */}
            <button
              onClick={handleFavoritesClick}
              className={`flex items-center gap-1 p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                isFavoritesActive
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/40 border border-pink-400'
                  : 'bg-[#190a26] hover:bg-[#25103a] text-pink-300 hover:text-white border border-pink-500/25'
              }`}
              title="View Enrolled Batches"
              aria-label="Enrolled Batches"
            >
              <Bookmark className={`w-4 h-4 ${isFavoritesActive ? 'fill-white text-white' : 'text-pink-400'}`} />
              <span className="hidden sm:inline">My Batches</span>
              {enrolledCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isFavoritesActive ? 'bg-white text-pink-600' : 'bg-pink-600 text-white'
                }`}>
                  {enrolledCount}
                </span>
              )}
            </button>

            {/* Telegram Pink Button */}
            <button
              onClick={onOpenTelegram}
              className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-600 rounded-xl shadow-md shadow-pink-600/30 hover:shadow-pink-500/50 transition-all cursor-pointer whitespace-nowrap"
              title="Join GB STUDY Telegram Channel"
              aria-label="Telegram Channel"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Telegram</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl bg-[#190a26] border border-pink-500/25"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-pink-400" /> : <Menu className="w-4 h-4 text-pink-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#130720] border-b border-pink-500/30 px-3.5 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'home' && !isFavoritesActive ? 'bg-pink-600/20 text-pink-300 font-bold border border-pink-500/30' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-pink-400" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNavClick('batches')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'batches' && !isFavoritesActive ? 'bg-pink-600/20 text-pink-300 font-bold border border-pink-500/30' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4 text-pink-400" />
            <span>All 46+ Real Batches</span>
          </button>

          <button
            onClick={handleFavoritesClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
              isFavoritesActive ? 'bg-pink-600/20 text-pink-300 font-bold border border-pink-500/30' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-pink-400" />
              <span>My Enrolled Batches</span>
            </div>
            {enrolledCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-pink-600 text-white">
                {enrolledCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('notes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'notes' ? 'bg-pink-600/20 text-pink-300 font-bold border border-pink-500/30' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 text-pink-400" />
            <span>Notes & PDFs Library</span>
          </button>

          <div className="pt-2 border-t border-pink-500/20 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleNavClick('batches', 'Class 12th')}
              className="p-2.5 rounded-xl bg-[#190a26] text-slate-300 hover:text-white border border-pink-500/20 text-center font-medium"
            >
              Class 12th
            </button>
            <button
              onClick={() => handleNavClick('batches', 'Class 11th')}
              className="p-2.5 rounded-xl bg-[#190a26] text-slate-300 hover:text-white border border-pink-500/20 text-center font-medium"
            >
              Class 11th
            </button>
            <button
              onClick={() => handleNavClick('batches', 'Class 10th')}
              className="p-2.5 rounded-xl bg-[#190a26] text-slate-300 hover:text-white border border-pink-500/20 text-center font-medium"
            >
              Class 10th
            </button>
            <button
              onClick={() => handleNavClick('batches', 'Class 9th')}
              className="p-2.5 rounded-xl bg-[#190a26] text-slate-300 hover:text-white border border-pink-500/20 text-center font-medium"
            >
              Class 9th
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
