/**
 * Generates an academic result card on Canvas for WhatsApp / Social Sharing
 */
export async function generateResultCardCanvas(resultData) {
  const {
    programName,
    category,
    date,
    winners, // [ { position: '1st Place', name: 'Nihal Rahman', chestNo: 'C-101', teamName: 'Al-Bayan', teamColor: '#0E7C86', mark: 9.5, grade: 'A' }, ...]
    collegeName = "MAJLIS UMARIYYA WAFY COLLEGE",
    festName = "MUSF SUMMIT REGISTER"
  } = resultData;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');

  // Background Gradient: Deep Navy to Charcoal Slate
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#0F2A4A');
  bgGrad.addColorStop(0.5, '#1E3A5F');
  bgGrad.addColorStop(1, '#0B1522');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Frame Border
  ctx.strokeStyle = '#334E73';
  ctx.lineWidth = 8;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  ctx.strokeStyle = '#C9A227'; // Gold hairline
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

  // Institution Banner
  ctx.textAlign = 'center';
  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(collegeName, canvas.width / 2, 110);

  ctx.fillStyle = '#0E7C86';
  ctx.font = '600 24px sans-serif';
  ctx.fillText(festName, canvas.width / 2, 155);

  // Program Result Badge
  ctx.fillStyle = '#0E7C86';
  ctx.beginPath();
  ctx.roundRect(canvas.width / 2 - 160, 220, 320, 50, 10);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText("OFFICIAL RESULTS", canvas.width / 2, 253);

  // Program Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(programName, canvas.width / 2, 335);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 22px sans-serif';
  ctx.fillText(`Category: ${category || 'Academic'}  •  Date: ${date || '2026'}`, canvas.width / 2, 380);

  // Divider
  ctx.strokeStyle = '#334E73';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 415);
  ctx.lineTo(canvas.width - 100, 415);
  ctx.stroke();

  // Winners Cards
  let startY = 460;
  const cardHeight = 220;
  const cardGap = 35;
  const posBadges = ['#C9A227', '#94A3B8', '#B45309']; // Gold, Silver, Bronze

  winners.slice(0, 3).forEach((winner, idx) => {
    const y = startY + idx * (cardHeight + cardGap);

    // Card background
    ctx.fillStyle = '#132238';
    ctx.beginPath();
    ctx.roundRect(80, y, canvas.width - 160, cardHeight, 12);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#1E3A5F';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, y, canvas.width - 160, cardHeight);

    // House color stripe on left
    ctx.fillStyle = winner.teamColor || '#0E7C86';
    ctx.beginPath();
    ctx.roundRect(80, y, 16, cardHeight, [12, 0, 0, 12]);
    ctx.fill();

    // Position Circle
    ctx.fillStyle = posBadges[idx] || '#C9A227';
    ctx.beginPath();
    ctx.arc(160, y + cardHeight / 2, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F2A4A';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`${idx + 1}`, 160, y + cardHeight / 2 + 10);

    // Participant Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(winner.name || 'Participant', 240, y + 70);

    // Identity (Chest, Team)
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 24px sans-serif';
    ctx.fillText(`Chest: ${winner.chestNo || '-'}   •   House: `, 240, y + 120);

    ctx.fillStyle = winner.teamColor || '#38BDF8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(winner.teamName || '-', 480, y + 120);

    // Score box
    ctx.fillStyle = '#1E3A5F';
    ctx.beginPath();
    ctx.roundRect(canvas.width - 280, y + 50, 160, 75, 10);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${winner.mark ? Number(winner.mark).toFixed(1) : '-'}/10`, canvas.width - 200, y + 85);

    ctx.fillStyle = '#0E7C86';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`Grade: ${winner.grade || 'A'}`, canvas.width - 200, y + 112);
  });

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = '500 20px sans-serif';
  ctx.fillText("MUSF SUMMIT REGISTER • MAJLIS UMARIYYA WAFY COLLEGE", canvas.width / 2, canvas.height - 70);

  return canvas.toDataURL('image/png');
}

/**
 * Prepares WhatsApp text and opens sharing link
 */
export function shareResultOnWhatsApp(resultData) {
  const { programName, winners, collegeName = "Majlis Umariyya Wafy College" } = resultData;
  let text = `🏛️ *${collegeName}*\n`;
  text += `📊 *MUSF Summit Official Result Declared*\n\n`;
  text += `🎯 *Event:* ${programName}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;

  const medals = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'];
  winners.slice(0, 3).forEach((w, idx) => {
    text += `${medals[idx]}: *${w.name}* (Chest: ${w.chestNo})\n`;
    text += `   House: *${w.teamName}* | Marks: ${w.mark?.toFixed(1)}/10 (Grade: ${w.grade})\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `View full verified evaluations on the MUSF Summit Register portal.`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
