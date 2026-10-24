import { useState } from 'react';
import { copyLink } from './clipboard';

/** The question-only share link: `link` is missing when the questions cannot be reproduced; `disabled` while the address's shared questions are unusable. */
export interface QuestionShare { link?: string; disabled: boolean }

/**
 * Page footer with the clear-local-records action and, when `questionShare` is given, the question-only share link.
 * Remount it (key) when the link changes. A result link's page leaves `questionShare` out.
 */
export function ShareFooter({ questionShare, onClearRecords }: { questionShare?: QuestionShare; onClearRecords: () => void }) {
  const [sharing, setSharing] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  const shareLink = questionShare?.link;
  return <footer><p className="footer-tagline">北極星 · 把答案留給自己，把選擇看清楚。</p>
    {questionShare && <button className="text-button" disabled={questionShare.disabled} onClick={() => setSharing(current => !current)}>分享這份題目</button>}
    {questionShare && sharing &&<section className="share-questions">{shareLink ? <>
      <p>只分享題目，不包含你的答案、排序或自訂價值。</p>
      <label>題目分享連結<input readOnly value={shareLink} onFocus={event => event.currentTarget.select()} /></label>
      <button className="secondary" onClick={() => copyLink(shareLink, '已複製題目連結。', setCopyNotice)}>複製題目連結</button>
      {copyNotice && <p role="status">{copyNotice}</p>}
    </> : <p>這份題目與目前版本不相容，無法產生相同題目的分享連結。請重新開始。</p>}</section>}
    <button className="text-button" onClick={onClearRecords}>清除本機作答紀錄</button><p>清除後，作答和看過的題目紀錄都會刪除；按「重新開始」則會保留看過的題目紀錄。</p>
  </footer>;
}
