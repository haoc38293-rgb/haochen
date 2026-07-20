"use client";

import { useMemo, useState } from "react";

type Tier = "high" | "mid" | "low";
type Word = { word:string; phonetic:string; meaning:string; note:string; example:string; translation:string; tier:Tier };

const TIERS: Record<Tier, { label:string; sub:string }> = {
  high: { label:"高频词", sub:"优先掌握" },
  mid: { label:"中频词", sub:"进阶积累" },
  low: { label:"低频词", sub:"拓展提升" },
};

const WORDS: Record<string, Word> = {
  achieve:{word:"achieve",phonetic:"/əˈtʃiːv/",meaning:"v. 实现；取得",note:"高考语境中常与 goal、success、dream 搭配。",example:"Small steps can help us achieve a difficult goal.",translation:"小小的步伐能帮助我们实现困难的目标。",tier:"high"},
  benefit:{word:"benefit",phonetic:"/ˈbenɪfɪt/",meaning:"n. 益处  v. 受益",note:"常见搭配：benefit from 从……中受益。",example:"Reading every day benefits both the mind and the heart.",translation:"每天阅读让思想和心灵都受益。",tier:"high"},
  consider:{word:"consider",phonetic:"/kənˈsɪdər/",meaning:"v. 考虑；认为",note:"consider doing 表示“考虑做某事”。",example:"She considered joining the school debate team.",translation:"她考虑加入学校辩论队。",tier:"high"},
  provide:{word:"provide",phonetic:"/prəˈvaɪd/",meaning:"v. 提供；供应",note:"provide sb. with sth. 或 provide sth. for sb.。",example:"The library provides students with a quiet place to study.",translation:"图书馆为学生提供安静的学习场所。",tier:"high"},
  adapt:{word:"adapt",phonetic:"/əˈdæpt/",meaning:"v. 适应；改编",note:"adapt to 意为“适应”，强调随环境改变。",example:"It took him a month to adapt to his new school.",translation:"他花了一个月适应新学校。",tier:"mid"},
  circumstance:{word:"circumstance",phonetic:"/ˈsɜːrkəmstæns/",meaning:"n. 情况；环境",note:"常用复数 under the circumstances，意为“在这种情况下”。",example:"Under the circumstances, waiting was the wisest choice.",translation:"在这种情况下，等待是最明智的选择。",tier:"mid"},
  demonstrate:{word:"demonstrate",phonetic:"/ˈdemənstreɪt/",meaning:"v. 证明；展示",note:"写作中可替换 show，使表达更正式。",example:"The experiment demonstrates how light affects plants.",translation:"这个实验证明了光如何影响植物。",tier:"mid"},
  encounter:{word:"encounter",phonetic:"/ɪnˈkaʊntər/",meaning:"v./n. 遇到；邂逅",note:"多指意外遇到问题、困难或某个人。",example:"We encountered several problems during the journey.",translation:"旅途中我们遇到了几个问题。",tier:"mid"},
  coherent:{word:"coherent",phonetic:"/koʊˈhɪrənt/",meaning:"adj. 连贯的；条理清楚的",note:"常形容 argument、speech、plan 等有清晰逻辑。",example:"Her ideas were clear and formed a coherent argument.",translation:"她的想法清晰，构成了连贯的论证。",tier:"low"},
  intricate:{word:"intricate",phonetic:"/ˈɪntrɪkət/",meaning:"adj. 错综复杂的；精细的",note:"强调由许多细小部分构成，理解或制作不容易。",example:"The artist drew an intricate pattern on the wall.",translation:"艺术家在墙上画了一个精细复杂的图案。",tier:"low"},
  reluctant:{word:"reluctant",phonetic:"/rɪˈlʌktənt/",meaning:"adj. 不情愿的；勉强的",note:"be reluctant to do 表示“不愿意做某事”。",example:"He was reluctant to speak before the large audience.",translation:"他不愿在众多观众面前发言。",tier:"low"},
  subtle:{word:"subtle",phonetic:"/ˈsʌtəl/",meaning:"adj. 微妙的；不易察觉的",note:"字母 b 不发音，常形容细微却重要的差别。",example:"There was a subtle change in the way she smiled.",translation:"她微笑的方式发生了微妙的变化。",tier:"low"},
};

