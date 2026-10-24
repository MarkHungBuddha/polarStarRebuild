import { expect, test } from './support/fixtures';
import { resultImageColors } from '../src/resultImage';

test('結果圖所有文字色與使用的背景對比至少 4.5:1', () => {
  const luminance = (hex: string) => {
    const values = hex.slice(1).match(/../g)!.map(part => parseInt(part, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
  };
  for (const palette of Object.values(resultImageColors)) for (const foreground of [palette.ink, palette.muted, palette.accent]) for (const background of [palette.background, palette.paper, palette.sticky]) {
    const a = luminance(foreground); const b = luminance(background);
    expect((Math.max(a, b) + .05) / (Math.min(a, b) + .05), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
  }
});
