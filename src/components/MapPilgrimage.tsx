import React, { useState } from 'react';
import { HolySpot, PilgrimageRoute, Tribe } from '../types';
import { formatDistance, getDistanceMeters } from '../utils/geo';
import {
  MapPin,
  Lock,
  Unlock,
  Navigation,
  Sparkles,
  Camera,
  Compass,
  Clock,
  Radio,
  Eye,
  Sliders,
  Info,
  Footprints,
  Route as RouteIcon,
  X,
  ChevronRight,
  Plus,
  Tag,
  User,
  Check,
} from 'lucide-react';

interface MapPilgrimageProps {
  activeTribe: Tribe;
  spots: HolySpot[];
  selectedSpot: HolySpot | null;
  onSelectSpot: (spot: HolySpot) => void;
  userCoords: { lat: number; lng: number };
  onSimulateCoords: (coords: { lat: number; lng: number }) => void;
  onOpenCheckinModal: (spot: HolySpot) => void;
  onOpenTreasureModal: (spot: HolySpot) => void;
  routes: PilgrimageRoute[];
  activeRoute: PilgrimageRoute | null;
  onSelectRoute: (route: PilgrimageRoute) => void;
  onOpenRoutePlanner: () => void;
  onClearActiveRoute: () => void;
}

export const MapPilgrimage: React.FC<MapPilgrimageProps> = ({
  activeTribe,
  spots,
  selectedSpot,
  onSelectSpot,
  userCoords,
  onSimulateCoords,
  onOpenCheckinModal,
  onOpenTreasureModal,
  routes,
  activeRoute,
  onSelectRoute,
  onOpenRoutePlanner,
  onClearActiveRoute,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isRouteDrawerOpen, setIsRouteDrawerOpen] = useState(false);

  // Current spot defaults to selectedSpot or first spot
  const currentSpot = selectedSpot || spots[0];
  const distanceToCurrent = currentSpot
    ? getDistanceMeters(
        userCoords.lat,
        userCoords.lng,
        currentSpot.coordinates.lat,
        currentSpot.coordinates.lng
      )
    : 999999;

  const isAtSpot = distanceToCurrent <= 500; // <500m considered on-site unlocked

  const handleSimulateAtSpot = () => {
    if (!currentSpot) return;
    onSimulateCoords({
      lat: currentSpot.coordinates.lat + 0.00015,
      lng: currentSpot.coordinates.lng + 0.00015,
    });
  };

  const handleSimulateFarAway = () => {
    onSimulateCoords({ lat: 31.2304, lng: 121.4737 });
  };

  // Filter routes for active tribe
  const currentTribeRoutes = routes.filter((r) => r.tribeId === activeTribe.id);

  return (
    <div className="flex flex-col h-full bg-[#f5f7f6] relative">
      {/* 1. Active Route Floating Navigation Header (if a route is active) */}
      {activeRoute ? (
        <div className="bg-[#0d7a76] text-white px-4 py-2.5 flex items-center justify-between text-xs shadow-md z-30">
          <div className="flex items-center gap-2 min-w-0">
            <RouteIcon className="w-4 h-4 text-amber-300 shrink-0" />
            <div className="truncate">
              <span className="font-bold truncate block">
                巡礼路线：{activeRoute.title}
              </span>
              <span className="text-[10px] text-teal-100 opacity-90 truncate block">
                {activeRoute.waypoints.length}个途经打卡点 · {activeRoute.totalDistanceKm}km · 预计{activeRoute.estimatedMinutes}分钟
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenRoutePlanner}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <span>修改点位</span>
            </button>
            <button
              onClick={onClearActiveRoute}
              className="p-1 hover:bg-white/20 rounded-lg text-teal-200 hover:text-white"
              title="退出路线"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Route entry banner when no active route */
        <div className="bg-white/95 border-b border-stone-200/80 px-4 py-2 flex items-center justify-between z-30">
          <div className="flex items-center gap-1.5 text-xs text-stone-700">
            <RouteIcon className="w-4 h-4 text-[#0d7a76]" />
            <span className="font-bold">巡礼路线规划</span>
            <span className="text-[11px] text-stone-400">
              ({currentTribeRoutes.length} 条热门路线可复用)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRouteDrawerOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#0d7a76]/10 text-[#0d7a76] hover:bg-[#0d7a76]/20 transition-colors flex items-center gap-1"
            >
              <span>官方路线</span>
            </button>
            <button
              onClick={onOpenRoutePlanner}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#0d7a76] text-white hover:bg-[#0b6562] transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>自定义规划</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. LBS Simulation Controller Banner */}
      <div className="bg-white/90 backdrop-blur-xs border-b border-stone-200/70 px-4 py-1.5 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isAtSpot ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'
            }`}
          />
          <span className="text-stone-700 font-medium truncate text-[11px]">
            {isAtSpot ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5 inline" />
                已抵现场 ({formatDistance(distanceToCurrent)}) · 可解锁寻宝
              </span>
            ) : (
              <span className="text-amber-800 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 inline" />
                距圣地 {formatDistance(distanceToCurrent)} · 到场即可解锁
              </span>
            )}
          </span>
        </div>

        {/* GPS quick simulation buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleSimulateAtSpot}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              isAtSpot
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-emerald-50 hover:bg-emerald-100 text-[#0d7a76]'
            }`}
            title="模拟瞬移到当前点位现场解锁"
          >
            ⚡瞬移到现场
          </button>
          <button
            onClick={handleSimulateFarAway}
            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
            title="模拟异地状态"
          >
            🌍模拟异地
          </button>
        </div>
      </div>

      {/* 3. Sub Header: Spot Count & Mode Switch */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-800">
            {activeTribe.name.split(' ')[0]} 巡礼点位 ({spots.length})
          </span>
          {activeRoute && (
            <span className="text-[10px] bg-teal-50 text-[#0d7a76] px-2 py-0.5 rounded-full font-semibold">
              导航中
            </span>
          )}
        </div>

        <div className="flex items-center bg-stone-200/60 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('map')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              viewMode === 'map'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            地图模式
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            点位清单
          </button>
        </div>
      </div>

      {/* 4. Interactive Map View */}
      {viewMode === 'map' ? (
        <div className="flex-1 relative overflow-hidden bg-[#e8eff2] min-h-[300px]">
          {/* Stylized Illustrated Pilgrimage Map Background */}
          <div className="absolute inset-0 bg-radial from-teal-50/40 via-[#f0f4f8] to-[#e2ebf0]">
            {/* Grid & topographic curves */}
            <svg
              className="w-full h-full opacity-35"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="pilgrim-grid-teal"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#0d7a76"
                    strokeWidth="0.4"
                    strokeDasharray="2,2"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pilgrim-grid-teal)" />

              {/* Han River Graphic (Han river curve across the map) */}
              <path
                d="M -50 160 Q 150 240 450 170"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="28"
                strokeLinecap="round"
                opacity="0.35"
              />
              <path
                d="M -50 160 Q 150 240 450 170"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.5"
              />
              <text x="210" y="215" fill="#0284c7" fontSize="10" fontWeight="bold" opacity="0.6">
                한강 汉江公园水系
              </text>
            </svg>

            {/* Active Route Walking Path Vector Polyline */}
            {activeRoute && spots.length > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                  <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d7a76" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                {/* Dynamically draw path connecting all waypoints */}
                <polyline
                  points={spots
                    .map((s, idx) => {
                      const x = 50 + (idx % 2 === 0 ? 40 : 220) + (idx * 25);
                      const y = 80 + idx * 60;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="url(#route-gradient)"
                  strokeWidth="4"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Holy Spots Map Markers (Only for current tribe) */}
            {spots.map((spot, idx) => {
              const isSelected = currentSpot?.id === spot.id;
              const xPos = 50 + (idx % 2 === 0 ? 40 : 220) + (idx * 25);
              const yPos = 80 + idx * 60;

              return (
                <div
                  key={spot.id}
                  style={{
                    left: `${Math.min(Math.max(xPos, 30), 290)}px`,
                    top: `${Math.min(Math.max(yPos, 40), 320)}px`,
                  }}
                  onClick={() => onSelectSpot(spot)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-200 group ${
                    isSelected ? 'scale-115 z-30' : 'hover:scale-105'
                  }`}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Spot Bubble Tooltip */}
                    <div
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md whitespace-nowrap mb-1 transition-all ${
                        isSelected
                          ? 'bg-[#0d7a76] text-white ring-2 ring-white scale-105'
                          : 'bg-white/95 text-stone-800 border border-stone-200/80 group-hover:border-[#0d7a76]'
                      }`}
                    >
                      <span className="mr-1">
                        {spot.category === '景点' ? '🏞️' : spot.category === '餐厅' ? '🍜' : '📍'}
                      </span>
                      {spot.title.length > 8 ? `${spot.title.slice(0, 8)}...` : spot.title}
                    </div>

                    {/* Marker Pin */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                        isSelected
                          ? 'bg-[#0d7a76] text-white ring-4 ring-teal-200'
                          : 'bg-white text-[#0d7a76] border-2 border-[#0d7a76]'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>

                    {/* Checkin and treasure count badge */}
                    <span className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-900 text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                      {spot.treasureCount}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* User GPS simulated position marker */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{
                left: `${140}px`,
                top: `${190}px`,
              }}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-emerald-400/40 animate-ping absolute" />
                <div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold">
                  我
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 5. Spot List Mode (Only Idol Picture) */
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 pb-24">
          {spots.map((spot) => {
            const isSelected = currentSpot?.id === spot.id;
            const dist = getDistanceMeters(
              userCoords.lat,
              userCoords.lng,
              spot.coordinates.lat,
              spot.coordinates.lng
            );

            return (
              <div
                key={spot.id}
                onClick={() => onSelectSpot(spot)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer bg-white ${
                  isSelected
                    ? 'border-[#0d7a76] shadow-sm ring-1 ring-[#0d7a76]'
                    : 'border-stone-200/80 hover:border-stone-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Official Idol Image Only */}
                  <img
                    src={spot.originalSceneImg}
                    alt={spot.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 bg-stone-100"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-stone-900 truncate">
                        {spot.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-[#0d7a76] shrink-0">
                        {formatDistance(dist)}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {spot.address}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-medium">
                        {spot.members.join(' · ')}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-medium">
                        {spot.category}
                      </span>
                      <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                        {spot.contentType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-stone-400 mt-2">
                      <span>💌 {spot.treasureCount} 条寻宝纸条</span>
                      <span>·</span>
                      <span>📷 {spot.checkinCount} 次巡礼</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Bottom Spot Detail Card / Bottom Sheet (Only Official Idol Picture, NO Fan Checkin Picture) */}
      {currentSpot && (
        <div className="bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-4 pt-3 pb-3 shadow-xl z-30">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-white bg-[#0d7a76] px-2 py-0.5 rounded-full">
                  {currentSpot.category}
                </span>
                <span className="text-xs text-stone-500 truncate max-w-[160px]">
                  {currentSpot.city}
                </span>
                <span className="text-[10px] text-stone-400">
                  距您 {formatDistance(distanceToCurrent)}
                </span>
              </div>
              <h3 className="font-bold text-sm text-stone-900 mt-1">
                {currentSpot.title}
              </h3>
            </div>

            {/* Quick Navigation / Waypoint action */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px] text-[#0d7a76] font-semibold bg-[#0d7a76]/10 px-2 py-1 rounded-lg">
                爱豆官方实景
              </span>
            </div>
          </div>

          {/* Official Idol Photo Preview (x.1 only) */}
          <div className="mt-2 rounded-xl overflow-hidden border border-stone-200/80 relative h-28 bg-stone-900">
            <img
              src={currentSpot.originalSceneImg}
              alt={currentSpot.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px]">
              <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded font-medium">
                {currentSpot.contentType}
              </span>
              <span className="italic text-teal-200 truncate max-w-[160px]">
                {currentSpot.animeQuote}
              </span>
            </div>
          </div>

          {/* Shooting Tips */}
          <div className="mt-2 text-xs text-stone-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate text-[11px]">
              机位提示：{currentSpot.shootingTips}
            </span>
          </div>

          {/* Action Buttons: 立即打卡 & 寻宝留言 */}
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenTreasureModal(currentSpot)}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all bg-stone-100 hover:bg-stone-200 text-stone-800"
            >
              {isAtSpot ? (
                <Sparkles className="w-3.5 h-3.5 text-[#0d7a76]" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-stone-400" />
              )}
              <span>寻宝纸条 ({currentSpot.treasureCount})</span>
            </button>

            <button
              onClick={() => onOpenCheckinModal(currentSpot)}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-[#0d7a76] hover:bg-[#0b6562] text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>立即打卡 (上传我的照片)</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. Official Routes Selection Drawer */}
      {isRouteDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-5 shadow-2xl max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <RouteIcon className="w-5 h-5 text-[#0d7a76]" />
                <h3 className="font-bold text-base text-stone-900">
                  {activeTribe.name.split(' ')[0]} 官方推荐打卡路线
                </h3>
              </div>
              <button
                onClick={() => setIsRouteDrawerOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              内置热门路线已规划合理打卡顺序，包含起点、终点与中途机位，可直接一键复用或在规划器中自由调整。
            </p>

            <div className="space-y-3">
              {currentTribeRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-stone-50 hover:bg-[#0d7a76]/5 border border-stone-200/80 hover:border-[#0d7a76]/40 rounded-2xl p-3.5 transition-all text-left space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">
                      {route.title}
                    </span>
                    <span className="text-[10px] text-[#0d7a76] bg-[#0d7a76]/10 px-2 py-0.5 rounded-full font-semibold">
                      {route.totalDistanceKm}km · {route.estimatedMinutes}分钟
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 font-mono">
                    {route.subTitle}
                  </p>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {route.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-stone-400">
                      {route.waypoints.length} 个途经圣地 · {route.author.name}
                    </span>
                    <button
                      onClick={() => {
                        onSelectRoute(route);
                        setIsRouteDrawerOpen(false);
                      }}
                      className="px-3.5 py-1.5 bg-[#0d7a76] hover:bg-[#0b6562] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>复用此路线</span>
                    </button>
                  </div>
                </div>
              ))}

              {currentTribeRoutes.length === 0 && (
                <div className="text-center py-6 text-xs text-stone-400">
                  该部落暂无官方路线，欢迎点击下方自定义规划专属路线！
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setIsRouteDrawerOpen(false);
                onOpenRoutePlanner();
              }}
              className="w-full py-2.5 border-2 border-dashed border-[#0d7a76]/50 text-[#0d7a76] hover:bg-[#0d7a76]/5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>新建自定义漫游路线</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
