import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';

export function ThemeControl() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = document.documentElement.dataset.themePreference;
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme = theme === 'system' ? (system.matches ? 'dark' : 'light') : theme;
    };
    apply();
    system.addEventListener('change', apply);
    return () => system.removeEventListener('change', apply);
  }, [theme]);

  const choose = (preference: Theme) => {
    try {
      localStorage.setItem('northstar-theme', preference);
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
