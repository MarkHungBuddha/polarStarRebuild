import { useState } from 'react';
import { baseValues } from './data';
import type { BattlePair, Category, Screen, ValueItem } from './types';

const categoryLabels: Record<Category, string> = {
  core: '這就是我',
  good: '還不錯',
  low: '不太在乎',
};

const screenStep: Partial<Record<Screen, number>> = {
  classify: 1,
  rank: 2,
  battle: 3,
  result: 4,
  reflect: 4,
};

function buildPairs(players: string[]) {
  const pairs: BattlePair[] = [];
  for (let i = 0; i < players.length; i += 1) {
    for (let j = i + 1; j < players.length; j += 1) {
      pairs.push([players[i], players[j]]);
    }
  }

  for (let i = pairs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs;
}

function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [values, setValues] = useState<ValueItem[]>(baseValues);
  const [categories, setCategories] = useState<Partial<Record<string, Category>>>({});
  const [customWord, setCustomWord] = useState('');
  const [rankedIds, setRankedIds] = useState<string[]>([]);
  const [battlePlayers, setBattlePlayers] = useState<string[]>([]);
  const [pairs, setPairs] = useState<BattlePair[]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [resultIds, setResultIds] = useState<string[]>([]);
  const [notice, setNotice] = useState('');

  const valueById = new Map(values.map((item) => [item.id, item]));
  const progress = screen === 'intro' ? 0 : screen === 'reflect' ? 100 : (screenStep[screen] ?? 1) * 22.5;
  const currentPair = pairs[pairIndex];

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  }

  function restart() {
    setScreen('intro');
    setValues(baseValues);
    setCategories({});
    setCustomWord('');
    setRankedIds([]);
    setBattlePlayers([]);
    setPairs([]);
    setPairIndex(0);
    setScores({});
    setResultIds([]);
    setNotice('');
    window.scrollTo({ top: 0 });
  }

  function go(next: Screen) {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function assignCategory(id: string, category: Category) {
    setCategories((current) => ({ ...current, [id]: category }));
  }

  function addCustomValue() {
    const word = customWord.trim().slice(0, 6);
    if (!word) return;
    if (values.some((item) => item.word === word)) {
      showNotice('這個詞已經在清單裡了');
      return;
    }

    const id = `custom-${Date.now()}`;
    setValues((current) => [
      ...current,
      { id, word, description: `這是我最在意的：${word}`, dimension: 'custom' },
    ]);
    setCustomWord('');
    showNotice(`已新增「${word}」`);
  }

  function startRanking() {
    const coreIds = values.filter((item) => categories[item.id] === 'core').map((item) => item.id);
    if (coreIds.length === 0) {
      showNotice('請至少選一個「這就是我」的價值觀');
      return;
    }

    setRankedIds(coreIds);
    go('rank');
  }

  function moveRank(id: string, direction: -1 | 1) {
    setRankedIds((current) => {
      const from = current.indexOf(id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  function startBattle() {
    const players = rankedIds.slice(0, 6);
    if (players.length === 1) {
      setResultIds(players);
      go('result');
      return;
    }

    setBattlePlayers(players);
    setScores(Object.fromEntries(players.map((id) => [id, 0])));
    setPairs(buildPairs(players));
    setPairIndex(0);
    go('battle');
  }

  function pickWinner(id: string) {
    const nextScores = { ...scores, [id]: (scores[id] ?? 0) + 1 };
    setScores(nextScores);

    const isLastPair = pairIndex >= pairs.length - 1;
    if (!isLastPair) {
      setPairIndex((current) => current + 1);
      return;
    }

    const ordered = [...battlePlayers].sort((a, b) => {
      const byScore = (nextScores[b] ?? 0) - (nextScores[a] ?? 0);
      if (byScore !== 0) return byScore;
      return rankedIds.indexOf(a) - rankedIds.indexOf(b);
    });
    setResultIds(ordered.slice(0, 3));
    go('result');
  }

  const groups = (['core', 'good', 'low'] as Category[]).map((category) => ({
    category,
    items: values.filter((item) => categories[item.id] === category),
  }));
  const unclassified = values.filter((item) => !categories[item.id]);
  const topResults = resultIds.map((id) => valueById.get(id)).filter(Boolean) as ValueItem[];

  return (
    <main className="app-shell">
      {screen !== 'intro' && (
        <div className="progress" aria-label="流程進度">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}

      {screen === 'intro' && (
        <section className="hero panel">
          <p className="kicker">Find Your North Star</p>
          <div className="star">✦</div>
          <h1>你真正在意的是什麼？</h1>
          <p className="lead">透過分類、排序與兩兩比較，整理出此刻最靠近你的核心價值觀。</p>
          <div className="steps">
            <span>01 分類 24 個價值觀詞彙</span>
            <span>02 排出重要順序</span>
            <span>03 兩兩比較驗證直覺</span>
            <span>04 產生北極星與反思問題</span>
          </div>
          <button className="primary" onClick={() => go('classify')}>開始探索</button>
        </section>
      )}

      {screen === 'classify' && (
        <section className="flow">
          <Header eyebrow="第一步 · 01 / 04" title="把這些詞分一分" description="憑第一直覺選擇分類，不用想太久。" />
          <div className="custom-row">
            <input
              value={customWord}
              maxLength={6}
              placeholder="新增自己的價值觀"
              onChange={(event) => setCustomWord(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && addCustomValue()}
            />
            <button onClick={addCustomValue}>新增</button>
          </div>
          <div className="value-grid">
            {values.map((item) => (
              <article className={`value-card ${categories[item.id] ?? ''}`} key={item.id}>
                <h3>{item.word}</h3>
                <p>{item.description}</p>
                <div className="choice-row" aria-label={`分類 ${item.word}`}>
                  {(['core', 'good', 'low'] as Category[]).map((category) => (
                    <button
                      className={categories[item.id] === category ? 'selected' : ''}
                      key={category}
                      onClick={() => assignCategory(item.id, category)}
                    >
                      {categoryLabels[category]}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <aside className="summary panel">
            {groups.map(({ category, items }) => (
              <div key={category}>
                <strong>{categoryLabels[category]}</strong>
                <span>{items.length}</span>
              </div>
            ))}
            <div>
              <strong>還沒分類</strong>
              <span>{unclassified.length}</span>
            </div>
          </aside>
          <div className="sticky-action">
            <button className="primary" onClick={startRanking}>下一步：排出順序</button>
          </div>
        </section>
      )}

      {screen === 'rank' && (
        <section className="flow">
          <Header eyebrow="第二步 · 02 / 04" title="排出你的順序" description="最重要的放最上面，系統會取前六個進入比較賽。" />
          <div className="rank-list">
            {rankedIds.map((id, index) => {
              const item = valueById.get(id)!;
              return (
                <article className="rank-item" key={id}>
                  <span className="rank-num">{index + 1}</span>
                  <div>
                    <h3>{item.word}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="rank-actions">
                    <button disabled={index === 0} onClick={() => moveRank(id, -1)}>上移</button>
                    <button disabled={index === rankedIds.length - 1} onClick={() => moveRank(id, 1)}>下移</button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="sticky-action">
            <button className="secondary" onClick={() => go('classify')}>返回分類</button>
            <button className="primary" onClick={startBattle}>開始比較賽</button>
          </div>
        </section>
      )}

      {screen === 'battle' && currentPair && (
        <section className="flow battle-screen">
          <Header eyebrow="第三步 · 03 / 04" title="選一個更重要的" description="每一局只需要選出此刻更靠近你的那個。" />
          <p className="round-label">第 {pairIndex + 1} 局 · 共 {pairs.length} 局</p>
          <div className="battle-pair">
            {currentPair.map((id) => {
              const item = valueById.get(id)!;
              return (
                <button className="battle-card" key={id} onClick={() => pickWinner(id)}>
                  <span>{scores[id] ?? 0} 分</span>
                  <strong>{item.word}</strong>
                  <small>{item.description}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {screen === 'result' && (
        <section className="flow">
          <Header eyebrow="第四步 · 04 / 04" title="你的北極星" description="這三個價值觀，是這次比較後浮現出的優先順序。" />
          <div className="result-list">
            {topResults.map((item, index) => (
              <article className={`result-card medal-${index + 1}`} key={item.id}>
                <span>第 {index + 1} 名</span>
                <h3>{item.word}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
          <div className="sticky-action">
            <button className="primary" onClick={() => go('reflect')}>最後一個問題</button>
          </div>
        </section>
      )}

      {screen === 'reflect' && (
        <section className="flow">
          <Header eyebrow="✦ 尋找你的北極星" title="一個值得想一想的問題" description="花一分鐘，認真想一想。" />
          <div className="reflect-card">
            <p>
              你最重視 {topResults.map((item) => `「${item.word}」`).join('、')}。
              <br />
              你現在的生活，給你這些了嗎？
            </p>
          </div>
          <div className="share-card">
            <span>你的核心價值觀</span>
            <div>
              {topResults.map((item) => <strong key={item.id}>{item.word}</strong>)}
            </div>
            <p>可以截圖保存，作為下一次做選擇時的提醒。</p>
          </div>
          <button className="text-button" onClick={restart}>重新測驗一次</button>
        </section>
      )}

      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}

function Header({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="section-header">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{description}</span>
    </header>
  );
}

export default App;
