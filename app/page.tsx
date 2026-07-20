"use client";

import { useMemo, useState } from "react";

type Word = {
  word: string;
  phonetic: string;
  meaning: string;
  note: string;
  example: string;
  translation: string;
};

const WORDS: Record<string, Word> = {
  serendipity: { word: "serendipity", phonetic: "/ˌserənˈdɪpəti/", meaning: "n. 意外发现美好事物的运气", note: "来自一个古老故事：三位王子总能偶然发现有趣的事物。", example: "Finding this tiny café was pure serendipity.", translation: "发现这家小咖啡馆，纯属美好的偶然。" },
  tucked: { word: "tucked away", phonetic: "/tʌkt əˈweɪ/", meaning: "phr. 藏在；坐落于隐蔽处", note: "常用来形容安静、隐蔽却迷人的地方。", example: "The cabin is tucked away in the mountains.", translation: "小屋隐于群山之中。" },
  lingered: { word: "linger", phonetic: "/ˈlɪŋɡər/", meaning: "v. 逗留；萦绕", note: "强调比预期停留得更久，既可以是人，也可以是气味或记忆。", example: "The smell of coffee lingered in the room.", translation: "咖啡香仍萦绕在房间里。" },
  quaint: { word: "quaint", phonetic: "/kweɪnt/", meaning: "adj. 古雅的；别致的", note: "带有老式但迷人的感觉，常形容街道、村庄或小店。", example: "We stayed in a quaint seaside village.", translation: "我们住在一个古雅的海边村庄。" },
};

const passages = [
  {
    eyebrow: "城市漫游 · B1",
    title: "A happy accident",
    time: "约 3 分钟",
    lines: [
      <>Last Saturday, I wandered through a <Mark id="quaint" /> neighborhood with no particular destination in mind.</>,
      <>A narrow lane led me to a bookshop <Mark id="tucked" /> behind a curtain of ivy.</>,
      <>Inside, the scent of old paper <Mark id="lingered" /> in the air. I found a handwritten note in a used novel—an unexpected moment of <Mark id="serendipity" />.</>,
    ],
  },
  {
    eyebrow: "旅行见闻 · B1",
    title: "The train to nowhere",
    time: "约 4 分钟",
    lines: [
      <>I boarded the wrong train and arrived at a <Mark id="quaint" /> station near the coast.</>,
      <>A bakery was <Mark id="tucked" /> between two weathered houses, and the smell of warm bread <Mark id="lingered" /> outside.</>,
      <>Missing my stop turned into a small act of <Mark id="serendipity" />.</>,
    ],
  },
];

function Mark({ id }: { id: string }) {
  const w = WORDS[id];
  return <button className="word" data-word={id}>{w.word}</button>;
}

export default function Home() {
  const [passage, setPassage] = useState(0);
  const [active, setActive] = useState("serendipity");
  const [saved, setSaved] = useState<string[]>(["quaint", "tucked"]);
  const [known, setKnown] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const current = WORDS[active];
  const progress = useMemo(() => Math.round((known.length / Object.keys(WORDS).length) * 100), [known]);

  function captureClick(e: React.MouseEvent<HTMLElement>) {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-word]");
    if (target?.dataset.word) setActive(target.dataset.word);
  }

  function toggleSaved() {
    setSaved((s) => s.includes(active) ? s.filter((x) => x !== active) : [...s, active]);
    setToast(saved.includes(active) ? "已移出生词本" : "已加入今日生词本");
    window.setTimeout(() => setToast(""), 1600);
  }

  function markKnown() {
    if (!known.includes(active)) setKnown((k) => [...k, active]);
    const ids = Object.keys(WORDS);
    setActive(ids[(ids.indexOf(active) + 1) % ids.length]);
  }

  return (
    <main onClick={captureClick}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="语境首页"><span>境</span> 语境</a>
        <nav aria-label="主导航"><a className="nav-active" href="#study">今日学习</a><a href="#words">生词本 <b>{saved.length}</b></a><a href="#progress">复习</a></nav>
        <button className="streak" aria-label="连续学习 12 天"><i>✦</i> 12 天</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">DAY 12 · 今日语境</p>
          <h1>不背孤零零的词，<br/><em>记住它出现的时刻。</em></h1>
          <p className="subtitle">在故事里遇见单词，在语境里真正理解。<br/>今天，只读一篇短文。</p>
        </div>
        <div className="today-card" id="progress">
          <div className="ring" style={{"--progress": `${progress}%`} as React.CSSProperties}><span>{known.length}<small>/ 4</small></span></div>
          <div><small>今日进度</small><strong>{known.length === 4 ? "太棒了，今日完成" : "再认识几个词"}</strong><p>连续学习 <b>12</b> 天 · 本周 <b>5</b> 篇</p></div>
        </div>
      </section>

      <section className="study-shell" id="study">
        <article className="reading">
          <div className="article-meta"><span>{passages[passage].eyebrow}</span><span>◷ {passages[passage].time}</span></div>
          <h2>{passages[passage].title}</h2>
          <div className="rule" />
          <div className="passage">{passages[passage].lines.map((line, i) => <p key={i}>{line}</p>)}</div>
          <p className="hint"><span>↖</span> 点击标记的单词，结合上下文猜猜它的意思</p>
          <div className="context-question">
            <span>语境小问</span>
            <p>Why was the discovery “serendipity”?</p>
            <details><summary>查看答案</summary><p>Because it was a pleasant and valuable discovery made entirely by chance.</p></details>
          </div>
        </article>

        <aside className="word-card" id="words">
          <div className="word-head"><span>语境释义</span><button onClick={(e) => {e.stopPropagation(); toggleSaved();}} aria-label="收藏单词">{saved.includes(active) ? "★" : "☆"}</button></div>
          <h3>{current.word}</h3>
          <p className="phonetic">{current.phonetic} <button onClick={(e) => { e.stopPropagation(); speechSynthesis.speak(new SpeechSynthesisUtterance(current.word)); }} aria-label="朗读单词">◖))</button></p>
          <div className="meaning"><strong>{current.meaning}</strong><p>{current.note}</p></div>
          <div className="example"><small>换个语境</small><p>{current.example}</p><span>{current.translation}</span></div>
          <div className="actions">
            <button className="ghost" onClick={(e) => {e.stopPropagation(); toggleSaved();}}>{saved.includes(active) ? "已收藏" : "加入生词本"}</button>
            <button className="primary" onClick={(e) => {e.stopPropagation(); markKnown();}}>我记住了 →</button>
          </div>
          <div className="dots" aria-label="单词进度">{Object.keys(WORDS).map((id) => <button key={id} className={id === active ? "active" : known.includes(id) ? "known" : ""} data-word={id} aria-label={`查看 ${WORDS[id].word}`} />)}</div>
        </aside>
      </section>

      <section className="continue">
        <div><span>明日语境</span><h2>在新的故事里，再遇见它们。</h2></div>
        <button onClick={() => { setPassage((p) => (p + 1) % passages.length); setActive("quaint"); document.querySelector("#study")?.scrollIntoView({behavior:"smooth"}); }}>换一篇读读 <span>→</span></button>
      </section>

      <footer><span>语境 · 让词汇有故事</span><span>今天已经走了 <b>1,248</b> 个词的路</span></footer>
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </main>
  );
}
