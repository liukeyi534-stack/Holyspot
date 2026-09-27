import React, { useState } from 'react';
import { CommunityPost, Tribe } from '../types';
import {
  Heart,
  MessageCircle,
  Share2,
  ShieldAlert,
  Plus,
  Sparkles,
  MapPin,
  Camera,
  Filter,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface CommunityFeedProps {
  activeTribe: Tribe;
  posts: CommunityPost[];
  onLikePost: (postId: string) => void;
  onAddPost: (newPost: CommunityPost) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  activeTribe,
  posts,
  onLikePost,
  onAddPost,
}) => {
  // 3 Sub-tabs as required
  const [activeTab, setActiveTab] = useState<'checkin' | 'discuss' | 'treasure-story'>(
    'checkin'
  );

  // Report modal state
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('跨圈冲突 / 引战言论');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Quick discussion compose drawer
  const [showCompose, setShowCompose] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeContent, setComposeContent] = useState('');

  // Filter posts belonging strictly to this tribe & current tab
  const tribePosts = posts.filter(
    (p) => p.tribeId === activeTribe.id && p.category === activeTab
  );

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportingPostId(null);
    }, 1800);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      tribeId: activeTribe.id,
      category: activeTab,
      author: {
        name: '次元漫游者 (我)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        handle: '@traveler_me',
      },
      timeAgo: '刚刚',
      title: composeTitle.trim() || undefined,
      content: composeContent.trim(),
      likes: 1,
      commentsCount: 0,
      likedByMe: true,
      tags: [`#${activeTribe.name.split(' ')[0]}`, '#同好交流'],
    };

    onAddPost(newPost);
    setComposeTitle('');
    setComposeContent('');
    setShowCompose(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#fdf8f7]">
      {/* Feed Sub-Header with 3 Sections */}
      <div className="bg-white/90 backdrop-blur-xs border-b border-rose-100 px-4 pt-3 pb-2.5 space-y-2 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 font-serif-display">
              {activeTribe.name.split(' ')[0]} · 部落社群
            </h2>
            <p className="text-[10px] text-stone-400">
              圈子严格隔离 · 专属同好打卡与探讨
            </p>
          </div>

          <button
            onClick={() => setShowCompose(!showCompose)}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>发布</span>
          </button>
        </div>

        {/* 3 Section Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-stone-100/80 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`py-1.5 rounded-lg text-center transition-colors ${
              activeTab === 'checkin'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            巡礼打卡墙
          </button>
          <button
            onClick={() => setActiveTab('discuss')}
            className={`py-1.5 rounded-lg text-center transition-colors ${
              activeTab === 'discuss'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            部落讨论区
          </button>
          <button
            onClick={() => setActiveTab('treasure-story')}
            className={`py-1.5 rounded-lg text-center transition-colors ${
              activeTab === 'treasure-story'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            寻宝故事板
          </button>
        </div>
      </div>

      {/* Compose drawer */}
      {showCompose && (
        <form
          onSubmit={handleCreatePost}
          className="mx-4 mt-3 p-3.5 bg-white rounded-2xl border border-rose-200 shadow-md space-y-2.5 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
            <span>发布到「{activeTab === 'checkin' ? '打卡墙' : activeTab === 'discuss' ? '讨论区' : '寻宝故事板'}」</span>
            <button
              type="button"
              onClick={() => setShowCompose(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              取消
            </button>
          </div>
          <input
            type="text"
            placeholder="标题（可选）"
            value={composeTitle}
            onChange={(e) => setComposeTitle(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-stone-200 focus:outline-rose-400"
          />
          <textarea
            rows={3}
            placeholder={`在${activeTribe.name}部落分享你的巡礼心得、机位勘误或现场故事...`}
            value={composeContent}
            onChange={(e) => setComposeContent(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-stone-200 focus:outline-rose-400"
            required
          />
          <button
            type="submit"
            className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
          >
            发布动态
          </button>
        </form>
      )}

      {/* Posts Feed list (reference image image.png style) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tribePosts.length === 0 ? (
          <div className="py-16 text-center text-stone-400 space-y-2">
            <div className="w-12 h-12 rounded-full bg-rose-50 mx-auto flex items-center justify-center text-rose-400">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs">该分区暂无动态，快来留下第一个巡礼作品吧！</p>
          </div>
        ) : (
          tribePosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl p-4 border border-rose-100/80 shadow-xs hover:border-rose-200 transition-all space-y-3"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-9 h-9 rounded-full object-cover border border-rose-100"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-stone-900">
                      {post.author.name}
                    </h4>
                    <span className="text-[10px] text-stone-400">
                      {post.timeAgo}
                    </span>
                  </div>
                </div>

                {/* More / Report trigger */}
                <button
                  onClick={() => setReportingPostId(post.id)}
                  className="text-stone-400 hover:text-stone-600 p-1 text-xs"
                  title="举报或屏蔽此内容"
                >
                  •••
                </button>
              </div>

              {/* Title & Body content */}
              <div>
                {post.title && (
                  <h3 className="font-bold text-sm text-stone-900 mb-1 leading-snug">
                    {post.title}
                  </h3>
                )}
                <p className="text-xs text-stone-700 leading-relaxed font-sans whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Post Image (if any) */}
              {post.image && (
                <div className="rounded-2xl overflow-hidden border border-rose-100 max-h-72 bg-stone-900">
                  <img
                    src={post.image}
                    alt="打卡作品"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Spot reference & template tag */}
              {(post.spotTitle || post.templateUsed) && (
                <div className="flex items-center gap-2 text-[11px] text-stone-400">
                  {post.spotTitle && (
                    <span className="flex items-center gap-1 text-rose-600 font-medium">
                      <MapPin className="w-3 h-3" />
                      {post.spotTitle}
                    </span>
                  )}
                  {post.templateUsed && (
                    <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                      模板: {post.templateUsed}
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-rose-600 bg-rose-50/70 px-2 py-0.5 rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Engagement Bar (matching reference image.png: likes, comments, shares, friend avatars) */}
              <div className="pt-2 border-t border-rose-100/60 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      post.likedByMe
                        ? 'text-rose-600 font-medium'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        post.likedByMe ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span>{post.likes}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentsCount}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <span className="inline-block w-4 h-4 rounded-full ring-1 ring-white bg-rose-200" />
                    <span className="inline-block w-4 h-4 rounded-full ring-1 ring-white bg-pink-300" />
                  </div>
                  <span>同好觉得很赞</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Community Report Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-rose-100 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>部落社区合规举报</span>
            </div>

            {reportSuccess ? (
              <div className="py-4 text-center space-y-2 text-emerald-700">
                <div className="w-10 h-10 rounded-full bg-emerald-100 mx-auto flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold">举报已收到，管理员已自动折叠此内容</p>
                <p className="text-[10px] text-stone-400">坚决维护圈子隔离与友好巡礼氛围</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                <p className="text-stone-600">
                  若发现违背跨部落隔离原则、引战或不实机位信息，请选择原因：
                </p>
                <div className="space-y-1.5">
                  {[
                    '跨圈引战 / 带有饭圈或二次元恶意言论',
                    '点位地址严重错误 / 破坏实地居民隐私',
                    '广告营销 / 虚假代购',
                    '其他违规',
                  ].map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 hover:bg-stone-100 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="reason"
                        checked={reportReason === reason}
                        onChange={() => setReportReason(reason)}
                        className="text-rose-600"
                      />
                      <span className="text-stone-700">{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingPostId(null)}
                    className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs"
                  >
                    提交举报
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