const ORDER = Object.keys(WORDS);
const TIER_IDS: Record<Tier,string[]> = { high:ORDER.slice(0,4), mid:ORDER.slice(4,8), low:ORDER.slice(8,12) };
const PASSAGES: Record<Tier,{eyebrow:string;title:string;lines:React.ReactNode[];question:string;answer:string}> = {
  high:{eyebrow:"高中闪过3500 · 高频阶段",title:"One step at a time",lines:[<>At the start of the term, Mia hoped to <Mark id="achieve" /> a better result in English.</>,<>Her teacher asked her to <Mark id="consider" /> reading for twenty minutes each day and <Mark id="provide" /> herself with a quiet place to focus.</>,<>Soon, she began to <Mark id="benefit" /> from this small but steady habit.</>],question:"What helped Mia make progress?",answer:"A simple daily reading habit and a quiet place to focus helped her."},
  mid:{eyebrow:"高中闪过3500 · 中频阶段",title:"A new environment",lines:[<>When Leo moved to a new city, he needed time to <Mark id="adapt" /> to his surroundings.</>,<>He would often <Mark id="encounter" /> unfamiliar customs, but each experience helped him understand the local culture.</>,<>Even under difficult <Mark id="circumstance" />, his actions <Mark id="demonstrate" /> patience and curiosity.</>],question:"How did Leo respond to unfamiliar customs?",answer:"He stayed patient and curious, using each encounter to learn."},
  low:{eyebrow:"高中闪过3500 · 低频阶段",title:"The hidden message",lines:[<>The old letter contained an <Mark id="intricate" /> drawing and a <Mark id="subtle" /> change in handwriting.</>,<>At first, Nora was <Mark id="reluctant" /> to share her theory, but she finally offered a <Mark id="coherent" /> explanation.</>],question:"Why did the letter seem unusual?",answer:"Its detailed drawing and subtle handwriting change suggested a hidden message."},
};

function Mark({id}:{id:string}){ return <button className="word" data-word={id}>{WORDS[id].word}</button>; }

