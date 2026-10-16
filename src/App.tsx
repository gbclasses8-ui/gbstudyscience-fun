import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, Sparkles, BookOpen, Layers, FileText, Search, 
  CheckCircle, Video, ArrowRight, Shield, Award, Users, Download, Plus, Check, Play, Bookmark 
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BatchCard } from './components/BatchCard';
import { BatchDetailView } from './components/BatchDetailView';
import { LecturePlayerModal } from './components/LecturePlayerModal';
import { NotesViewerModal } from './components/NotesViewerModal';
import { TelegramModal } from './components/TelegramModal';
import { SearchModal } from './components/SearchModal';
import { DedicatedNotesHub } from './components/DedicatedNotesHub';
import { MobileBottomNav } from './components/MobileBottomNav';
import { BATCHES_DATA, Batch, Lecture, NoteDoc, BRAND_ASSETS, getPlatformStats, getAllNotes } from './data/batchesData';
import { fetchAllBatches, EnhancedBatch, fetchAppMetadata } from './services/api';

interface VideoPlayerState {
  courseId: string;
  videoId: string;
  title: string;
  duration?: string;
  thumbnail?: string;
}

interface PdfViewerState {
  url: string;
  title: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'batches' | 'notes'>('home');
  const [realBatches, setRealBatches] = useState<EnhancedBatch[]>([]);
  const [selectedRealBatch, setSelectedRealBatch] = useState<EnhancedBatch | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  
  // Player state
  const [activeVideoStream, setActiveVideoStream] = useState<VideoPlayerState | null>(null);
  const [activePdfViewer, setActivePdfViewer] = useState<PdfViewerState | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteDoc | null>(null);

  // Filters & Tabs
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');
  const [batchTab, setBatchTab] = useState<'all' | 'enrolled'>('all');
  const [batchSearchInput, setBatchSearchInput] = useState<string>('');
  
