import React, { useState } from 'react';
import { UserProfile, Tribe, CommunityPost, TreasureNote } from '../types';
import {
  Award,
  BookOpen,
  MapPin,
  Heart,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  tribes: Tribe[];
  posts: CommunityPost[];
  myNotes: TreasureNote[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  tribes,
  posts,
  myNotes,
}) => {
  const [profileTab, setProfileTab] = useState<'passport' | 'badges' | 'notes'>('passport');

  // Filter posts created by current user
  const myPosts = posts.filter((p) => p.author.handle === '@traveler_me' || p.author.name.includes('(我)'));

  return (
    <div className="flex flex-col h-full bg-[#fdf8f7] overflow-y-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-[#ffe7e7] to-white/90 px-5 pt-6 pb-4 border-b border-rose-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-rose-400 p-0.5 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif-display">
                {user.name}
              </h2>
              <p className="text-xs text-stone-500">{user.handle}</p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-flex font-medium">
                <ShieldCheck className="w-3 h-3 text-rose-600" />
                <span>实地 GPS 认证漫游者</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-600 mt-3 leading-relaxed">
          {user.bio}
        </p>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-rose-100/70 text-center">
          <div className="bg-white/70 p-2 rounded-xl border border-rose-100/60 shadow-2xs">
            <div className="text-lg font-bold text-stone-900 font-serif-display">
              {user.visitedSpotsCount}
            </div>
            <div className="text-[10px] text-stone-500">圣地巡礼实踩</div>
          </div>
          <div className="bg-white/70 p-2 rounded-xl border border-rose-100/60 shadow-2xs">
            <div className="text-lg font-bold text-stone-900 font-serif-display">
              {user.badges.length}
            </div>
            <div className="text-[10px] text-stone-500">收集部落徽章</div>
          </div>
          <div className="bg-white/70 p-2 rounded-xl border border-rose-100/60 shadow-2xs">
            <div className="text-lg font-bold text-stone-900 font-serif-display">
              {user.notesLeftCount + myNotes.length}
            </div>
            <div className="text-[10px] text-stone-500">留下现场纸条</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="px-4 pt-3 bg-white/70 border-b border-rose-100">
        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setProfileTab('passport')}
            className={`pb-2.5 transition-colors border-b-2 ${
              profileTab === 'passport'
                ? 'border-rose-600 text-rose-700 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            个人巡礼册 ({myPosts.length})
          </button>
          <button
            onClick={() => setProfileTab('badges')}
            className={`pb-2.5 transition-colors border-b-2 ${
              profileTab === 'badges'
                ? 'border-rose-600 text-rose-700 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            巡礼勋章馆 ({user.badges.length})
          </button>
          <button
            onClick={() => setProfileTab('notes')}
            className={`pb-2.5 transition-colors border-b-2 ${
              profileTab === 'notes'
                ? 'border-rose-600 text-rose-700 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            我留下的纸条 ({myNotes.length})
          </button>
        </div>
      </div>

      {/* Profile Tab Contents */}
      <div className="p-4 flex-1">
        {profileTab === 'passport' ? (
          /* Pilgrimage Passport Timeline */
          <div className="space-y-3">
            {myPosts.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <BookOpen className="w-10 h-10 mx-auto text-rose-300" />
                <p className="text-xs">
                  去圣地完成一次一键打卡，将为你盖下第一枚专属巡礼邮戳！
                </p>
              </div>
            ) : (
              myPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-3.5 border border-rose-100 shadow-xs flex gap-3"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-20 h-24 object-cover rounded-xl border border-rose-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-medium">
                        <MapPin className="w-3 h-3" />
                        <span>{post.spotTitle || '圣地现场'}</span>
                        <span>·</span>
                        <span className="text-stone-400">{post.timeAgo}</span>
                      </div>
                      <h4 className="font-semibold text-xs text-stone-900 mt-1 line-clamp-1">
                        {post.title || '圣地巡礼手记'}
                      </h4>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-stone-400 pt-1">
                      <span className="text-rose-600 font-medium">
                        模板: {post.templateUsed || '零后期直出'}
                      </span>
                      <span>{post.likes} 同好点赞</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : profileTab === 'badges' ? (
          /* Badges Collection Showcase */
          <div className="grid grid-cols-2 gap-3">
            {user.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-xs text-center space-y-1.5 hover:border-rose-200 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-100 to-rose-100 mx-auto flex items-center justify-center text-2xl shadow-inner">
                  {badge.icon}
                </div>
                <h4 className="font-bold text-xs text-stone-900">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-stone-500 line-clamp-2">
                  {badge.desc}
                </p>
                <div className="text-[9px] text-stone-400 pt-1">
                  解锁于 {badge.unlockedAt}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* My Treasure Notes */
          <div className="space-y-3">
            {myNotes.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <Sparkles className="w-10 h-10 mx-auto text-rose-300" />
                <p className="text-xs">
                  抵达圣地坐标后，留下给后人的寻宝小纸条将展示在这里。
                </p>
              </div>
            ) : (
              myNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl p-3.5 border border-rose-100 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-medium text-rose-700">
                      圣地坐标留言
                    </span>
                    <span>{note.createdAt}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                    <span>
                      {note.isTimeCapsule ? '⏳ 时间胶囊留言' : '✉️ 即时纸条'}
                    </span>
                    <span className="flex items-center gap-1 text-rose-600 font-medium">
                      <Heart className="w-3 h-3 fill-rose-500" />
                      {note.likes} 人现场拾起并点赞
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
