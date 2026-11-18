'use client';

export async function createKeepsakePoster(note, qrCodeDataUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      const width = 1200;
      const height = 1600;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not initialize canvas context'));

      // 1. Background Parchment / Soft Rosy Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#fdfbf9');
      bgGrad.addColorStop(0.5, '#fff7f9');
      bgGrad.addColorStop(1, '#fcf5ee');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle warm texture spots / glow
      const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 700);
      radialGlow.addColorStop(0, 'rgba(251, 207, 232, 0.35)');
      radialGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Double Ornamental Borders
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 28);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(190, 24, 93, 0.3)';
      ctx.lineWidth = 1.5;
      drawRoundedRect(ctx, 52, 52, width - 104, height - 104, 22);
      ctx.stroke();

      // Corner flourishes
      drawCornerFlourish(ctx, 60, 60);
      drawCornerFlourish(ctx, width - 60, 60, true, false);
      drawCornerFlourish(ctx, 60, height - 60, false, true);
      drawCornerFlourish(ctx, width - 60, height - 60, true, true);

      // 3. Top Header / Brand Emblem
      ctx.textAlign = 'center';
      ctx.fillStyle = '#be185d';
      ctx.font = 'bold 20px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('♥  LOVELYCRAFTS KEEPSAKE  ♥', width / 2, 110);

      ctx.fillStyle = '#9ca3af';
      ctx.font = 'italic 16px Georgia, serif';
      ctx.fillText('A permanent memory preserved in time', width / 2, 138);

      // 4. Recipient Name Calligraphy
      ctx.fillStyle = '#881337';
      ctx.font = 'bold 56px Georgia, serif';
      const name = note.recipient_name || 'Someone Special';
      ctx.fillText(`Dedicated to ${name}`, width / 2, 210);

      // Decorative divider
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 160, 235);
      ctx.lineTo(width / 2 + 160, 235);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = '22px Arial, sans-serif';
      ctx.fillText('❦', width / 2, 242);

      let currentY = 280;

      // 5. Photos Section (Polaroids if available)
      const images = Array.isArray(note.image_urls) ? note.image_urls.filter(Boolean) : [];
      if (images.length > 0) {
        const photoToDraw = images[0];
        try {
          const img = await loadImage(photoToDraw);
          const polaroidW = 340;
          const polaroidH = 380;
          const photoW = 300;
          const photoH = 280;
          const pX = (width - polaroidW) / 2;
          const pY = currentY;

          // Polaroid card shadow & body
          ctx.save();
          ctx.shadowColor = 'rgba(136, 19, 55, 0.15)';
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 12;
          ctx.fillStyle = '#ffffff';
          drawRoundedRect(ctx, pX, pY, polaroidW, polaroidH, 12);
          ctx.fill();
          ctx.strokeStyle = '#f3f4f6';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // Image itself
          ctx.drawImage(img, pX + 20, pY + 20, photoW, photoH);

          // Polaroid caption
          ctx.fillStyle = '#6b7280';
          ctx.font = 'italic 16px Georgia, serif';
          ctx.fillText('Our cherished memory ♥', width / 2, pY + 345);

          currentY += polaroidH + 40;
        } catch (e) {
          console.warn('Could not load keepsake photo for canvas', e);
        }
      }

      // 6. Letter / Message Box
      const message = note.custom_message || 'You mean the absolute world to me. Thank you for every smile, every laugh, and every precious moment together.';
      const boxW = 860;
      const boxX = (width - boxW) / 2;
      
      // Soft message parchment box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      drawRoundedRect(ctx, boxX, currentY, boxW, 400, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Message quotation marks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
      ctx.font = 'bold 90px Georgia, serif';
      ctx.fillText('“', boxX + 50, currentY + 70);

      // Render multi-line text
      ctx.fillStyle = '#374151';
      ctx.font = '22px Georgia, serif';
      ctx.textAlign = 'center';
      
      const lines = wrapText(ctx, message, boxW - 120);
      let textY = currentY + 80;
      lines.slice(0, 9).forEach((line) => {
        ctx.fillText(line, width / 2, textY);
        textY += 34;
      });

      // 7. Footer: Live Experience QR Code + Keepsake Seal
      const footerY = height - 260;

      // QR Code
      if (qrCodeDataUrl) {
        try {
          const qrImg = await loadImage(qrCodeDataUrl);
          const qrSize = 130;
          const qrX = width / 2 - qrSize / 2;
          
          // QR White background frame
          ctx.fillStyle = '#ffffff';
          drawRoundedRect(ctx, qrX - 10, footerY - 10, qrSize + 20, qrSize + 20, 14);
          ctx.fill();
          ctx.strokeStyle = '#fbcfe8';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.drawImage(qrImg, qrX, footerY, qrSize, qrSize);

          ctx.fillStyle = '#be185d';
          ctx.font = 'bold 13px Arial, sans-serif';
          ctx.letterSpacing = '1px';
          ctx.fillText('SCAN TO EXPERIENCE ONLINE', width / 2, footerY + qrSize + 28);
        } catch (e) {
          console.warn('Could not render QR code on keepsake', e);
        }
      }

      // Certificate bottom text
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('LOVELYCRAFTS.IN • FOREVER KEEPSAKE EDITION', width / 2, height - 76);

      ctx.fillStyle = '#b0b7c3';
      ctx.font = '12px Georgia, serif';
      ctx.letterSpacing = '0.5px';
      ctx.fillText("Created with love • lovelycrafts.in • India's Digital Gifting Platform", width / 2, height - 52);

      resolve(canvas.toDataURL('image/png', 1.0));
    } catch (err) {
      reject(err);
    }
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawCornerFlourish(ctx, x, y, flipX = false, flipY = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flipX) ctx.scale(-1, 1);
  if (flipY) ctx.scale(1, -1);
  
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 24);
  ctx.lineTo(0, 0);
  ctx.lineTo(24, 0);
  ctx.stroke();

  ctx.fillStyle = '#be185d';
  ctx.beginPath();
  ctx.arc(6, 6, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
