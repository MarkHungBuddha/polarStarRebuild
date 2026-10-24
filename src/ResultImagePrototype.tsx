// Throwaway layout study: three 1080 × 1350 result images on ?prototype=image&variant=A-C.
import { useEffect, useRef, useState } from 'react';
import './result-image-prototype.css';

const names = { A: '左右對照筆記', B: '上下兩張便箋', C: '留白清單' };
type Variant = keyof typeof names;
const variants: Variant[] = ['A', 'B', 'C'];
const first = ['自主', '照顧身邊的人', '享受生活'];
const second = ['安全穩定', '照顧身邊的人', '普遍關懷'];
const ranks = ['第 1', '並列第 2', '並列第 2'];
const counts = ['選了 3 次／共 3 題', '選了 2 次／共 3 題', '選了 2 次／共 3 題'];
// Edge-case data for layout A (#30): ties capped at MAX_NAMES, empty second act, up to MAX_CUSTOMS custom values.
type Group = { rank: string; words: string[]; count: string };
type Case = { label: string; second: Group[]; customs: { word: string; meta: string }[] };
const MAX_NAMES = 5; const MAX_CUSTOMS = 3;
const oneCustom = [{ word: '保有獨處的時間', meta: '這就是我 · 位置 4' }];
const cases: Record<string, Case> = {
  normal: { label: '一般', customs: oneCustom, second: [{ rank: '第 1', words: ['安全穩定'], count: '選了 3 次／共 3 題' }, { rank: '並列第 2', words: ['照顧身邊的人', '普遍關懷'], count: '各選了 2 次／共 3 題' }] },
  ties: { label: '第二名七個並列', customs: oneCustom, second: [{ rank: '第 1', words: ['安全穩定'], count: '選了 3 次／共 3 題' }, { rank: '並列第 2', words: ['照顧身邊的人', '普遍關懷', '成就', '享受生活', '自主', '傳承', '探索刺激'], count: '各選了 1 次／共 3 題' }] },
  allTied: { label: '十個全部並列', customs: oneCustom, second: [{ rank: '並列第 1', words: ['自主', '探索刺激', '享受生活', '成就', '主導權', '安全穩定', '遵守規範', '傳承', '照顧身邊的人', '普遍關懷'], count: '各選了 1 次／共 3 題' }] },
  few: { label: '第二幕只有一個', customs: oneCustom, second: [{ rank: '第 1', words: ['安全穩定'], count: '選了 1 次／共 3 題' }] },
  empty: { label: '第二幕沒有結果', customs: oneCustom, second: [] },
  customs: { label: '四個長自訂價值', second: [{ rank: '第 1', words: ['安全穩定'], count: '選了 3 次／共 3 題' }, { rank: '並列第 2', words: ['照顧身邊的人', '普遍關懷'], count: '各選了 2 次／共 3 題' }], customs: [
    { word: '每天留一段完全屬於自己的安靜時間不被任何人打', meta: '這就是我 · 位置 4' },
    { word: '和家人一起吃晚餐並且好好聊聊這一天發生的事情', meta: '這就是我 · 位置 5' },
    { word: '持續學習新東西讓自己每年都比去年多懂一點點', meta: '還不錯 · 位置 2' },
    { word: '身體健康', meta: '還不錯 · 位置 6' }] },
};
type CaseKey = keyof typeof cases;
const sampleText = '北極星這一次我的選擇我最重視的情境中最常選的第一幕分類與排序第二幕有偏向一邊的答案自主照顧身邊的人享受生活安全穩定普遍關懷並列第123選了次共題自訂價值保有獨處的時間這就是我位置不納入前三名分享者本次自我回報不是人格判定也不代表實際行為每個價值只出現在少數幾題改一題就可能換名次未偏向一邊的答案不計入次數示範資料另有個所以沒有排名都' + JSON.stringify(cases);

