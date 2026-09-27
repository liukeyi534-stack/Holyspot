import React, { useState, useEffect } from 'react';
import { HolySpot, Tribe, CommunityPost } from '../types';
import { generateRedBookPoster, PosterConfig } from '../utils/canvasPoster';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Camera,
  RefreshCw,
  Share2,
  Sliders,
  Layers,
  FileText,
} from 'lucide-react';

interface CheckinGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot: HolySpot;
  tribe: Tribe;
  onPublishPost: (post: CommunityPost) => void;
}

export const CheckinGeneratorModal: React.FC<CheckinGeneratorModalProps> = ({
  isOpen,
  onClose,
  spot,
  tribe,
  onPublishPost,
}) => {
  // 4 tailored zero-post presets
  const [selectedTemplate, setSelectedTemplate] = useState<PosterConfig['template']>(
    tribe.defaultTemplate || 'anime-split'
  );

  // User's photo (defaults to originalSceneImg or user upload)
  const [userPhoto, setUserPhoto] = useState<string>(spot.originalSceneImg);

  // Poster generated canvas preview
  const [posterDataUrl, setPosterDataUrl] = useState<string>('');
  const [isRenderingPoster, setIsRenderingPoster] = useState(false);

  // AI Generated RedBook Copy & Tags
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiTitle, setAiTitle] = useState('');
  const [aiContent, setAiContent] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState('');

  // UI status
  const [copiedToast, setCopiedToast] = useState(false);
  const [publishedToast, setPublishedToast] = useState(false);

  // Generate AI copy on open or refresh
  const fetchAiCopy = async (notesText = userNotes) => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotName: spot.title,
          tribeName: tribe.name,
          ipType: tribe.type,
          locationCity: spot.city,
          animeQuote: spot.animeQuote,
          userNotes: notesText,
          styleTemplate: selectedTemplate,
        }),
      });
      const data = await res.json();
      if (data.title) {
        setAiTitle(data.title);
        setAiContent(data.content);
        setAiTags(data.tags || []);
      }
    } catch (e) {
      console.error('Failed to generate AI copy:', e);
      // Fallback
      setAiTitle(`📍${spot.title}｜终于吹到了${tribe.name.split(' ')[0]}的海风✨`);
      setAiContent(
        `“${spot.animeQuote}”\n\n终于来到圣地【${spot.title}】现场实拍打卡！跨越次元壁的那一刻心跳飙到180，海浪声与微风都和故事里一模一样。零后期直出，这就是圣地巡礼的治愈力量！`
      );
      setAiTags([
        `#${tribe.name.split(' ')[0]}圣地巡礼`,
        `#${spot.title}`,
        '#小红书打卡',
        '#二次元旅行',
      ]);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Re-render poster canvas whenever template or image changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsRenderingPoster(true);

    generateRedBookPoster({
      template: selectedTemplate,
      userImage: userPhoto,
      originalSceneImage: spot.originalSceneImg,
      spotTitle: spot.title,
      spotCity: spot.city,
      tribeName: tribe.name,
      quote: spot.animeQuote,
      coordinates: spot.coordinates,
    })
      .then((dataUrl) => {
        if (isMounted) {
          setPosterDataUrl(dataUrl);
          setIsRenderingPoster(false);
        }
      })
      .catch((err) => {
        console.error('Error generating canvas poster:', err);
        if (isMounted) setIsRenderingPoster(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedTemplate, userPhoto, spot, tribe]);

  // Initial AI copy generation when opened
  useEffect(() => {
    if (isOpen) {
      fetchAiCopy();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyRedBookText = () => {
    const fullText = `${aiTitle}\n\n${aiContent}\n\n${aiTags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleDownloadPoster = () => {
    if (!posterDataUrl) return;
    const a = document.createElement('a');
    a.href = posterDataUrl;
    a.download = `HolySpot_${spot.title.replace(/\s+/g, '_')}_3x4.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePublishToCommunity = () => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      tribeId: tribe.id,
      spotId: spot.id,
      spotTitle: spot.title,
      category: 'checkin',
      author: {
        name: '次元漫游者 (我)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        handle: '@traveler_me',
      },
      timeAgo: '刚刚',
      title: aiTitle,
      content: aiContent,
      image: posterDataUrl || userPhoto,
      templateUsed:
        selectedTemplate === 'anime-split'
          ? '上下名场面对比'
          : selectedTemplate === 'film-vintage'
          ? '日系复古胶片'
          : selectedTemplate === 'y2k-cool'
          ? 'KPOP冷调银色杂志'
          : '电影宽画幅',
      likes: 1,
      commentsCount: 0,
      likedByMe: true,
      tags: aiTags,
    };

    onPublishPost(newPost);
    setPublishedToast(true);
    setTimeout(() => {
      setPublishedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-xl bg-[#fffafa] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-rose-100 max-h-[94vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-200">
        {/* Top Header */}
        <div className="px-5 pt-3.5 pb-2.5 border-b border-rose-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-stone-900 font-serif-display">
                一键生成小红书素材 · 零后期直出
              </h3>
            </div>
            <p className="text-[11px] text-stone-500">
              自动裁切 3:4 比例 · 部落专属质感模板 · AI 爆款图文
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-stone-500 hover:text-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Section 1: Template Selection (Zero slider rule) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-rose-500" />
                部落专属风格模板（极简预设 · 拒绝繁复后期）
              </span>
              <span className="text-[10px] text-stone-400">小红书 3:4 标准比</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate('anime-split')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedTemplate === 'anime-split'
                    ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-200'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="font-semibold text-xs text-stone-800">上下名场面对比</div>
                <div className="text-[10px] text-rose-600 mt-0.5">动漫圣地专属自动拼图</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('film-vintage')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedTemplate === 'film-vintage'
                    ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-200'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="font-semibold text-xs text-stone-800">日系复古胶片</div>
                <div className="text-[10px] text-amber-600 mt-0.5">35mm 暖调日期印记</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('y2k-cool')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedTemplate === 'y2k-cool'
                    ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-200'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="font-semibold text-xs text-stone-800">KPOP冷调杂志</div>
                <div className="text-[10px] text-pink-600 mt-0.5">韩系银色条形码排版</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('cinematic-letterbox')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedTemplate === 'cinematic-letterbox'
                    ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-200'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="font-semibold text-xs text-stone-800">电影宽幕台词</div>
                <div className="text-[10px] text-blue-600 mt-0.5">16:9 黑边与双语金句</div>
              </button>
            </div>
          </div>

          {/* Section 2: Poster Canvas Preview & Photo switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Poster Preview */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-3/4 max-w-[240px] rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-stone-900 flex items-center justify-center">
                {isRenderingPoster ? (
                  <div className="flex flex-col items-center gap-2 text-stone-300 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
                    <span>排版渲染中...</span>
                  </div>
                ) : posterDataUrl ? (
                  <img
                    src={posterDataUrl}
                    alt="成品图"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>

              {/* Photo switch buttons */}
              <div className="mt-2.5 flex items-center gap-2">
                <label className="px-2.5 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer flex items-center gap-1 border border-stone-200">
                  <Camera className="w-3 h-3" />
                  <span>换我的实拍</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomPhotoUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setUserPhoto(spot.originalSceneImg)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100"
                >
                  重置爱豆官方机位图
                </button>
              </div>
            </div>

            {/* AI Copywriting & Tags Section */}
            <div className="bg-white p-3.5 rounded-2xl border border-rose-100/90 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  AI 智能巡礼文案 & 话题
                </span>
                <button
                  onClick={() => fetchAiCopy()}
                  disabled={isGeneratingAi}
                  className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isGeneratingAi ? 'animate-spin' : ''}`}
                  />
                  <span>换一篇</span>
                </button>
              </div>

              {/* AI Generated Title */}
              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">小红书标题：</label>
                <input
                  type="text"
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  className="w-full text-xs font-semibold text-stone-900 bg-stone-50 p-2 rounded-lg border border-stone-200 focus:outline-rose-400"
                />
              </div>

              {/* AI Generated Content */}
              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">图文正文：</label>
                <textarea
                  rows={4}
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  className="w-full text-xs text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-200 focus:outline-rose-400 leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {aiTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-3.5 bg-white border-t border-rose-100 flex flex-wrap items-center justify-between gap-2">
          {/* Copy Toast */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRedBookText}
              className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">文案已复制！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>一键复制全套文案</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPoster}
              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 3:4 成品图</span>
            </button>
          </div>

          <button
            onClick={handlePublishToCommunity}
            disabled={publishedToast}
            className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-98 transition-all ml-auto"
          >
            {publishedToast ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>已同步到打卡墙！</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>同步至部落打卡墙</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
