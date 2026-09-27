import React, { useState } from 'react';
import { Tribe } from '../types';
import { X, Check, Plus, ShieldCheck, Users, MapPin, Sparkles } from 'lucide-react';

interface TribeSquareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tribes: Tribe[];
  activeTribe: Tribe;
  onSelectTribe: (tribe: Tribe) => void;
  onToggleSubscribe: (tribeId: string) => void;
  onAddCustomTribe: (newTribe: Tribe) => void;
}

export const TribeSquareModal: React.FC<TribeSquareModalProps> = ({
  isOpen,
  onClose,
  tribes,
  activeTribe,
  onSelectTribe,
  onToggleSubscribe,
  onAddCustomTribe,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'anime' | 'kpop'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New UGC tribe form states
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<'anime' | 'kpop' | 'drama'>('anime');
  const [customTagline, setCustomTagline] = useState('');
  const [customCity, setCustomCity] = useState('');

  if (!isOpen) return null;

  const filteredTribes = tribes.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newTribe: Tribe = {
      id: `ugc-${Date.now()}`,
      name: customName.trim(),
      type: customType,
      tagline: customTagline.trim() || '粉丝自建共建圣地巡礼部落',
      description: `由同好申请共建的圣地巡礼专属部落，覆盖${customCity || '世界'}相关名场面。`,
      avatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      followersCount: 1,
      spotsCount: 1,
      accentColor: customType === 'anime' ? '#f59e0b' : '#ec4899',
      badgeTitle: `${customName.slice(0, 4)}探索先锋`,
      badgeIcon: customType === 'anime' ? '🌟' : '🎵',
      defaultTemplate: customType === 'anime' ? 'anime-split' : 'y2k-cool',
      isOfficial: false,
      isSubscribed: true,
    };

    onAddCustomTribe(newTribe);
    onSelectTribe(newTribe);
    setShowCreateForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#fffafa] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-100 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-rose-100/60">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-serif-display tracking-wide">
              次元部落广场
            </h2>
            <p className="text-xs text-stone-500">
              每个 IP 独立部落 · 圈子隔离 · 专属寻宝池
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-white/60 border-b border-rose-100/40">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              全部部落
            </button>
            <button
              onClick={() => setFilterType('anime')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'anime'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              动漫 / 番剧
            </button>
            <button
              onClick={() => setFilterType('kpop')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterType === 'kpop'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              KPOP 爱豆
            </button>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>自建部落</span>
          </button>
        </div>

        {/* Create UGC Tribe Inline Drawer */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 bg-rose-50/70 border-b border-rose-200/70 text-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                申请共建小众 IP 部落
              </span>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                取消
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-stone-600 block mb-1">IP 作品 / 爱豆名称</label>
                <input
                  type="text"
                  placeholder="如：秒速5厘米 / 伍佰"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-white px-2.5 py-1.5 rounded-md border border-rose-200 focus:outline-rose-400"
                  required
                />
              </div>
              <div>
                <label className="text-stone-600 block mb-1">部落分类</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as any)}
                  className="w-full bg-white px-2.5 py-1.5 rounded-md border border-rose-200 focus:outline-rose-400"
                >
                  <option value="anime">动漫 / 番剧</option>
                  <option value="kpop">KPOP / 音乐</option>
                  <option value="drama">影视 / 电视剧</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-stone-600 block mb-1">巡礼核心口号 / 城市取景地</label>
              <input
                type="text"
                placeholder="如：种子岛火箭发射场巡礼 / 台北实景"
                value={customTagline}
                onChange={(e) => setCustomTagline(e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-rose-200 focus:outline-rose-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-1.5 rounded-md transition-colors shadow-xs"
            >
              提交审核并立即创建部落
            </button>
          </form>
        )}

        {/* Tribe List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredTribes.map((tribe) => {
            const isCurrent = tribe.id === activeTribe.id;
            return (
              <div
                key={tribe.id}
                className={`relative p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-300'
                    : 'bg-white border-rose-100/70 hover:border-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={tribe.avatar}
                    alt={tribe.name}
                    className="w-12 h-12 rounded-xl object-cover border border-rose-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-sm text-stone-900 truncate">
                        {tribe.name}
                      </h3>
                      {tribe.isOfficial ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3" />
                          官方
                        </span>
                      ) : (
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md">
                          共建
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {tribe.tagline}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tribe.followersCount.toLocaleString()} 成员
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tribe.spotsCount} 个圣地坐标
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => onToggleSubscribe(tribe.id)}
                      className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                        tribe.isSubscribed
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-stone-900 text-white hover:bg-stone-800'
                      }`}
                    >
                      {tribe.isSubscribed ? '已订阅' : '+ 订阅'}
                    </button>

                    <button
                      onClick={() => {
                        onSelectTribe(tribe);
                        onClose();
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                        isCurrent
                          ? 'text-rose-600 font-semibold'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {isCurrent ? '当前部落 ✓' : '进入部落 →'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 border-t border-rose-100/60 text-[11px] text-stone-400 text-center">
          部落严格隔离：不同 IP 的留言、打卡和讨论绝不互串
        </div>
      </div>
    </div>
  );
};
