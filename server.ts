import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API: Generate RedBook copy & tags for Pilgrimage check-ins
app.post('/api/gemini/generate-post', async (req, res) => {
  try {
    const { spotName, tribeName, ipType, userNotes, styleTemplate, animeQuote, locationCity } = req.body;

    if (!ai) {
      // Smart offline fallback if API key is not configured
      return res.json({
        title: `📍${spotName}｜终于吹到了${tribeName}里的风✨`,
        content: `“${animeQuote || '总有些地方，只为了奔赴心底那份最初的悸动。'}”\n\n终于来到【${spotName}】实景打卡！现场看到这个熟悉的机位那一刻，眼泪差点掉下来，脑海里自动播放专属BGM！${userNotes ? `\n\n📌 随行手记：${userNotes}` : ''}\n\n💡 巡礼贴士：\n1. 最佳光线：下午4点左右的斜阳，海水与铁道氛围感直接拉满\n2. 机位建议：站在红绿灯斜对角，等待电车/行人穿行瞬间捕捉\n3. 保持安静，不影响当地居民正常生活哦～`,
        tags: [
          `#${tribeName}圣地巡礼`,
          `#${spotName}`,
          `#二次元巡礼`,
          `#${locationCity || '旅行'}打卡`,
          '#治愈系风景',
          '#我的动漫同款机位',
          '#小红书旅行指南',
        ],
        quoteSummary: animeQuote || '青春总有回响，圣地终有相逢。',
        isAiGenerated: false,
      });
    }

    const prompt = `你是一个资深且极懂年轻群体的社交媒体（小红书/Instagram）旅行博主，专注于【二次元动漫与KPOP圣地巡礼】。
请为用户在特定巡礼点位的打卡生成一篇高质量、有温度、代入感极强的小红书图文文案。

【打卡点位信息】
- 所属部落/IP：${tribeName} (${ipType})
- 具体圣地名：${spotName}
- 城市地点：${locationCity || '海外/国内实景'}
- 原作名台词/名场面：${animeQuote || '暂无'}
- 用户现场随手碎碎念：${userNotes || '终于跨越次元壁来到这里！'}
- 预设风格：${styleTemplate || '胶片质感'}

【输出要求】
1. title: 极其吸睛的小红书爆款标题（带emoji，简练有画面感，30字以内）
2. content: 正文内容，包含感叹共鸣、现场情境细节、金句台词呼应，排版舒适换行，适当emoji，并附带1-2条真实的巡礼拍摄或礼仪贴士。
3. tags: 6-8个精准高流量的小红书话题标签（以#开头）
4. quoteSummary: 一句适合印在图片下方的金句或中日/中韩双语名台词摘要（15字以内）

请以严格的 JSON 格式输出。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            quoteSummary: { type: Type.STRING },
          },
          required: ['title', 'content', 'tags', 'quoteSummary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      isAiGenerated: true,
    });
  } catch (err: any) {
    console.error('Error generating post copy:', err);
    return res.status(500).json({
      error: '生成文案失败，请稍后重试',
      message: err.message,
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), aiReady: Boolean(ai) });
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
