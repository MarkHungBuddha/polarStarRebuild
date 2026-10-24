import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';

// The inline script in index.html repeats the storage key and both rules below, because it must run before
// any module loads to avoid a flash of the wrong theme. Change them together.
const themeStorageKey = 'northstar-theme';
/** A saved preference other than light or dark means following the system. */
const parseTheme = (saved: string | null | undefined): Theme => saved === 'light' || saved === 'dark' ? saved : 'system';
const resolveTheme = (theme: Theme, systemDark: boolean) => theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

/** Sun / moon switch. Until the reader picks one, it follows the system and shows the system's theme. */
export function ThemeControl() {
  // The inline script already read storage and left the preference on <html>.
  const [theme, setTheme] = useState<Theme>(() => parseTheme(document.documentElement.dataset.themePreference));
  const [systemDark, setSystemDark] = useState(() => systemQuery().matches);
  const [notice, setNotice] = useState('');
  const shown = resolveTheme(theme, systemDark);

  useEffect(() => {
    const system = systemQuery();
    const update = () => setSystemDark(system.matches);
    system.addEventListener('change', update);
    return () => system.removeEventListener('change', update);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = shown; }, [shown]);

  const choose = (preference: 'light' | 'dark') => {
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
    <div className="theme-switch" role="group" aria-label="顯示主題">
      <button type="button" aria-label="淺色" aria-pressed={shown === 'light'} onClick={() => choose('light')}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></svg>
      </button>
      <button type="button" aria-label="深色" aria-pressed={shown === 'dark'} onClick={() => choose('dark')}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
      </button>
    </div>
    {notice && <p role="status">{notice}</p>}
  </div>;
}
