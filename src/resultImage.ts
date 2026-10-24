import { coreValueWord } from './data';
import { withPositions, type SharedResult } from './resultLink';
import { chosenCountText } from './valueRanking';

export const resultImageColors = {
  light: { background: '#f6f1e7', paper: '#fffdf8', ink: '#2b2a27', muted: '#5e584d', accent: '#2f4a6d', line: '#ddd3c2', sticky: '#fff6d6' },
  dark: { background: '#1e1c19', paper: '#2a2723', ink: '#ede6d8', muted: '#b3aa99', accent: '#9db6d6', line: '#4a443c', sticky: '#3a3426' },
};
export type ImageTheme = keyof typeof resultImageColors;

/** The image lists at most this many custom values; the rest become「另有 N 個自訂價值」. */
export const imageCustomLimit = 3;

const family = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';
const names = (ids: readonly string[]) => ids.map(coreValueWord).join('、');

/** The image's fixed wording, in the first person (docs/result-share-spec.md「文案」). */
const imageText = {
  title: '這一次，我的選擇。',
  statedTitle: '我最重視的',
  statedCaption: '第一幕的分類與排序',
  chosenTitle: '我在情境中最常選的',
  chosenCaption: '第二幕有偏向一邊的答案',
  noChosen: '這次沒有偏向一邊的答案，所以沒有排名。',
  customTitle: '我的自訂價值 · 不納入前三名',
  limits: '這是我在假設情境下的自我回報，不是人格判定，也不代表實際行為。',
  tagline: '北極星 · 你重視什麼，會怎麼選？',
  site: 'northstarmetric.org',
};

/** One position as drawn: its label, the names shown (a long tie may be cut short), the chosen count, and whether the names use the smaller size. */
interface DrawnRow { label: string; names: string; count?: string; compact: boolean }
interface DrawnColumn { rows: DrawnRow[]; extra?: string }

/**
 * Lays out one column: positions until `limit` names are shown, then「另有 N 個並列」for the rest.
 * With `compactTies`, a position shared by more than three values uses the smaller name size.
 */
function layoutColumn(rows: readonly { ids: string[]; count?: string }[], limit: number, compactTies: boolean): DrawnColumn {
  const drawn: DrawnRow[] = [];
  let shown = 0;
  for (const row of withPositions(rows)) {
    if (shown >= limit) break;
    const ids = row.ids.slice(0, limit - shown);
    shown += ids.length;
    drawn.push({ label: `${row.ids.length > 1 ? '並列' : ''}第 ${row.position}`, names: names(ids), count: row.count, compact: compactTies && row.ids.length > 3 });
  }
  const extra = rows.reduce((sum, row) => sum + row.ids.length, 0) - shown;
  return { rows: drawn, extra: extra ? `另有 ${extra} 個並列` : undefined };
}

