import { baseValues } from './data';
import type { SharedResult } from './resultLink';

export const resultImageColors = {
  light: { background: '#f6f1e7', paper: '#fffdf8', ink: '#2b2a27', muted: '#5e584d', accent: '#2f4a6d', line: '#ddd3c2', sticky: '#fff6d6' },
  dark: { background: '#1e1c19', paper: '#2a2723', ink: '#ede6d8', muted: '#b3aa99', accent: '#9db6d6', line: '#4a443c', sticky: '#3a3426' },
};
export type ImageTheme = keyof typeof resultImageColors;
const family = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';
const names = (ids: string[]) => ids.map(id => baseValues.find(value => value.id === id)!.word).join('、');

/** Draw only the public conclusion. The returned PNG is also the file used by system sharing. */
export async function createResultImage(result: SharedResult, theme: ImageTheme): Promise<File> {
  const rows = result.stated.map(ids => ({ ids, count: '' }));
  const chosen = result.chosen.map(row => ({ ids: row.ids, count: `${row.ids.length > 1 ? '各' : ''}選了 ${row.chosen} 次／共 ${row.directional} 題` }));
  const fixed = ['這一次，我的選擇。', '我最重視的', '第一幕的分類與排序', '我在情境中最常選的', '第二幕有偏向一邊的答案', '這次沒有偏向一邊的答案，所以沒有排名。', '我的自訂價值 · 不納入前三名', '這是我在假設情境下的自我回報，不是人格判定，也不代表實際行為。', '北極星 · 你重視什麼，會怎麼選？', 'northstarmetric.org'];
  const actualText = fixed.join('') + [...rows, ...chosen].map(row => names(row.ids) + row.count).join('') + result.custom.slice(0, 3).join('') + '並列第1234567890另有個自訂價值';
  // Waiting for page styles ensures the asynchronously loaded font stylesheet is registered.
  await new Promise<void>(resolve => { if (document.readyState === 'complete') resolve(); else window.addEventListener('load', () => resolve(), { once: true }); });
  await Promise.all([document.fonts.load(`400 28px ${family}`, actualText), document.fonts.load(`700 40px ${family}`, actualText)]);
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1350;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Canvas unavailable');
  const p = resultImageColors[theme];
  const rect = (x: number, y: number, width: number, height: number, color: string) => { c.fillStyle = color; c.fillRect(x, y, width, height); };
  const text = (value: string, x: number, y: number, size = 28, color = p.ink, bold = false) => { c.font = `${bold ? 700 : 400} ${size}px ${family}`; c.fillStyle = color; c.fillText(value, x, y); };
  const wrap = (value: string, x: number, y: number, width: number, size: number, color = p.ink, bold = false) => {
    c.font = `${bold ? 700 : 400} ${size}px ${family}`;
    const chars = [...value]; let line = '';
    for (let i = 0; i < chars.length; i++) {
      // Reserve room for punctuation following this character so it never starts a line.
      const next = chars[i + 1] && '、，。；：'.includes(chars[i + 1]) ? chars[i + 1] : '';
      if (line && c.measureText(line + chars[i] + next).width > width && !'、，。；：'.includes(chars[i])) { text(line, x, y, size, color, bold); y += size * 1.45; line = ''; }
      line += chars[i];
    }
    text(line, x, y, size, color, bold); return y;
  };
  rect(0, 0, 1080, 1350, p.background);
  for (let x = 24; x < 1080; x += 24) for (let y = 24; y < 1350; y += 24) rect(x, y, 2, 2, p.line);
  text(fixed[0], 64, 170, 60, p.ink, true);
  rect(54, 280, 472, 610, p.paper); rect(554, 280, 472, 610, p.paper);
  text(fixed[1], 84, 350, 38, p.ink, true); text(fixed[2], 84, 400, 28, p.muted);
  text(fixed[3], 584, 350, 34, p.ink, true); text(fixed[4], 584, 400, 28, p.muted);
  const column = (items: typeof rows, x: number, limit: number) => {
    let y = 460; let rank = 1; let shown = 0;
    for (const row of items) {
      if (shown >= limit) break;
      const ids = row.ids.slice(0, limit - shown); shown += ids.length;
      text(`${row.ids.length > 1 ? '並列' : ''}第 ${rank}`, x, y, 28, p.accent);
      y = wrap(names(ids), x, y + 46, 410, items === rows && row.ids.length > 3 ? 28 : 34, p.ink, true);
      if (row.count) { text(row.count, x, y + 42, 28, p.muted); y += 42; }
      y += 58; rank += row.ids.length;
    }
    const extra = items.reduce((sum, row) => sum + row.ids.length, 0) - shown;
    if (extra) text(`另有 ${extra} 個並列`, x, y, 28, p.accent);
  };
  column(rows, 84, 10); column(chosen, 584, 5);
  if (!chosen.length) wrap(fixed[5], 584, 480, 410, 32);
  if (result.custom.length) {
    const shown = result.custom.slice(0, 3);
    const lines = shown.length + (result.custom.length > 3 ? 1 : 0);
    rect(64, 920, 952, 66 + lines * 42, p.sticky);
    text(fixed[6], 88, 962, 28, p.muted);
    shown.forEach((word, index) => text(word, 88, 1006 + index * 42, 28));
    if (result.custom.length > 3) text(`另有 ${result.custom.length - 3} 個自訂價值`, 88, 1006 + 3 * 42, 28, p.accent);
  }
  wrap(fixed[7], 64, 1196, 952, 28, p.muted);
  rect(64, 1260, 952, 2, p.line);
  text(fixed[8], 64, 1310, 28); text(fixed[9], 730, 1310, 28, p.accent);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG export failed')), 'image/png'));
  return new File([blob], 'northstar-result.png', { type: 'image/png' });
}