function paint(canvas: HTMLCanvasElement, variant: Variant, custom: boolean, dark: boolean, data: Case = cases.normal) {
  const c = canvas.getContext('2d')!;
  const p = dark ? { bg:'#1e1c19', paper:'#2a2723', ink:'#ede6d8', muted:'#b3aa99', line:'#4a443c', accent:'#9db6d6', tape:'#795c53', sticky:'#3a3426' }
    : { bg:'#f6f1e7', paper:'#fffdf8', ink:'#2b2a27', muted:'#5e584d', line:'#ddd3c2', accent:'#2f4a6d', tape:'#edbcaf', sticky:'#fff6d6' };
  const rect = (x:number,y:number,w:number,h:number,color:string) => { c.fillStyle=color; c.fillRect(x,y,w,h); };
  const text = (s:string,x:number,y:number,size=30,hand=false,color=p.ink) => { c.fillStyle=color; c.font=`${hand ? 700 : 400} ${size}px "${hand ? 'LXGW WenKai TC' : 'Noto Sans TC'}"`; c.fillText(s,x,y); };
  const line = (x:number,y:number,w:number) => rect(x,y,w,2,p.line);
  const wrap = (s:string,x:number,y:number,w:number,size=30,hand=false) => {
    let row=''; let baseline=y;
    for (const char of s) { c.font=`${hand ? 700 : 400} ${size}px "${hand ? 'LXGW WenKai TC' : 'Noto Sans TC'}"`; if(c.measureText(row+char).width>w && row && !'、，。；：'.includes(char)) { text(row,x,baseline,size,hand); baseline+=size*1.45; row=''; } row+=char; }
    text(row,x,baseline,size,hand); return baseline;
  };
  const tape = (x:number,y:number) => { c.save(); c.translate(x,y); c.rotate(-.05); rect(-60,-12,120,26,p.tape); c.restore(); };
  rect(0,0,1080,1350,p.bg);
  c.fillStyle=p.line; for(let x=24;x<1080;x+=24)for(let y=24;y<1350;y+=24){c.beginPath();c.arc(x,y,1,0,Math.PI*2);c.fill();}
  text('✦ 北極星',64,86,34,true,p.accent); text('反思筆記 · 示範資料',700,84,24,false,p.muted);
  text('這一次，我的選擇。',64,184,64,true);
  text('兩份前三名，記下不同情境下的取捨。',68,238,28,false,p.muted);
  if(variant==='A') {
    const colH = custom ? 580 : 660; const step = custom ? 128 : 145;
    rect(54,300,472,colH,p.paper); rect(554,300,472,colH,p.paper); tape(290,300); tape(790,300);
    text('我最重視的',84,376,40,true); text('第一幕 · 分類與排序',84,424,24,false,p.muted);
    text('情境中最常選的',584,376,38,true); text('第二幕 · 有偏向一邊的答案',584,424,23,false,p.muted);
    first.forEach((word,i)=>{const y=490+i*step; text(`第 ${i+1}`,84,y,25,false,p.accent); wrap(word,84,y+52,400,40,true); line(84,y+88,410);});
    let y=490; let shown=0; const total=data.second.reduce((n,g)=>n+g.words.length,0);
    for (const g of data.second) { if(shown>=MAX_NAMES) break; const words=g.words.slice(0,MAX_NAMES-shown); shown+=words.length;
      text(g.rank,584,y,25,false,p.accent); const last=wrap(words.join('、'),584,y+48,410,words.length>1?34:39,true); text(g.count,584,last+42,24,false,p.muted); y=last+102; }
    if(total>shown) text(`另有 ${total-shown} 個並列`,584,y-30,26,true,p.accent);
    if(!data.second.length) { wrap('這次的答案都沒有偏向一邊，所以沒有排名。',584,500,400,30,true); }
  } else if(variant==='B') {
    rect(64,300,952,280,p.paper); tape(540,300); text('01',92,358,32,true,p.accent); text('我最重視的',170,360,40,true);
    first.forEach((word,i)=>{const x=100+i*305;text(`第 ${i+1}`,x,426,24,false,p.accent);wrap(word,x,478,270,38,true);});
    rect(64,624,952,336,p.sticky); tape(540,624); text('02',92,686,32,true,p.accent); text('情境中最常選的',170,686,40,true);
    second.forEach((word,i)=>{const x=100+i*305;text(ranks[i],x,752,24,false,p.accent);wrap(word,x,804,270,38,true);text(counts[i],x,902,23,false,p.muted);});
  } else {
    rect(54,286,972,684,p.paper); rect(54,286,10,684,p.accent);
    text('我最重視的',92,350,38,true); text('第一幕',840,350,24,false,p.muted);
    first.forEach((word,i)=>{const y=410+i*64;text(`0${i+1}`,96,y,28,false,p.accent);text(word,190,y,38,true);line(92,y+20,890);});
    text('情境中最常選的',92,658,38,true); text('第二幕',840,658,24,false,p.muted);
    second.forEach((word,i)=>{const y=724+i*90;text(ranks[i],92,y,25,false,p.accent);text(word,260,y,36,true);text(counts[i],650,y,24,false,p.muted);line(92,y+32,890);});
  }
  if(custom && variant==='A') {
    const list=data.customs.slice(0,MAX_CUSTOMS); const extra=data.customs.length-list.length;
    rect(64,906,952,70+list.length*44+(extra?36:0),p.sticky); text('自訂價值 · 不納入前三名',88,942,25,false,p.muted);
    list.forEach((v,i)=>{const y=988+i*44; text(v.word,88,y,28,true); c.textAlign='right'; text(v.meta,992,y,22,false,p.muted); c.textAlign='left';});
    if(extra) text(`另有 ${extra} 個自訂價值`,88,988+list.length*44,24,false,p.accent);
  }
  else if(custom) {rect(64,1000,952,130,p.sticky);text('自訂價值 · 不納入前三名',88,1044,25,false,p.muted);text('保有獨處的時間',88,1092,36,true);text('這就是我 · 位置 4',654,1090,24,false,p.muted);}
  else {text('分享者本次自我回報',68,1060,30,true,p.accent);text('不是人格判定，也不代表實際行為。',68,1105,27,false,p.muted);}
  if(custom) text('本次自我回報，不是人格判定，也不代表實際行為。',68,1178,25,false,p.muted);
  else text('每個價值只出現在少數幾題，改一題就可能換名次。',68,1178,25,false,p.muted);
  text(custom ? '少數幾題就可能改變名次；未偏向一邊的答案不計次。' : '未偏向一邊的答案不計入次數。',68,1220,24,false,p.muted);
  line(64,1260,952);text('北極星 · 價值反思',64,1310,26,true);text('northstarmetric.org',730,1310,25,false,p.accent);
}