/** Draw only the public conclusion. The returned PNG is also the file used by system sharing. */
export async function createResultImage(result: SharedResult, theme: ImageTheme): Promise<File> {
  const statedColumn = layoutColumn(result.stated.map(ids => ({ ids })), 10, true);
  const chosenColumn = layoutColumn(result.chosen.map(row => ({ ids: row.ids, count: chosenCountText(row, row.ids.length > 1) })), 5, false);
  const customShown = result.custom.slice(0, imageCustomLimit);
  const customExtra = result.custom.length > imageCustomLimit ? `另有 ${result.custom.length - imageCustomLimit} 個自訂價值` : undefined;

  // Fonts are loaded for exactly the text drawn below.
  const drawnText = [
    imageText.title, imageText.statedTitle, imageText.statedCaption, imageText.chosenTitle, imageText.chosenCaption,
    ...[statedColumn, chosenColumn].flatMap(column => [...column.rows.flatMap(row => [row.label, row.names, row.count ?? '']), column.extra ?? '']),
    result.chosen.length ? '' : imageText.noChosen,
    result.custom.length ? imageText.customTitle : '', ...customShown, customExtra ?? '',
    imageText.limits, imageText.tagline, imageText.site,
  ].join('');
  // Waiting for page styles ensures the asynchronously loaded font stylesheet is registered.
  await new Promise<void>(resolve => { if (document.readyState === 'complete') resolve(); else window.addEventListener('load', () => resolve(), { once: true }); });
  await Promise.all([document.fonts.load(`400 28px ${family}`, drawnText), document.fonts.load(`700 40px ${family}`, drawnText)]);

  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1350;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  const colors = resultImageColors[theme];
  const rect = (x: number, y: number, width: number, height: number, color: string) => { context.fillStyle = color; context.fillRect(x, y, width, height); };
  const text = (value: string, x: number, y: number, size = 28, color = colors.ink, bold = false) => { context.font = `${bold ? 700 : 400} ${size}px ${family}`; context.fillStyle = color; context.fillText(value, x, y); };
  const wrap = (value: string, x: number, y: number, width: number, size: number, color = colors.ink, bold = false) => {
    context.font = `${bold ? 700 : 400} ${size}px ${family}`;
    const chars = [...value]; let line = '';
    for (let i = 0; i < chars.length; i++) {
      // Reserve room for punctuation following this character so it never starts a line.
      const next = chars[i + 1] && '、，。；：'.includes(chars[i + 1]) ? chars[i + 1] : '';
      if (line && context.measureText(line + chars[i] + next).width > width && !'、，。；：'.includes(chars[i])) { text(line, x, y, size, color, bold); y += size * 1.45; line = ''; }
      line += chars[i];
    }
    text(line, x, y, size, color, bold); return y;
  };
  const drawColumn = ({ rows, extra }: DrawnColumn, x: number) => {
    let y = 460;
    for (const row of rows) {
      text(row.label, x, y, 28, colors.accent);
      y = wrap(row.names, x, y + 46, 410, row.compact ? 28 : 34, colors.ink, true);
      if (row.count) { text(row.count, x, y + 42, 28, colors.muted); y += 42; }
      y += 58;
    }
    if (extra) text(extra, x, y, 28, colors.accent);
  };

  rect(0, 0, 1080, 1350, colors.background);
  for (let x = 24; x < 1080; x += 24) for (let y = 24; y < 1350; y += 24) rect(x, y, 2, 2, colors.line);
  text(imageText.title, 64, 170, 60, colors.ink, true);
  rect(54, 280, 472, 610, colors.paper); rect(554, 280, 472, 610, colors.paper);
  text(imageText.statedTitle, 84, 350, 38, colors.ink, true); text(imageText.statedCaption, 84, 400, 28, colors.muted);
  text(imageText.chosenTitle, 584, 350, 34, colors.ink, true); text(imageText.chosenCaption, 584, 400, 28, colors.muted);
  drawColumn(statedColumn, 84); drawColumn(chosenColumn, 584);
  if (!result.chosen.length) wrap(imageText.noChosen, 584, 480, 410, 32);
  if (result.custom.length) {
    const lines = customShown.length + (customExtra ? 1 : 0);
    rect(64, 920, 952, 66 + lines * 42, colors.sticky);
    text(imageText.customTitle, 88, 962, 28, colors.muted);
    customShown.forEach((word, index) => text(word, 88, 1006 + index * 42, 28));
    if (customExtra) text(customExtra, 88, 1006 + customShown.length * 42, 28, colors.accent);
  }
  wrap(imageText.limits, 64, 1196, 952, 28, colors.muted);
  rect(64, 1260, 952, 2, colors.line);
  text(imageText.tagline, 64, 1310, 28); text(imageText.site, 730, 1310, 28, colors.accent);
  // Encode synchronously: on Linux Chromium (CI) canvas.toBlob sometimes never called back, leaving the image preparing forever.
  const png = canvas.toDataURL('image/png');
  if (!png.startsWith('data:image/png;base64,')) throw new Error('PNG export failed');
  const bytes = Uint8Array.from(atob(png.slice(png.indexOf(',') + 1)), char => char.charCodeAt(0));
  return new File([bytes], 'northstar-result.png', { type: 'image/png' });
}
