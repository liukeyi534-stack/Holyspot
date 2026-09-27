import React, { useState } from 'react';
import { HolySpot, PilgrimageRoute, RouteWaypoint, Tribe } from '../types';
import { getDistanceMeters, formatDistance } from '../utils/geo';
import {
  X,
  Navigation,
  ArrowUpDown,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  MapPin,
  Clock,
  Footprints,
  Check,
  RotateCcw,
} from 'lucide-react';

interface RoutePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTribe: Tribe;
  spots: HolySpot[];
  activeRoute: PilgrimageRoute | null;
  onApplyRoute: (route: PilgrimageRoute) => void;
  userCoords: { lat: number; lng: number };
}

export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  isOpen,
  onClose,
  activeTribe,
  spots,
  activeRoute,
  onApplyRoute,
  userCoords,
}) => {
  if (!isOpen) return null;

  // Start point state
  const [startName, setStartName] = useState(
    activeRoute?.startPoint.name || '我的当前GPS定位'
  );
  const [startCoords, setStartCoords] = useState(
    activeRoute?.startPoint.coordinates || userCoords
  );

  // End point state
  const [endName, setEndName] = useState(
    activeRoute?.endPoint.name || '汉江公园水边夕阳台 (终点)'
  );
  const [endCoords, setEndCoords] = useState(
    activeRoute?.endPoint.coordinates || { lat: 37.5295, lng: 127.006 }
  );

  // Intermediate waypoints
  const [waypoints, setWaypoints] = useState<RouteWaypoint[]>(
    activeRoute?.waypoints ||
      spots.slice(0, 4).map((s, idx) => ({
        id: `wp-${s.id}`,
        name: s.title,
        type: 'spot',
        spotId: s.id,
        coordinates: s.coordinates,
        note: `第${idx + 1}站巡礼打卡`,
      }))
  );

  // Spot picker drawer state
  const [showAddPicker, setShowAddPicker] = useState(false);

  // Move waypoint up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newWp = [...waypoints];
    const temp = newWp[index - 1];
    newWp[index - 1] = newWp[index];
    newWp[index] = temp;
    setWaypoints(newWp);
  };

  // Move waypoint down
  const handleMoveDown = (index: number) => {
    if (index >= waypoints.length - 1) return;
    const newWp = [...waypoints];
    const temp = newWp[index + 1];
    newWp[index + 1] = newWp[index];
    newWp[index] = temp;
    setWaypoints(newWp);
  };

  // Remove waypoint
  const handleRemove = (id: string) => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  // Add a spot as waypoint
  const handleAddSpot = (spot: HolySpot) => {
    const newWp: RouteWaypoint = {
      id: `wp-${spot.id}-${Date.now()}`,
      name: spot.title,
      type: 'spot',
      spotId: spot.id,
      coordinates: spot.coordinates,
      note: '新增中途打卡点',
    };
    setWaypoints([...waypoints, newWp]);
    setShowAddPicker(false);
  };

  // Calculate total route distance
  const calculateTotalDistance = (wps: RouteWaypoint[]): number => {
    let total = 0;
    const fullPoints = [
      { coordinates: startCoords },
      ...wps,
      { coordinates: endCoords },
    ];
    for (let i = 0; i < fullPoints.length - 1; i++) {
      total += getDistanceMeters(
        fullPoints[i].coordinates.lat,
        fullPoints[i].coordinates.lng,
        fullPoints[i + 1].coordinates.lat,
        fullPoints[i + 1].coordinates.lng
      );
    }
    return total;
  };

  // Auto-optimize route (Greedy TSP Nearest-Neighbor from start to end)
  const handleAutoOptimize = () => {
    if (waypoints.length <= 1) return;

    const remaining = [...waypoints];
    const optimized: RouteWaypoint[] = [];
    let currentPos = startCoords;

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let minDis = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = getDistanceMeters(
          currentPos.lat,
          currentPos.lng,
          remaining[i].coordinates.lat,
          remaining[i].coordinates.lng
        );
        if (d < minDis) {
          minDis = d;
          nearestIdx = i;
        }
      }
      const [nextPoint] = remaining.splice(nearestIdx, 1);
      optimized.push(nextPoint);
      currentPos = nextPoint.coordinates;
    }

    setWaypoints(optimized);
  };

  const totalMeters = calculateTotalDistance(waypoints);
  const totalKm = (totalMeters / 1000).toFixed(1);
  const walkingMinutes = Math.round(totalMeters / 80); // ~4.8 km/h
  const recommendedMinutes = Math.round(walkingMinutes + waypoints.length * 20); // +20 min per spot for photography

  const handleSaveAndApply = () => {
    const updatedRoute: PilgrimageRoute = {
      id: activeRoute?.id || `custom-route-${Date.now()}`,
      tribeId: activeTribe.id,
      title: activeRoute?.title || `${activeTribe.name.split(' ')[0]} 自定义巡礼路线`,
      subTitle: waypoints.map((w) => w.name.split(' ')[0]).join(' ➔ '),
      tagline: '按优化顺路顺序规划，涵盖核心名场面',
      coverImage:
        activeRoute?.coverImage ||
        spots.find((s) => s.id === waypoints[0]?.spotId)?.originalSceneImg ||
        activeTribe.coverImage,
      author: {
        name: '我 (自定义规划)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
      startPoint: {
        id: 'start-custom',
        name: startName,
        type: 'start',
        coordinates: startCoords,
      },
      endPoint: {
        id: 'end-custom',
        name: endName,
        type: 'end',
        coordinates: endCoords,
      },
      waypoints,
      estimatedMinutes: recommendedMinutes,
      totalDistanceKm: parseFloat(totalKm),
      popularityCount: (activeRoute?.popularityCount || 100) + 1,
      tags: [`#${activeTribe.name.split(' ')[0]}`, '#自订路线', '#顺路打卡'],
      description: `从${startName}出发，途经${waypoints.length}个打卡点，抵达${endName}。全程约${totalKm}公里，耗时约${recommendedMinutes}分钟。`,
    };

    onApplyRoute(updatedRoute);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#fffafa] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-100 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-200">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-serif-display">
                智能打卡路线规划器
              </h3>
              <p className="text-[11px] text-stone-500">
                选择起终点 · 自动顺路规划 · 手动增改中途点
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-stone-500 hover:text-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Stats Ribbon */}
        <div className="bg-gradient-to-r from-stone-50 to-teal-50/50 px-5 py-2.5 border-b border-stone-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-stone-400 block">全长里程</span>
              <span className="font-bold text-stone-900 text-sm">{totalKm} km</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">步行用时</span>
              <span className="font-bold text-stone-900 text-sm">~{walkingMinutes} 分钟</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">推荐游玩耗时</span>
              <span className="font-bold text-[#0d7a76] text-sm">~{recommendedMinutes} 分钟</span>
            </div>
          </div>

          <button
            onClick={handleAutoOptimize}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0d7a76] text-white rounded-xl text-[11px] font-semibold hover:bg-[#0b6562] shadow-xs transition-transform active:scale-95"
            title="通过最近邻算法自动重新排序中途打卡点，减少折返路程"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>智能顺路规划</span>
          </button>
        </div>

        {/* Content Body: Waypoints Sequence */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {/* Start Point Card */}
          <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              起
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-emerald-600 font-semibold block">
                行程起点
              </span>
              <input
                type="text"
                value={startName}
                onChange={(e) => setStartName(e.target.value)}
                className="w-full text-xs font-semibold text-stone-800 bg-transparent border-none p-0 focus:outline-none"
                placeholder="设置起点位置"
              />
            </div>
            <button
              onClick={() => {
                setStartName('当前我的GPS位置');
                setStartCoords(userCoords);
              }}
              className="text-[10px] px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-600 shrink-0"
            >
              设为当前位置
            </button>
          </div>

          {/* Intermediate Stops List */}
          <div className="space-y-2 relative pl-3.5 border-l-2 border-dashed border-rose-200 ml-3.5 my-2">
            {waypoints.map((wp, idx) => (
              <div
                key={wp.id}
                className="p-3 bg-white rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between gap-2 hover:border-rose-300 transition-all -ml-3.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center text-xs font-bold border border-rose-200 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-stone-900 truncate">
                      {wp.name}
                    </h4>
                    <p className="text-[10px] text-stone-400 truncate">
                      {wp.note || '中途打卡站'}
                    </p>
                  </div>
                </div>

                {/* Reorder and Delete Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 flex items-center justify-center text-stone-600"
                    title="上移此打卡点"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === waypoints.length - 1}
                    className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 flex items-center justify-center text-stone-600"
                    title="下移此打卡点"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemove(wp.id)}
                    className="w-6 h-6 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center ml-1"
                    title="移除此打卡点"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Waypoint Button */}
            <div className="-ml-3.5 pt-1">
              {!showAddPicker ? (
                <button
                  onClick={() => setShowAddPicker(true)}
                  className="w-full py-2.5 px-3 border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/50 rounded-2xl text-rose-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加中途打卡点（来自当前部落点位库）</span>
                </button>
              ) : (
                <div className="p-3 bg-white rounded-2xl border border-rose-300 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                    <span>从【{activeTribe.name}】选择加入路线：</span>
                    <button
                      onClick={() => setShowAddPicker(false)}
                      className="text-stone-400 hover:text-stone-600 text-xs"
                    >
                      取消
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {spots
                      .filter((s) => !waypoints.some((w) => w.spotId === s.id))
                      .map((spot) => (
                        <div
                          key={spot.id}
                          onClick={() => handleAddSpot(spot)}
                          className="p-2 rounded-xl bg-stone-50 hover:bg-rose-50 flex items-center justify-between text-xs cursor-pointer border border-stone-100"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={spot.originalSceneImg}
                              alt={spot.title}
                              className="w-7 h-7 rounded object-cover"
                            />
                            <span className="font-medium text-stone-800">
                              {spot.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-rose-600 font-semibold">
                            + 加入
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* End Point Card */}
          <div className="p-3 bg-white rounded-2xl border border-rose-300 shadow-xs flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              终
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-rose-600 font-semibold block">
                行程终点
              </span>
              <input
                type="text"
                value={endName}
                onChange={(e) => setEndName(e.target.value)}
                className="w-full text-xs font-semibold text-stone-800 bg-transparent border-none p-0 focus:outline-none"
                placeholder="设置终点位置"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-white border-t border-stone-200/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSaveAndApply}
            className="flex-1 py-3 px-5 bg-black hover:bg-stone-800 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-transform"
          >
            <Check className="w-4 h-4" />
            <span>保存路线并开启地图导航</span>
          </button>
        </div>
      </div>
    </div>
  );
};
