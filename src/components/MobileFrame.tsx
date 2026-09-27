import React from 'react';
import {
  Home,
  Navigation,
  Bookmark,
  User,
  Wifi,
  Battery,
  Signal,
  Maximize2,
  Smartphone,
  Compass,
  MessageSquare,
} from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  activeNavTab: 'discover' | 'map' | 'community' | 'profile';
  onNavTabChange: (tab: 'discover' | 'map' | 'community' | 'profile') => void;
  isFramedView: boolean;
  onToggleFramedView: () => void;
  onQuickCheckin: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  activeNavTab,
  onNavTabChange,
  isFramedView,
  onToggleFramedView,
  onQuickCheckin,
}) => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-x-hidden bg-[#e9eee9] font-sans selection:bg-teal-200">
      {/* Clean Minimal Desktop Backdrop (Matching c2341a2f8ed5a3fd088bb582b08817d9.png) */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-[#ebf0ec] via-[#edf2ee] to-[#e4eae5] opacity-90" />

      {/* Decorative Brand Text on Ambient Background */}
      <div className="fixed bottom-8 left-10 hidden lg:block pointer-events-none select-none z-0">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
          CORTIS & K-POP 巡礼
        </h1>
        <p className="text-xs text-stone-500 max-w-xs mt-1.5 leading-relaxed">
          首尔实景圣地探险 · 新沙高架至汉江草坪 · 路线自动规划 · 零后期原图直出
        </p>
      </div>

      {/* Desktop view switcher toggle on top right */}
      <div className="fixed top-4 right-4 z-40 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xs border border-stone-200 text-xs text-stone-700">
        <span className="text-[11px] text-stone-400">视角切换:</span>
        <button
          onClick={onToggleFramedView}
          className="flex items-center gap-1.5 font-medium hover:text-[#0d7a76] transition-colors"
        >
          {isFramedView ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-[#0d7a76]" />
              <span>全屏宽屏模式</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-[#0d7a76]" />
              <span>UI 模板真机视图</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container (Styled exactly after c2341a2f8ed5a3fd088bb582b08817d9.png) */}
      <div
        className={`relative z-10 w-full transition-all duration-300 ${
          isFramedView
            ? 'max-w-[410px] my-6 h-[860px] rounded-[48px] shadow-[0_30px_70px_rgba(0,0,0,0.12)] border-[8px] border-white ring-1 ring-stone-200/80 flex flex-col bg-[#f5f7f6] overflow-hidden'
            : 'max-w-3xl min-h-screen sm:my-4 sm:rounded-3xl sm:border border-stone-200 shadow-xl flex flex-col bg-[#f5f7f6] overflow-hidden'
        }`}
      >
        {/* iPhone Status Bar */}
        {isFramedView && (
          <div className="h-10 bg-[#f5f7f6] shrink-0 px-6 pt-2.5 flex items-center justify-between text-stone-900 text-[11px] font-semibold select-none z-30">
            <span>9:41</span>
            {/* Dynamic Island pill */}
            <div className="w-22 h-4.5 bg-stone-900 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-800 -mr-6" />
            </div>
            <div className="flex items-center gap-1.5 text-stone-800">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-4 h-3" />
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto flex flex-col relative scrollbar-none">
          {children}
        </main>

        {/* Floating Bottom Dock (Mirrors c2341a2f8ed5a3fd088bb582b08817d9.png bottom bar) */}
        <nav className="h-16 shrink-0 bg-[#f5f7f6] px-5 flex items-center justify-between select-none z-30 border-t border-stone-100">
          {/* Tab 1: Home / Discover */}
          <button
            onClick={() => onNavTabChange('discover')}
            className={`flex items-center gap-1.5 transition-all ${
              activeNavTab === 'discover'
                ? 'bg-black text-white px-4 py-2 rounded-2xl shadow-sm text-xs font-semibold'
                : 'text-stone-400 hover:text-stone-700 p-2'
            }`}
          >
            <Home className="w-4 h-4" />
            {activeNavTab === 'discover' && <span>Home</span>}
          </button>

          {/* Tab 2: Map & Navigation */}
          <button
            onClick={() => onNavTabChange('map')}
            className={`flex items-center gap-1.5 transition-all ${
              activeNavTab === 'map'
                ? 'bg-black text-white px-4 py-2 rounded-2xl shadow-sm text-xs font-semibold'
                : 'text-stone-400 hover:text-stone-700 p-2'
            }`}
          >
            <Navigation className="w-4 h-4" />
            {activeNavTab === 'map' && <span>Map</span>}
          </button>

          {/* Tab 3: Community */}
          <button
            onClick={() => onNavTabChange('community')}
            className={`flex items-center gap-1.5 transition-all ${
              activeNavTab === 'community'
                ? 'bg-black text-white px-4 py-2 rounded-2xl shadow-sm text-xs font-semibold'
                : 'text-stone-400 hover:text-stone-700 p-2'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {activeNavTab === 'community' && <span>Feed</span>}
          </button>

          {/* Tab 4: Profile */}
          <button
            onClick={() => onNavTabChange('profile')}
            className={`flex items-center gap-1.5 transition-all ${
              activeNavTab === 'profile'
                ? 'bg-black text-white px-4 py-2 rounded-2xl shadow-sm text-xs font-semibold'
                : 'text-stone-400 hover:text-stone-700 p-2'
            }`}
          >
            <User className="w-4 h-4" />
            {activeNavTab === 'profile' && <span>Me</span>}
          </button>
        </nav>
      </div>
    </div>
  );
};
