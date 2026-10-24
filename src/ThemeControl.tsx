import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';

// The inline script in index.html repeats the storage key and both rules below, because it must run before
// any module loads to avoid a flash of the wrong theme. Change them together.
const themeStorageKey = 'northstar-theme';
/** A saved preference other than light or dark means following the system. */
const parseTheme = (saved: string | null | undefined): Theme => saved === 'light' || saved === 'dark' ? saved : 'system';
const resolveTheme = (theme: Theme, systemDark: boolean) => theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

export function ThemeControl() {
  // The inline script already read storage and left the preference on <html>.
  const [theme, setTheme] = useState<Theme>(() => parseTheme(document.documentElement.dataset.themePreference));
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(theme, system.matches);
    };
    apply();
    system.addEventListener('change', apply);
    return () => system.removeEventListener('change', apply);
  }, [theme]);

  const choose = (preference: Theme) => {
    try {
      localStorage.setItem(themeStorageKey, preference);
      setTheme(preference);
      setNotice('');
    } catch {
      setTheme('system');
      setNotice('無法儲存主題偏好，已改為跟隨系統。你可以繼續作答。');
    }
  };

  return <div className="theme-control">
    <label>顯示主題<select value={theme} onChange={event => choose(event.target.value as Theme)}>
      <option value="system">跟隨系統</option><option value="light">淺色</option><option value="dark">深色</option>
    </select></label>
    {notice && <p role="status">{notice}</p>}
  </div>;
}
