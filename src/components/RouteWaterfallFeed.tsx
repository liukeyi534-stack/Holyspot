import React, { useState } from 'react';
import { HolySpot, Tribe, TreasureNote } from '../types';
import { formatDistance, getDistanceMeters } from '../utils/geo';
import {
  MapPin,
  Camera,
  Heart,
  Navigation,
  Sparkles,
  Tag,
  User,
  Clock,
  ChevronRight,
  X,
  Compass,
  FileText,
  Share2,
  Lock,
  Unlock,
} from 'lucide-react';

interface RouteWaterfallFeedProps {
  spots: HolySpot[];
  activeTribe: Tribe;
  notes: TreasureNote[];
  onSelectSpot: (spot: HolySpot) => void;
  onOpenCheckin: (spot: HolySpot) => void;
  onOpenTreasure: (spot: HolySpot) => void;
  onLikeNote?: (noteId: string) => void;
  searchQuery?: string;
  userCoords?: { lat: number; lng: number };
}

export const RouteWaterfallFeed: React.FC<RouteWaterfallFeedProps> = ({
  spots,
  activeTribe,
  notes,
  onSelectSpot,
  onOpenCheckin,
  onOpenTreasure,
  onLikeNote,
  searchQuery = '',
  userCoords = { lat: 37.5206, lng: 127.0229 },
}) => {
  // Category tabs: All + Categories visited by this tribe
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [selectedSpotDetail, setSelectedSpotDetail] = useState<HolySpot | null>(null);

  // Extract unique categories for current tribe spots
  const categoriesList = ['全部', '景点', '餐厅', '咖啡', '商店', '其他'];

  // Count spots per category for current tribe
  const getCategoryCount = (cat: string) => {
    if (cat === '全部') return spots.length;
    return spots.filter((s) => s.category === cat).length;
  };

  // Filtered spots: strictly only current tribe spots, filtered by category and search
  const filteredSpots = spots.filter((s) => {
    const matchesCategory =
      activeCategory === '全部' ? true : s.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.members.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#f5f7f6] overflow-y-auto pb-10">
      {/* Category Filter Tabs Bar (Switched to place category tags: 景点, 餐厅, 咖啡, 商店, 其他) */}
      <div className="sticky top-0 z-20 bg-[#f5f7f6]/95 backdrop-blur-md px-4 py-2.5 border-b border-stone-200/50">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar">
          {categoriesList.map((cat) => {
            const count = getCategoryCount(cat);
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0d7a76] text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/70 hover:border-stone-300'
                }`}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spot Count & Tribe Status indicator */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d7a76]" />
          <span className="font-semibold text-stone-800">
            {activeTribe.name.split(' ')[0]} 圣地机位
          </span>
          <span>· 共 {filteredSpots.length} 处打卡点</span>
        </div>
        <span className="text-[11px] text-stone-400">爱豆官方同款</span>
      </div>

      {/* Spots Waterfall List */}
      <div className="px-4 py-2 space-y-4">
        {filteredSpots.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/60 my-6 shadow-2xs">
            <Compass className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">
              该标签下暂无已收录打卡点
            </p>
            <p className="text-xs text-stone-400 mt-1">
              可以点击其他标签或在顶部切换部落查看
            </p>
            <button
              onClick={() => setActiveCategory('全部')}
              className="mt-3 px-4 py-1.5 bg-[#0d7a76] text-white rounded-full text-xs font-semibold"
            >
              查看全部机位
            </button>
          </div>
        ) : (
          filteredSpots.map((spot) => {
            // Distance calculation
            const dist = getDistanceMeters(
              userCoords.lat,
              userCoords.lng,
              spot.coordinates.lat,
              spot.coordinates.lng
            );

            // Fellow fan notes for this specific spot
            const spotNotes = notes.filter((n) => n.spotId === spot.id);

            return (
              <div
                key={spot.id}
                className="bg-white rounded-3xl overflow-hidden shadow-2xs border border-stone-200/70 hover:border-[#0d7a76]/40 transition-all group"
              >
                {/* 1. Only Idol Official Scene Picture (NO fan checkin picture) */}
                <div
                  className="relative aspect-[4/3] w-full bg-stone-100 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedSpotDetail(spot)}
                >
                  <img
                    src={spot.originalSceneImg}
                    alt={spot.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {/* Subtle top/bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-[#0d7a76]/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      爱豆实景名场面
                    </span>
                    {spot.featuredEp && (
                      <span className="bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-medium px-2 py-1 rounded-full">
                        {spot.featuredEp}
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Overlay: Built-in Location & Distance */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5 text-xs font-semibold drop-shadow-md truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span className="truncate">{spot.address}</span>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 drop-shadow-xs">
                      距您 {formatDistance(dist)}
                    </span>
                  </div>
                </div>

                {/* 2. Spot Information Content */}
                <div className="p-4 space-y-3">
                  {/* Location Title & Quote */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => setSelectedSpotDetail(spot)}
                        className="font-bold text-base text-stone-900 group-hover:text-[#0d7a76] transition-colors cursor-pointer"
                      >
                        {spot.title}
                      </h3>
                      <button
                        onClick={() => onSelectSpot(spot)}
                        className="text-stone-400 hover:text-[#0d7a76] p-1 shrink-0"
                        title="在地图中定位"
                      >
                        <Navigation className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                      {spot.subTitle}
                    </p>
                    <p className="text-xs text-[#0d7a76] italic mt-1.5 line-clamp-1">
                      {spot.animeQuote}
                    </p>
                  </div>

                  {/* 3. Tags: 成员 (Members), 属性 (Attribute/Category), 内容 (Content type) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {/* Member Tag */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100/60">
                      <User className="w-3 h-3 text-indigo-500" />
                      {spot.members.join(' · ')}
                    </span>

                    {/* Attribute / Category Tag */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100/60">
                      <Tag className="w-3 h-3 text-emerald-500" />
                      {spot.category}
                    </span>

                    {/* Content Type Tag */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-100/60">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {spot.contentType}
                    </span>
                  </div>

                  {/* 4. Fellow Fan Treasure Notes Capsule (未展开封存，到达目的地打开后解锁) */}
                  <div className="bg-[#faf8f5] border border-amber-200/70 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💌</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-800">
                              同担留下的寻宝纸条
                            </span>
                            <span className="text-[10px] font-bold text-[#0d7a76] bg-[#0d7a76]/10 px-1.5 py-0.2 rounded-full">
                              {spotNotes.length} 张密信
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          dist <= 500
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dist <= 500 ? (
                          <>
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span>已在目的地</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>目的地未到达</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Sealed Locked Capsule - Do NOT expand note contents on homepage card */}
                    <div
                      onClick={() => onOpenTreasure(spot)}
                      className="bg-white rounded-xl p-2.5 border border-dashed border-amber-200 hover:border-[#0d7a76]/50 cursor-pointer transition-all flex items-center justify-between group/seal shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            dist <= 500
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {dist <= 500 ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-800">
                            {dist <= 500
                              ? '已抵达机位现场！点击打开解锁纸条'
                              : `纸条已上锁封存 · 距目的地 ${formatDistance(dist)}`}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            {dist <= 500
                              ? `共 ${spotNotes.length} 位同担留下的秘密纸条，点击拆封`
                              : '未到达目的地不予展开，到场后打开即可解锁同担纸条'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTreasure(spot);
                        }}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0 shadow-2xs ${
                          dist <= 500
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-[#0d7a76] hover:bg-[#0b6562] text-white'
                        }`}
                      >
                        <span>{dist <= 500 ? '打开解锁' : '打开纸条'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 5. Action Buttons */}
                  <div className="pt-1 flex items-center gap-2">
                    {/* Primary Button: 立即打卡 (Upload own photo -> RedBook AI card -> Posts to Feed/Profile) */}
                    <button
                      onClick={() => onOpenCheckin(spot)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#0d7a76] hover:bg-[#0b6562] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>立即打卡 (上传我的打卡图)</span>
                    </button>

                    {/* Secondary Button: 地图导航 */}
                    <button
                      onClick={() => onSelectSpot(spot)}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                      title="在地图中查看该点并导航"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#0d7a76]" />
                      <span>去导航</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Spot Detail Modal (NO fan checkin picture comparisons) */}
      {selectedSpotDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 space-y-4">
            {/* Top Image with close button */}
            <div className="relative aspect-[4/3] w-full bg-stone-900">
              <img
                src={selectedSpotDetail.originalSceneImg}
                alt={selectedSpotDetail.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedSpotDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-[#0d7a76] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                爱豆场景官方实景
              </div>
            </div>

            <div className="px-5 pb-5 space-y-3.5">
              {/* Title & Coordinates */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {selectedSpotDetail.category}
                  </span>
                  <span className="text-xs text-stone-500">
                    {selectedSpotDetail.city}
                  </span>
                </div>
                <h2 className="font-bold text-lg text-stone-900 mt-1">
                  {selectedSpotDetail.title}
                </h2>
                <p className="text-xs text-[#0d7a76] italic mt-1 font-medium">
                  {selectedSpotDetail.animeQuote}
                </p>
              </div>

              {/* Tags Group */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                  👤 成员：{selectedSpotDetail.members.join(' · ')}
                </span>
                <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                  🏷️ 属性：{selectedSpotDetail.category}
                </span>
                <span className="text-[11px] font-medium bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg">
                  ✨ 内容：{selectedSpotDetail.contentType}
                </span>
              </div>

              {/* Scene description */}
              <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 text-xs text-stone-700 leading-relaxed space-y-1.5">
                <p className="font-semibold text-stone-900">取景名场面回顾：</p>
                <p>{selectedSpotDetail.sceneDesc}</p>
              </div>

              {/* Tips & Access */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-100 rounded-xl p-2.5 text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">最佳打卡时间 & 拍摄机位：</span>
                    <span className="text-amber-800">
                      {selectedSpotDetail.bestTime} · {selectedSpotDetail.shootingTips}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-stone-50 border border-stone-100 rounded-xl p-2.5 text-stone-700">
                  <MapPin className="w-4 h-4 text-[#0d7a76] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">到达交通指南：</span>
                    <span>{selectedSpotDetail.accessGuide}</span>
                    <span className="block text-[11px] text-stone-400 mt-0.5">
                      地址：{selectedSpotDetail.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    const spot = selectedSpotDetail;
                    setSelectedSpotDetail(null);
                    onOpenTreasure(spot);
                  }}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>💌</span>
                  <span>打开同担纸条 (需抵达现场解锁)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const spot = selectedSpotDetail;
                      setSelectedSpotDetail(null);
                      onOpenCheckin(spot);
                    }}
                    className="flex-1 py-3 bg-[#0d7a76] hover:bg-[#0b6562] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>立即打卡 (上传我的实拍打卡图)</span>
                  </button>
                  <button
                    onClick={() => {
                      const spot = selectedSpotDetail;
                      setSelectedSpotDetail(null);
                      onSelectSpot(spot);
                    }}
                    className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>在地图中查看</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
