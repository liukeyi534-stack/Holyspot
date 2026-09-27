import React, { useState } from 'react';
import { Tribe } from '../types';
import {
  ChevronDown,
  Compass,
  Search,
  Bell,
  X,
  MessageSquare,
  Sparkles,
  Heart,
  MapPin,
} from 'lucide-react';

interface HeaderTribeBarProps {
  tribes: Tribe[];
  activeTribe: Tribe;
  onSelectTribe: (tribe: Tribe) => void;
  onOpenTribeSquare: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const HeaderTribeBar: React.FC<HeaderTribeBarProps> = ({
  tribes,
  activeTribe,
  onSelectTribe,
  onOpenTribeSquare,
  searchQuery = '',
  onSearchChange,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchQuery));
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const subscribedTribes = tribes.filter((t) => t.isSubscribed);

  return (
    <header className="sticky top-0 z-30 bg-[#f5f7f6]/95 backdrop-blur-md border-b border-stone-200/70 px-4 pt-2.5 pb-2">
      {/* Top row: Tribe Switcher + Search + Message Bell + Tribe Square */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Tribe Dropdown Switcher */}
        <button
          onClick={onOpenTribeSquare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-2xs border border-stone-200/80 hover:border-[#0d7a76] transition-all text-left group shrink min-w-0"
        >
          <span className="w-2 h-2 rounded-full bg-[#0d7a76] animate-pulse shrink-0" />
          <span className="text-xs font-bold text-stone-800 truncate max-w-[130px]">
            {activeTribe.name.split(' ')[0]}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#0d7a76] transition-transform shrink-0" />
        </button>

        {/* Right tools: Search, Messages, Tribe Square */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen && onSearchChange) {
                onSearchChange('');
              }
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isSearchOpen || searchQuery
                ? 'bg-[#0d7a76] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/70'
            }`}
            title="搜索打卡点"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Messages / Notifications Bell */}
          <button
            onClick={() => setIsNoticeOpen(true)}
            className="w-8 h-8 rounded-full bg-white border border-stone-200/70 flex items-center justify-center text-stone-600 hover:text-stone-900 relative shadow-2xs transition-colors"
            title="消息提醒"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0d7a76] ring-2 ring-white" />
          </button>

          {/* Tribe Square Button */}
          <button
            onClick={onOpenTribeSquare}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#0d7a76] bg-[#0d7a76]/10 hover:bg-[#0d7a76]/20 px-2.5 py-1.5 rounded-full transition-colors shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>部落广场</span>
          </button>
        </div>
      </div>

      {/* Expandable Search Input Row */}
      {isSearchOpen && (
        <div className="mt-2 flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-[#0d7a76]/40 shadow-xs animate-in fade-in duration-150">
          <Search className="w-3.5 h-3.5 text-[#0d7a76] shrink-0" />
          <input
            type="text"
            placeholder={`在 ${activeTribe.name.split(' ')[0]} 搜索点位/位置...`}
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            autoFocus
            className="w-full text-xs text-stone-800 bg-transparent border-none p-0 focus:outline-none placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              className="text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Story-style circular tribe avatars (Circle isolation switch) */}
      <div className="mt-2 flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {/* Add custom tribe */}
        <button
          onClick={onOpenTribeSquare}
          className="flex flex-col items-center gap-1 shrink-0 group"
          title="加入更多部落"
        >
          <div className="w-11 h-11 rounded-full bg-white border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 group-hover:border-[#0d7a76] group-hover:text-[#0d7a76] transition-all shadow-2xs">
            <span className="text-base font-light leading-none">+</span>
          </div>
          <span className="text-[10px] font-medium text-stone-500">添加</span>
        </button>

        {/* Subscribed Tribe stories */}
        {subscribedTribes.map((tribe) => {
          const isActive = tribe.id === activeTribe.id;
          return (
            <button
              key={tribe.id}
              onClick={() => onSelectTribe(tribe)}
              className="flex flex-col items-center gap-1 shrink-0 transition-transform active:scale-95"
            >
              <div
                className={`relative w-11 h-11 rounded-full p-0.5 transition-all ${
                  isActive
                    ? 'ring-2 ring-[#0d7a76] ring-offset-2 ring-offset-[#f5f7f6] scale-105'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={tribe.avatar}
                  alt={tribe.name}
                  className="w-full h-full object-cover rounded-full bg-stone-100"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-[8px] shadow-2xs font-bold text-stone-700">
                  {tribe.id === 'cortis' ? '🦋' : tribe.id === 'riize' ? '🎸' : tribe.id === 'nct' ? '💚' : '✨'}
                </span>
              </div>
              <span
                className={`text-[10px] font-medium max-w-[58px] truncate ${
                  isActive ? 'text-[#0d7a76] font-bold' : 'text-stone-500'
                }`}
              >
                {tribe.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Notifications Modal */}
      {isNoticeOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl border border-stone-100 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0d7a76]" />
                <h3 className="font-bold text-sm text-stone-900">
                  {activeTribe.name.split(' ')[0]} 部落消息通知
                </h3>
              </div>
              <button
                onClick={() => setIsNoticeOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              <div className="p-2.5 rounded-xl bg-[#0d7a76]/5 border border-[#0d7a76]/20 flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-stone-800">
                    「新沙洞薄荷糖」点赞了你在新沙2高架的寻宝纸条
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">15分钟前</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#0d7a76] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-stone-800">
                    同担巡礼官更新了汉江大树野餐木桌的新机位提示
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">2小时前</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-stone-800">
                    有同担在草坪巨石瑜伽点埋下了一张新的时空胶囊纸条
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">昨天 18:30</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsNoticeOpen(false)}
              className="w-full py-2 bg-[#0d7a76] hover:bg-[#0b6562] text-white rounded-xl text-xs font-semibold transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