  // Enrolled Batches saved in localStorage
  const [enrolledBatchIds, setEnrolledBatchIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gbstudy_enrolled_batches');
      return saved ? JSON.parse(saved) : ['141', '364', '140', '253'];
    } catch {
      return ['141', '364', '140', '253'];
    }
  });

  const toggleEnroll = (e: React.MouseEvent, batchId: string) => {
    e.stopPropagation();
    setEnrolledBatchIds(prev => {
      const updated = prev.includes(batchId)
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId];
      try {
        localStorage.setItem('gbstudy_enrolled_batches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Telegram popup on page open
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Load all 46 real batches and app metadata on mount
  useEffect(() => {
    let isMounted = true;
    fetchAllBatches()
      .then(batches => {
        if (isMounted) {
          setRealBatches(batches);
        }
      })
      .catch(err => console.error('Failed to load batches:', err));

    fetchAppMetadata().then(meta => {
      if (meta && meta.name) {
        document.title = meta.name;
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = getPlatformStats();
  const allNotes = getAllNotes();

  // Listen for keyboard '/' to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchModalOpen && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen]);

  // Filtered Real Batches
  const filteredBatches = useMemo(() => {
    return realBatches.filter(batch => {
      // Enrolled tab filter
      if (batchTab === 'enrolled' && !enrolledBatchIds.includes(batch.id)) {
        return false;
      }

      // Class filter
      if (selectedClassFilter !== 'All') {
        if (batch.category !== selectedClassFilter) return false;
      }

      // Text search
      if (batchSearchInput.trim()) {
        const q = batchSearchInput.toLowerCase();
        return (
          batch.title.toLowerCase().includes(q) ||
          batch.category.toLowerCase().includes(q) ||
          batch.id.includes(q)
        );
      }

      return true;
    });
  }, [realBatches, selectedClassFilter, batchTab, enrolledBatchIds, batchSearchInput]);

  const handleOpenRealBatch = (batch: EnhancedBatch) => {
    setSelectedRealBatch(batch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayRealVideo = (
    courseId: string, 
    videoId: string, 
    title: string, 
    duration?: string, 
    thumb?: string
  ) => {
    setActiveVideoStream({
      courseId,
      videoId,
      title,
      duration,
      thumbnail: thumb,
    });
  };

  const handleOpenRealPdf = (pdfUrl: string, title: string) => {
    setActivePdfViewer({
      url: pdfUrl,
      title,
    });
  };

  const handleSelectNavTab = (tab: 'home' | 'batches' | 'notes') => {
    setActiveTab(tab);
    setSelectedRealBatch(null);
    setSelectedBatch(null);
    if (tab === 'batches') {
      setBatchTab('all');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFavorites = () => {
    setActiveTab('batches');
    setBatchTab('enrolled');
    setSelectedClassFilter('All');
    setSelectedRealBatch(null);
    const el = document.getElementById('batches-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#08030d] text-slate-100 flex flex-col font-sans selection:bg-pink-600 selection:text-white box-border w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectNavTab}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenTelegram={() => setIsTelegramModalOpen(true)}
        enrolledCount={enrolledBatchIds.length}
        onSelectFavorites={handleSelectFavorites}
        isFavoritesActive={activeTab === 'batches' && batchTab === 'enrolled'}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-8 w-full max-w-full box-border">
        {/* If a real batch is selected, show its full live folders & lectures */}
        {selectedRealBatch ? (
          <BatchDetailView
            batch={selectedRealBatch}
            onBack={() => setSelectedRealBatch(null)}
            onPlayVideo={handlePlayRealVideo}
            onOpenPdf={handleOpenRealPdf}
          />
        ) : activeTab === 'notes' ? (
          /* Notes Hub */
          <DedicatedNotesHub
            onSelectNote={(note) => setSelectedNote(note)}
          />
        ) : (
          /* Home & Batches Views */
          <div className="w-full max-w-full">
            {/* Hero Section (only on home tab) */}
            {activeTab === 'home' && (
              <section className="relative overflow-hidden pt-6 pb-10 sm:pt-12 sm:pb-16 border-b border-pink-500/15 w-full">
                {/* Glowing ambient backgrounds */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[250px] sm:h-[350px] bg-gradient-to-tr from-pink-600/20 via-rose-600/15 to-purple-600/10 blur-[90px] sm:blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute top-10 left-10 w-44 sm:w-72 h-44 sm:h-72 bg-pink-500/10 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b0b2e] border border-pink-500/40 text-pink-300 text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-md shadow-pink-900/40 animate-fade-in">
                    <img
                      src={BRAND_ASSETS.logo}
                      alt="GB STUDY"
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate">100% Free Complete Educational Platform</span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black text-white font-syne tracking-tight max-w-4xl mx-auto leading-[1.2] mb-4">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-pink-500">GB STUDY</span>
                    <br />
                    <span className="text-lg xs:text-xl sm:text-3xl md:text-4xl text-slate-200 font-extrabold block mt-2">
                      All Real Batches, HD Video Lectures & Topper Notes
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-1">
                    Access all 46 live and recorded batches for <strong className="text-pink-400">Class 9th, 10th, 11th, 12th, Science & NDA</strong>. Full HD player with speed controls, quality switcher, and chapterwise PDF notes!
                  </p>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
                    <button
                      onClick={() => {
                        const el = document.getElementById('batches-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm sm:text-base shadow-xl shadow-pink-600/40 hover:shadow-pink-600/60 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Explore All 46 Batches</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href={BRAND_ASSETS.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#1d0d30] hover:bg-pink-900/40 text-pink-300 hover:text-white border border-pink-500/40 font-bold text-sm sm:text-base shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Join Telegram Channel</span>
                    </a>
                  </div>

                  {/* Trust Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-3xl mx-auto pt-4 sm:pt-6 border-t border-pink-500/20 text-center">
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-[#140822] border border-pink-500/20">
                      <div className="text-lg sm:text-2xl font-black text-pink-400">46+</div>
                      <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Real Batches</div>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-[#140822] border border-pink-500/20">
                      <div className="text-lg sm:text-2xl font-black text-rose-400">1,200+</div>
                      <div className="text-[10px] sm:text-xs text-slate-400 font-medium">HD Lectures</div>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-[#140822] border border-pink-500/20">
                      <div className="text-lg sm:text-2xl font-black text-fuchsia-400">500+</div>
                      <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Chapter PDFs</div>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-[#140822] border border-pink-500/20">
                      <div className="text-lg sm:text-2xl font-black text-emerald-400">100% Free</div>
                      <div className="text-[10px] sm:text-xs text-slate-400 font-medium">No Login Needed</div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Batches Section */}
            <section id="batches-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
              {/* Section Header & Search */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-600/15 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Real Batches & Courses</span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-white font-syne tracking-tight">
                    {batchTab === 'enrolled' ? 'My Enrolled Batches' : 'Choose Your Academic Batch'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Showing <strong className="text-pink-400 font-bold">{filteredBatches.length}</strong> available batches. Tap any batch for live subjects, folders, lectures and PDF notes.
                  </p>
                </div>

                {/* Search Bar - Responsive full width on mobile */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={batchSearchInput}
                    onChange={(e) => setBatchSearchInput(e.target.value)}
                    placeholder="Search 46+ batches by name..."
                    className="w-full bg-[#150a24] border border-pink-500/30 rounded-xl pl-10 pr-12 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                  {batchSearchInput && (
                    <button
                      onClick={() => setBatchSearchInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer font-bold px-1.5 py-0.5 rounded bg-slate-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Class & Enrollment Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none w-full">
                {/* All Batches Tab */}
                <button
                  onClick={() => {
                    setBatchTab('all');
                    setSelectedClassFilter('All');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    batchTab === 'all' && selectedClassFilter === 'All'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30 scale-[1.02]'
                      : 'bg-[#150a24] hover:bg-[#200e33] text-slate-300 hover:text-white border border-pink-500/20'
                  }`}
                >
                  All Batches ({realBatches.length})
                </button>

                {/* My Enrolled / Favorites Tab */}
                <button
                  onClick={() => {
                    setBatchTab('enrolled');
                    setSelectedClassFilter('All');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    batchTab === 'enrolled'
                      ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 text-white shadow-md shadow-pink-600/40 border border-pink-400 scale-[1.02]'
                      : 'bg-[#1a0c2c] hover:bg-[#25103a] text-pink-300 hover:text-white border border-pink-500/30'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Enrolled ({enrolledBatchIds.length})</span>
                </button>

                {/* Category Chips */}
                {['Class 12th', 'Class 11th', 'Class 10th', 'Class 9th', 'NDA & Defence', 'Commerce & Other'].map((cat) => {
                  const isActive = batchTab === 'all' && selectedClassFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setBatchTab('all');
                        setSelectedClassFilter(cat);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30 scale-[1.02]'
                          : 'bg-[#150a24] hover:bg-[#200e33] text-slate-300 hover:text-white border border-pink-500/20'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Batches Responsive Cards Grid */}
              {filteredBatches.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-[#140822] border border-pink-500/20 my-4 px-4">
                  <Layers className="w-12 h-12 text-pink-400 mx-auto mb-3 opacity-60" />
                  <p className="text-white font-bold text-base sm:text-lg mb-1">No batches found</p>
                  <p className="text-slate-400 text-xs sm:text-sm mb-4">
                    {batchTab === 'enrolled' 
                      ? 'You have not enrolled in any batch yet. Tap the Enroll button on any batch to save it here!' 
                      : 'Try selecting a different class filter or clear your search query.'}
                  </p>
                  {batchTab === 'enrolled' && (
                    <button
                      onClick={() => setBatchTab('all')}
                      className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs sm:text-sm cursor-pointer"
                    >
                      Browse All Batches
                    </button>
                  )}
                </div>
              ) : (
                /* Mobile: 1 column full-width (Screenshot 2 style), Tablet: 2 cols, Laptop: 3 cols, Desktop: 4 cols */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                  {filteredBatches.map((batch) => (
                    <BatchCard
                      key={batch.id}
                      batch={batch}
                      isEnrolled={enrolledBatchIds.includes(batch.id)}
                      onToggleEnroll={toggleEnroll}
                      onSelect={handleOpenRealBatch}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      {activeVideoStream && (
        <LecturePlayerModal
          courseId={activeVideoStream.courseId}
          videoId={activeVideoStream.videoId}
          title={activeVideoStream.title}
          duration={activeVideoStream.duration}
          thumbnail={activeVideoStream.thumbnail}
          onClose={() => setActiveVideoStream(null)}
          onOpenPdf={handleOpenRealPdf}
        />
      )}

      {/* Fallback Static Lecture Modal */}
      {selectedLecture && (
        <LecturePlayerModal
          lecture={selectedLecture}
          onClose={() => setSelectedLecture(null)}
          onOpenPdf={handleOpenRealPdf}
        />
      )}

      {/* PDF Viewer Modal */}
      {activePdfViewer && (
        <NotesViewerModal
          pdfUrl={activePdfViewer.url}
          title={activePdfViewer.title}
          onClose={() => setActivePdfViewer(null)}
        />
      )}

      {/* Fallback Static Note Modal */}
      {selectedNote && (
        <NotesViewerModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}

      {/* Telegram Popup (Opens when website opens) */}
      <TelegramModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        realBatches={realBatches}
        onSelectRealBatch={(batch) => {
          setSelectedRealBatch(batch);
          setActiveTab('batches');
        }}
        onSelectBatch={(batch) => {
          const matched = realBatches.find(b => b.id === String(batch.batchIdNumeric));
          if (matched) {
            setSelectedRealBatch(matched);
          } else {
            setSelectedBatch(batch);
          }
        }}
        onSelectLecture={(batch, lecture) => {
          setSelectedLecture(lecture);
        }}
        onSelectNote={(note) => {
          setSelectedNote(note);
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectNavTab}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenTelegram={() => setIsTelegramModalOpen(true)}
        enrolledCount={enrolledBatchIds.length}
        onSelectFavorites={handleSelectFavorites}
        isFavoritesActive={activeTab === 'batches' && batchTab === 'enrolled'}
      />

      {/* Footer */}
      <Footer
        onSelectTab={handleSelectNavTab}
        onOpenTelegram={() => setIsTelegramModalOpen(true)}
      />
    </div>
  );
}
