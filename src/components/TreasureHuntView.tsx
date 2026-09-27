import React, { useState } from 'react';
import { HolySpot, Tribe, TreasureNote } from '../types';
import { getDistanceMeters, formatDistance } from '../utils/geo';
import {
  X,
  Lock,
  Unlock,
  Heart,
  Sparkles,
  Send,
  Camera,
  Clock,
  ShieldAlert,
  Award,
  Calendar,
} from 'lucide-react';

interface TreasureHuntViewProps {
  isOpen: boolean;
  onClose: () => void;
  spot: HolySpot;
  tribe: Tribe;
  notes: TreasureNote[];
  userCoords: { lat: number; lng: number };
  onSimulateAtSpot: () => void;
  onAddNote: (newNote: TreasureNote) => void;
  onLikeNote: (noteId: string) => void;
}

export const TreasureHuntView: React.FC<TreasureHuntViewProps> = ({
  isOpen,
  onClose,
  spot,
  tribe,
  notes,
  userCoords,
  onSimulateAtSpot,
  onAddNote,
  onLikeNote,
}) => {
  const [showCompose, setShowCompose] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [capsuleDays, setCapsuleDays] = useState(30);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showBadgeToast, setShowBadgeToast] = useState(false);

  if (!isOpen) return null;

  const distance = getDistanceMeters(
    userCoords.lat,
    userCoords.lng,
    spot.coordinates.lat,
    spot.coordinates.lng
  );
  const isUnlocked = distance <= 500;

  // Filter notes that belong strictly to this spot AND this tribe
  const spotNotes = notes.filter(
    (n) => n.spotId === spot.id && n.tribeId === tribe.id
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSpotSamplePhoto = () => {
    setPhotoPreview(spot.originalSceneImg);
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const newNote: TreasureNote = {
      id: `note-${Date.now()}`,
      spotId: spot.id,
      tribeId: tribe.id,
      author: {
        name: '次元漫游者 (我)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        badge: tribe.badgeTitle,
      },
      content: noteContent.trim(),
      photoUrl: photoPreview || undefined,
      createdAt: '刚刚',
      likes: 1,
      likedByMe: true,
      isTimeCapsule,
      unlockAfterDays: isTimeCapsule ? capsuleDays : undefined,
    };

    onAddNote(newNote);
    setNoteContent('');
    setPhotoPreview(null);
    setShowCompose(false);
    setShowBadgeToast(true);
    setTimeout(() => setShowBadgeToast(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#fffafa] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-100 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-200">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-stone-900 font-serif-display">
                  次元寻宝 · 现场留言池
                </h3>
                <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded font-semibold">
                  {tribe.name.split(' ')[0]} 专属
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                {spot.title} ({spot.city})
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

        {/* Badge unlock toast notification */}
        {showBadgeToast && (
          <div className="mx-4 mt-2 p-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-2xl shadow-lg flex items-center gap-3 animate-in zoom-in-95">
            <span className="text-2xl">{tribe.badgeIcon}</span>
            <div className="flex-1">
              <p className="text-xs font-bold">🎉 获得部落专属巡礼徽章！</p>
              <p className="text-[11px] opacity-90">
                「{tribe.badgeTitle}」已收录进你的个人巡礼册。
              </p>
            </div>
          </div>
        )}

        {/* LBS Distance Warning or Status Bar */}
        <div
          className={`px-4 py-2 border-b flex items-center justify-between text-xs ${
            isUnlocked
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-amber-50 border-amber-100 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isUnlocked ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>
              {isUnlocked
                ? `已进入圣地范围 (${formatDistance(distance)}) · 寻宝纸条已解锁`
                : `距离圣地 ${formatDistance(distance)} · 必须到达实地解锁`}
            </span>
          </div>

          {!isUnlocked && (
            <button
              onClick={onSimulateAtSpot}
              className="px-2 py-0.5 rounded bg-amber-600 text-white text-[11px] font-medium hover:bg-amber-700 shadow-xs"
            >
              模拟瞬移解锁
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {!isUnlocked ? (
            /* Locked State View */
            <div className="py-12 px-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-amber-700">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-base">
                  圣地寻宝池已上锁
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  这是【{tribe.name}】同好留在【{spot.title}】的专属纸条。
                  只有当你真正跨越山海抵达这个现实经纬度（500米内），前人的密语才会为你显现。
                </p>
              </div>

              {/* Blurred teaser cards */}
              <div className="p-4 bg-stone-100/70 rounded-2xl filter blur-xs select-none pointer-events-none text-left space-y-2">
                <div className="h-3 w-1/3 bg-stone-300 rounded" />
                <div className="h-4 w-full bg-stone-200 rounded" />
                <div className="h-4 w-2/3 bg-stone-200 rounded" />
              </div>

              <div className="pt-2">
                <button
                  onClick={onSimulateAtSpot}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>立即模拟抵达现场（体验寻宝）</span>
                </button>
                <p className="text-[10px] text-stone-400 mt-2">
                  * 仅供体验测试：实地巡礼时使用手机 GPS 现场自动解锁
                </p>
              </div>
            </div>
          ) : (
            /* Unlocked Notes Stream */
            <div className="space-y-3">
              {/* Compose prompt button */}
              {!showCompose ? (
                <button
                  onClick={() => setShowCompose(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-white border-2 border-dashed border-rose-300 hover:border-rose-500 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all group"
                >
                  <span className="text-base group-hover:scale-125 transition-transform">
                    ✉️
                  </span>
                  <span>在这座圣地留下我的寻宝纸条 / 时间胶囊</span>
                </button>
              ) : (
                /* Write a note form */
                <form
                  onSubmit={handleSubmitNote}
                  className="p-4 bg-white rounded-2xl border border-rose-200 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                      <span>✏️</span> 留下属于你的次元印记
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCompose(false)}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      收起
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="写下站在这个圣地坐标时，心底最想说的那句话……（同好抵达此地即可拆开）"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-[#fffdfc] focus:outline-rose-400"
                    required
                  />

                  {/* Photo selector (raw photo, no heavy sliders) */}
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      附上一张随手实景拍（原汁原味，少后期）：
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs cursor-pointer flex items-center gap-1 border border-stone-200">
                        <Camera className="w-3.5 h-3.5" />
                        <span>上传实景原图</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleUseSpotSamplePhoto}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs hover:bg-rose-100"
                      >
                        使用圣地当前机位
                      </button>
                    </div>

                    {photoPreview && (
                      <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-rose-200">
                        <img
                          src={photoPreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(null)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Time Capsule Toggle */}
                  <div className="pt-1 border-t border-stone-100 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTimeCapsule}
                        onChange={(e) => setIsTimeCapsule(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        封存为时间胶囊
                      </span>
                    </label>

                    {isTimeCapsule && (
                      <select
                        value={capsuleDays}
                        onChange={(e) => setCapsuleDays(Number(e.target.value))}
                        className="text-xs bg-stone-100 border border-stone-200 rounded px-2 py-1"
                      >
                        <option value={30}>30天后被下一位旅行者拆开</option>
                        <option value={180}>半年后解封</option>
                        <option value={365}>1年后解封</option>
                      </select>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>封存纸条并留在此地</span>
                  </button>
                </form>
              )}

              {/* Notes List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                  <span>现场已解锁 {spotNotes.length} 张同好纸条</span>
                  <span className="text-[11px] text-rose-600">纯现场实录 · 无滤镜修图</span>
                </div>

                {spotNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-white rounded-2xl border border-rose-100/80 shadow-xs hover:border-rose-200 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={note.author.avatar}
                          alt={note.author.name}
                          className="w-8 h-8 rounded-full object-cover border border-rose-100"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-stone-900">
                              {note.author.name}
                            </span>
                            {note.author.badge && (
                              <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md font-medium">
                                {note.author.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400">
                            {note.createdAt}
                          </span>
                        </div>
                      </div>

                      {note.isTimeCapsule && (
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          时间胶囊
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed font-sans">
                      {note.content}
                    </p>

                    {note.photoUrl && (
                      <div className="rounded-xl overflow-hidden max-h-44 border border-rose-100">
                        <img
                          src={note.photoUrl}
                          alt="note photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[10px] text-stone-400">
                        GPS 验证：抵达 {spot.title}
                      </span>
                      <button
                        onClick={() => onLikeNote(note.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors ${
                          note.likedByMe
                            ? 'text-rose-600 bg-rose-50'
                            : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            note.likedByMe ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                        <span>{note.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 border-t border-rose-100 text-[10px] text-stone-400 text-center">
          娱乐性 LBS 机制 · 圈子隔离保障 · 严禁违规占用居民私有场地
        </div>
      </div>
    </div>
  );
};