export function ResultImagePrototype() {
  const [variant,setVariant]=useState<Variant>(()=>variants.find(v=>v===new URLSearchParams(location.search).get('variant'))??'A');
  const [custom,setCustom]=useState(false); const [dark,setDark]=useState(false); const [ready,setReady]=useState(false);
  const [dataCase,setDataCase]=useState<CaseKey>(()=>{const k=new URLSearchParams(location.search).get('case');return k&&k in cases?k:'normal';});
  const canvas=useRef<HTMLCanvasElement>(null);
  const change=(v:Variant)=>{setVariant(v);const url=new URL(location.href);url.searchParams.set('variant',v);history.replaceState(null,'',url);};
  useEffect(()=>{let active=true; Promise.all([document.fonts.load('700 40px "LXGW WenKai TC"',sampleText),document.fonts.load('400 30px "Noto Sans TC"',sampleText)]).then(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
  useEffect(()=>{if(ready&&canvas.current)paint(canvas.current,variant,custom,dark,cases[dataCase]);},[ready,variant,custom,dark,dataCase]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement).closest('input,textarea,select,button,[contenteditable]'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(variants[(variants.indexOf(variant)+(e.key==='ArrowLeft'?2:1))%3]);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[variant]);
  const download=()=>{const a=document.createElement('a');a.download=`northstar-prototype-${variant}-${dark?'dark':'light'}-${custom?'custom':'basic'}.png`;a.href=canvas.current!.toDataURL('image/png');a.click();};
  return <main className="image-study"><header><a href="?prototype=share&variant=A">← 結果頁公開範圍原型</a><h1>結果圖 · 三款版面比較</h1><p>同一份虛構示範結論，包含並列第二名；原型尚未接入正式作答。</p></header>
    <section className="image-controls"><label><input type="checkbox" checked={custom} onChange={e=>setCustom(e.target.checked)}/>包含自訂價值</label><label><input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)}/>網站目前是深色主題</label>{variant==='A'&&<label>資料案例 <select value={dataCase} onChange={e=>setDataCase(e.target.value)}>{Object.entries(cases).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label>}<button onClick={download} disabled={!ready}>下載這款圖片</button></section>
    <p role="status">{ready?`${variant} · ${names[variant]}｜1080 × 1350｜${dark?'深色':'淺色'}｜${custom?'含自訂價值':'不含自訂價值'}`:'正在載入圖片使用的字型…'}</p>
    <canvas ref={canvas} width={1080} height={1350} role="img" aria-label={`${names[variant]}。第一幕：自主、照顧身邊的人、享受生活。第二幕：安全穩定第1，選3次共3題；照顧身邊的人與普遍關懷並列第2，各選2次共3題。${custom?'自訂價值：保有獨處的時間，這就是我，位置4。':''}`}/>
    <nav className="image-switcher" aria-label="圖片版面"><button aria-label="上一款" onClick={()=>change(variants[(variants.indexOf(variant)+2)%3])}>←</button><select aria-label="選擇圖片版面" value={variant} onChange={e=>change(e.target.value as Variant)}>{variants.map(v=><option key={v} value={v}>{v} · {names[v]}</option>)}</select><button aria-label="下一款" onClick={()=>change(variants[(variants.indexOf(variant)+1)%3])}>→</button></nav>
  </main>;
}