export default function Home(){
  const [tier,setTier]=useState<Tier>("high");
  const [active,setActive]=useState("achieve");
  const [saved,setSaved]=useState<string[]>([]);
  const [known,setKnown]=useState<string[]>([]);
  const [toast,setToast]=useState("");
  const current=WORDS[active];
  const passage=PASSAGES[tier];
  const tierKnown=TIER_IDS[tier].filter(id=>known.includes(id)).length;
  const progress=useMemo(()=>Math.round(known.length/ORDER.length*100),[known]);

  function chooseTier(next:Tier){ setTier(next); setActive(TIER_IDS[next].find(id=>!known.includes(id))||TIER_IDS[next][0]); }
  function capture(e:React.MouseEvent<HTMLElement>){ const el=(e.target as HTMLElement).closest<HTMLButtonElement>("[data-word]"); if(el?.dataset.word)setActive(el.dataset.word); }
  function toggleSaved(){ setSaved(s=>s.includes(active)?s.filter(x=>x!==active):[...s,active]); setToast(saved.includes(active)?"已移出生词本":"已加入生词本"); setTimeout(()=>setToast(""),1500); }
  function playRecording(){
    const audio=new Audio(`/audio/${active}.mp3`);
    audio.play().catch(()=>{ setToast("点按重试真人发音"); setTimeout(()=>setToast(""),1500); });
  }
  function markKnown(){
    const updated=known.includes(active)?known:[...known,active]; setKnown(updated);
    const i=ORDER.indexOf(active); const next=ORDER[(i+1)%ORDER.length]; setActive(next);
    if(WORDS[next].tier!==tier) setTier(WORDS[next].tier);
  }

  return <main onClick={capture}>
    <header className="topbar"><a className="brand" href="#top"><span>境</span> 语境</a><nav><a className="nav-active" href="#study">今日学习</a><a href="#words">生词本 <b>{saved.length}</b></a><a href="#roadmap">词频路径</a></nav><button className="streak"><i>✦</i> 12 天</button></header>
    <section className="hero" id="top"><div className="hero-copy"><p className="kicker">高中闪过 3500 · 分频语境记忆</p><h1>先抓高频，再向深处。<br/><em>每个词，都在语境里记住。</em></h1><p className="subtitle">按高频 → 中频 → 低频依次学习，<br/>把最值得掌握的词放在最前面。</p></div><div className="today-card"><div className="ring" style={{"--progress":`${progress}%`} as React.CSSProperties}><span>{known.length}<small>/ 12</small></span></div><div><small>当前阶段</small><strong>{TIERS[tier].label} · {tierKnown}/4</strong><p>总进度 <b>{progress}%</b> · 按词频顺序推进</p></div></div></section>
    <section className="roadmap" id="roadmap">{(["high","mid","low"] as Tier[]).map((id,index)=><button key={id} className={`${tier===id?"active":""} ${TIER_IDS[id].every(w=>known.includes(w))?"done":""}`} onClick={e=>{e.stopPropagation();chooseTier(id)}}><span>{index+1}</span><div><strong>{TIERS[id].label}</strong><small>{TIERS[id].sub} · {TIER_IDS[id].filter(w=>known.includes(w)).length}/4</small></div>{index<2&&<i>→</i>}</button>)}</section>
    <section className="study-shell" id="study"><article className="reading"><div className="article-meta"><span>{passage.eyebrow}</span><span>◷ 约 3 分钟</span></div><h2>{passage.title}</h2><div className="rule"/><div className="passage">{passage.lines.map((line,i)=><p key={i}>{line}</p>)}</div><p className="hint"><span>↖</span> 点击标记的单词，先结合上下文猜意思</p><div className="context-question"><span>语境小问</span><p>{passage.question}</p><details><summary>查看答案</summary><p>{passage.answer}</p></details></div></article>
    <aside className="word-card" id="words"><div className="word-head"><span>{TIERS[current.tier].label} · {ORDER.indexOf(active)+1}/12</span><button onClick={e=>{e.stopPropagation();toggleSaved()}}>{saved.includes(active)?"★":"☆"}</button></div><h3>{current.word}</h3><p className="phonetic">{current.phonetic} <button className="voice-button" onClick={e=>{e.stopPropagation();playRecording()}} aria-label={`播放 ${current.word} 的真人发音`}><i>▶</i> 真人发音</button></p><div className="meaning"><strong>{current.meaning}</strong><p>{current.note}</p></div><div className="example"><small>换个语境</small><p>{current.example}</p><span>{current.translation}</span></div><div className="actions"><button className="ghost" onClick={e=>{e.stopPropagation();toggleSaved()}}>{saved.includes(active)?"已收藏":"加入生词本"}</button><button className="primary" onClick={e=>{e.stopPropagation();markKnown()}}>我记住了 →</button></div><div className="dots">{TIER_IDS[tier].map(id=><button key={id} className={id===active?"active":known.includes(id)?"known":""} data-word={id}/>)}</div></aside></section>
    <section className="continue"><div><span>学习顺序</span><h2>{tier==="high"?"完成高频词后，自动进入中频词。":tier==="mid"?"稳住中频词，再挑战低频词。":"完成最后一组，开始循环复习。"}</h2></div><button onClick={()=>{const next:Tier=tier==="high"?"mid":tier==="mid"?"low":"high";chooseTier(next);document.querySelector("#study")?.scrollIntoView({behavior:"smooth"})}}>下一阶段 <span>→</span></button></section>
    <footer><span>语境 · 让词汇有故事</span><span>发音录音来自 <a href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">Wikimedia Commons</a> · CC BY-SA</span></footer>{toast&&<div className="toast" role="status">✓ {toast}</div>}
  </main>;
}
