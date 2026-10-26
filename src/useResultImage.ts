import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { createResultImage, imageCustomLimit, type ImageTheme } from './resultImage';
import type { PreferenceSharedResult } from './resultLink';

export const imagePreparing = '正在準備結果圖……';
export const imageFailed = '結果圖沒有產生成功，請再試一次。結果連結仍然可以複製。';
type Generated = { key: string; file: File; url: string };

/** The image follows the site's current theme, which the theme switch keeps on the root element. */
const siteTheme = (): ImageTheme => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

/**
 * Own the generated URL and discard completions belonging to previous selections/themes.
 * A failure is reported in the share block's status; a later success silently clears the failure or preparing line it left there.
 */
export function useResultImage(result: PreferenceSharedResult | undefined, setStatus: Dispatch<SetStateAction<string>>) {
  const [theme, setTheme] = useState<ImageTheme>(siteTheme);
  const [attempt, setAttempt] = useState(0);
  const [generated, setGenerated] = useState<Generated>();
  const [failedKey, setFailedKey] = useState<string>();
  const serialized = JSON.stringify(result);
  const key = `${serialized}:${theme}:${attempt}`;
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(siteTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!serialized) return;
    let active = true; let url: string | undefined;
    createResultImage(JSON.parse(serialized) as PreferenceSharedResult, theme).then(file => {
      if (!active) return;
      url = URL.createObjectURL(file); setGenerated({ key, file, url });
      setStatus(current => current === imagePreparing || current === imageFailed ? '' : current);
    }).catch(() => { if (active) { setFailedKey(key); setStatus(imageFailed); } });
    return () => {
      active = false;
      // A later return to this same selection must wait for a fresh image, not show this revoked URL.
      if (url) { URL.revokeObjectURL(url); setGenerated(current => current?.url === url ? undefined : current); }
    };
  }, [serialized, theme, key, setStatus]);
  return { image: generated?.key === key ? generated : undefined, failed: failedKey === key, retry: () => setAttempt(value => value + 1) };
}

export function resultImageAlt(custom: string[]) {
  const prefix = '結果圖預覽：兩份前三名，內容同本頁上方。';
  const hidden = custom.length - imageCustomLimit;
  return prefix + (custom.length ? `另含 ${custom.length} 個自訂價值：${custom.slice(0, imageCustomLimit).join('、')}${hidden > 0 ? `，另有 ${hidden} 個` : ''}。` : '不含自訂價值。');
}
