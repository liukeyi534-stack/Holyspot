export interface PosterConfig {
  template: 'anime-split' | 'film-vintage' | 'y2k-cool' | 'cinematic-letterbox';
  userImage: string; // url or dataUrl
  originalSceneImage?: string;
  spotTitle: string;
  spotCity: string;
  tribeName: string;
  quote: string;
  quoteSummary?: string;
  coordinates: { lat: number; lng: number };
  dateStr?: string;
}

// Helper to load image
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Create fallback colored canvas if external image fails
      const fallback = document.createElement('canvas');
      fallback.width = 800;
      fallback.height = 600;
      const ctx = fallback.getContext('2d')!;
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText('巡礼实景现场', 300, 300);
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.src = fallback.toDataURL();
    };
    img.src = src;
  });
}

export async function generateRedBookPoster(config: PosterConfig): Promise<string> {
  const canvas = document.createElement('canvas');
  // RedBook 3:4 high definition format: 1200 x 1600
  const width = 1200;
  const height = 1600;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const userImg = await loadImage(config.userImage);
  const now = config.dateStr || '2026.09.26';
  const coordsText = `${config.coordinates.lat.toFixed(4)}°N, ${config.coordinates.lng.toFixed(4)}°E`;

  if (config.template === 'anime-split') {
    // Top-Bottom Split (Anime Original vs Real Life Photo)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const origImg = config.originalSceneImage
      ? await loadImage(config.originalSceneImage)
      : userImg;

    // Top: Original scene (50% minus margin)
    const splitH = 680;
    const pad = 40;
    const topW = width - pad * 2;

    // Draw top image
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pad, pad, topW, splitH, 20);
    ctx.clip();
    drawCoverImage(ctx, origImg, pad, pad, topW, splitH);
    // Subtle scrim on top
    const topGrad = ctx.createLinearGradient(pad, pad, pad, pad + 100);
    topGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(pad, pad, topW, 100);
    ctx.restore();

    // Top badge: 原作名场面
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.roundRect(pad + 24, pad + 24, 160, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('原作名场面', pad + 104, pad + 54);

    // Bottom: Real Life Shot
    const botY = pad + splitH + 20;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pad, botY, topW, splitH, 20);
    ctx.clip();
    drawCoverImage(ctx, userImg, pad, botY, topW, splitH);
    ctx.restore();

    // Bottom badge: 巡礼实拍
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(pad + 24, botY + 24, 160, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('现场实拍打卡', pad + 104, botY + 54);

    // Footer information bar
    const footerY = botY + splitH + 24;
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(config.spotTitle, pad, footerY + 36);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${config.spotCity} · ${coordsText}`, pad, footerY + 74);

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'italic 26px "Cormorant Garamond", serif';
    ctx.fillText(config.quote, pad, footerY + 115);

    // Right logo seal
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('次元巡礼 · HOLYSPOT', width - pad, footerY + 45);
    ctx.fillStyle = '#64748b';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(config.tribeName, width - pad, footerY + 75);
    ctx.fillText(now, width - pad, footerY + 105);

  } else if (config.template === 'film-vintage') {
    // Japanese Vintage Film Style
    ctx.fillStyle = '#f5efe6';
    ctx.fillRect(0, 0, width, height);

    const pad = 60;
    const photoH = 1200;
    const photoW = width - pad * 2;

    // Draw main photo with warm tone
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    drawCoverImage(ctx, userImg, pad, pad + 50, photoW, photoH);
    ctx.restore();

    // Top film header
    ctx.fillStyle = '#78716c';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`KODAK ULTRA 400 · ${now}`, pad, pad + 25);
    ctx.textAlign = 'right';
    ctx.fillText(`${config.tribeName} // PILGRIMAGE`, width - pad, pad + 25);

    // Orange film date stamp on image (bottom-right of photo)
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`'26 09 26`, width - pad - 30, pad + 50 + photoH - 30);

    // Bottom footer text
    const footerY = pad + 50 + photoH + 50;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#292524';
    ctx.font = 'bold 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(config.spotTitle, pad, footerY);

    ctx.fillStyle = '#57534e';
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(config.quote, pad, footerY + 45);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#a8a29e';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText(coordsText, width - pad, footerY + 10);
    ctx.fillText('HOLYSPOT ZERO-POST', width - pad, footerY + 45);

  } else if (config.template === 'y2k-cool') {
    // KPOP Y2K Cool Minimalist & Silver Magazine Style
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Outer cyber metallic hairline border
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Photo
    const pad = 50;
    const photoH = 1100;
    const photoW = width - pad * 2;
    ctx.save();
    drawCoverImage(ctx, userImg, pad, 120, photoW, photoH);
    ctx.restore();

    // Top Y2K editorial header
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SPECIAL ARCHIVE // SEOUL TRACK', pad, 75);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('BUNNIES CLUB 01', width - pad, 75);

    // Barcode on photo bottom left
    drawBarcode(ctx, pad + 30, 120 + photoH - 70, 220, 45);

    // Bottom magazine typography
    const footerY = 120 + photoH + 60;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(config.spotTitle, pad, footerY);

    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(config.tribeName.toUpperCase(), pad, footerY + 42);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`“${config.quote}”`, pad, footerY + 85);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#71717a';
    ctx.font = '22px "Courier New", monospace';
    ctx.fillText(coordsText, width - pad, footerY + 30);
    ctx.fillText(`VERIFIED LBS // ${now}`, width - pad, footerY + 65);

  } else {
    // Cinematic Letterbox 16:9 in 3:4 card
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Center photo
    const photoH = 960;
    const photoY = 280;
    drawCoverImage(ctx, userImg, 0, photoY, width, photoH);

    // Top black bar branding
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px "Cormorant Garamond", serif';
    ctx.textAlign = 'center';
    ctx.fillText('C I N E M A T I C   P I L G R I M A G E', width / 2, 140);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${config.tribeName} · ${config.spotTitle}`, width / 2, 185);

    // Movie dual-language subtitle in lower section of photo
    const subY = photoY + photoH - 80;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(80, subY - 45, width - 160, 90);

    ctx.fillStyle = '#fffae0';
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.quote, width / 2, subY);

    // Bottom credits
    const footerY = photoY + photoH + 80;
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(config.spotCity, width / 2, footerY);

    ctx.fillStyle = '#64748b';
    ctx.font = '22px "Courier New", monospace';
    ctx.fillText(`${coordsText}  |  ${now}  |  DIMENSION HOLYSPOT`, width / 2, footerY + 45);
  }

  return canvas.toDataURL('image/png', 0.95);
}

// Utility: Draw image cover (crop to fill)
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(x - 8, y - 6, w + 16, h + 24);
  ctx.fillStyle = '#ffffff';

  let curX = x;
  const pattern = [2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 3, 2, 1, 4, 2, 1, 3, 2];
  for (let i = 0; i < pattern.length && curX < x + w; i++) {
    const barW = pattern[i % pattern.length];
    if (i % 2 === 0) {
      ctx.fillRect(curX, y, barW, h);
    }
    curX += barW + 2;
  }

  ctx.font = '12px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HLSP-2026-X99', x, y + h + 14);
}
