"use client";

import { useEffect, useMemo, useState } from "react";

type Vocab={w:string;p:string;t:string;d:string;f:number;b:number;x:string};
type View="learn"|"reading"|"book"|"library";

const ARTICLES=[
  {tag:"成长 · B1",title:"The Courage to Begin",cn:"开始的勇气",text:"Every meaningful journey begins with a small decision. When Emma joined the school debate club, she was nervous and uncertain. She considered leaving after the first meeting, but her teacher encouraged her to stay. Through regular practice, she gradually learned to express her ideas clearly, listen to different opinions, and respond with confidence. The experience did not only improve her speaking skills. It also taught her that progress often appears when we are willing to face difficulty instead of avoiding it."},
  {tag:"自然 · B1",title:"A Forest That Remembers",cn:"会记忆的森林",text:"Scientists have discovered that a forest is more connected than it may appear. Beneath the ground, the roots of different trees exchange water and important materials through a complex network. Older trees can provide support for younger ones, especially when sunlight is limited. This hidden system helps the whole forest adapt to change. It reminds us that strength does not always come from standing alone. Sometimes, survival depends on cooperation and the quiet connections around us."},
  {tag:"科技 · B2",title:"Learning in a Digital Age",cn:"数字时代的学习",text:"Technology provides students with immediate access to a great amount of information. However, access alone does not guarantee real understanding. Learners still need to examine sources, compare different views, and consider whether an argument is reliable. A useful digital tool should encourage active thinking rather than replace it. When technology is used with a clear purpose, it can create new opportunities for education and help students become independent learners."},
];

const FUNCTION_WORDS:Record<string,{t:string;p?:string}>={a:{t:"art. 一个；一",p:"/ə/"},the:{t:"art. 这；那；这些；那些",p:"/ðə/"},to:{t:"prep. 向；到；不定式符号",p:"/tuː/"},of:{t:"prep. ……的",p:"/əv/"},and:{t:"conj. 和；并且",p:"/ænd/"},that:{t:"pron./conj. 那；那个；引导从句",p:"/ðæt/"},it:{t:"pron. 它",p:"/ɪt/"},her:{t:"pron. 她；她的",p:"/hɜːr/"},she:{t:"pron. 她",p:"/ʃiː/"},was:{t:"v. 是（be 的过去式）",p:"/wɒz/"},is:{t:"v. 是",p:"/ɪz/"},are:{t:"v. 是",p:"/ɑːr/"},with:{t:"prep. 和；具有；用",p:"/wɪð/"},when:{t:"adv./conj. 什么时候；当……时",p:"/wen/"},than:{t:"conj./prep. 比",p:"/ðæn/"},not:{t:"adv. 不；没有",p:"/nɒt/"},but:{t:"conj. 但是",p:"/bʌt/"},can:{t:"modal v. 能；可以",p:"/kæn/"},from:{t:"prep. 从；来自",p:"/frɒm/"},as:{t:"adv./conj./prep. 像；作为；当……时",p:"/æz/"}};
const LOCAL_AUDIO=new Set(["achieve","adapt","benefit","circumstance","coherent","consider","demonstrate","encounter","intricate","provide","reluctant","subtle"]);

function normalize(raw:string,map:Map<string,Vocab>){
  const w=raw.toLowerCase().replace(/[^a-z'-]/g,"");
  if(map.has(w))return w;
  const irregular:Record<string,string>={begins:"begin",joined:"join",was:"be",leaving:"leave",encouraged:"encourage",learned:"learn",taught:"teach",appears:"appear",avoiding:"avoid",scientists:"scientist",discovered:"discover",trees:"tree",older:"old",younger:"young",ones:"one",helps:"help",reminds:"remind",connections:"connection",provides:"provide",students:"student",learners:"learner",sources:"source",views:"view",depends:"depend",used:"use"};
  if(irregular[w]&&map.has(irregular[w]))return irregular[w];
  for(const s of ["ing","ied","ed","es","s"]){if(w.endsWith(s)){let root=w.slice(0,-s.length)+(s==="ied"?"y":"");if(map.has(root))return root;if(map.has(root+"e"))return root+"e";}}
  return w;
}

function ClickableText({text,map,onWord}:{text:string;map:Map<string,Vocab>;onWord:(w:string)=>void}){
  return <>{text.split(/([A-Za-z][A-Za-z'-]*)/g).map((part,i)=>/^[A-Za-z]/.test(part)?<button key={i} className="article-word" onClick={()=>onWord(normalize(part,map))}>{part}</button>:<span key={i}>{part}</span>)}</>;
}

export default function Home(){
  const [words,setWords]=useState<Vocab[]>([]); const [view,setView]=useState<View>("learn");
  const [active,setActive]=useState("achieve"); const [known,setKnown]=useState<string[]>([]); const [saved,setSaved]=useState<string[]>([]);
  const [article,setArticle]=useState(0); const [query,setQuery]=useState(""); const [limit,setLimit]=useState(60); const [toast,setToast]=useState(""); const [loadingAudio,setLoadingAudio]=useState(false);
  useEffect(()=>{fetch("/gaokao-vocab.json").then(r=>r.json()).then((d:Vocab[])=>{setWords(d);setActive(d[0]?.w||"achieve")});try{setKnown(JSON.parse(localStorage.getItem("yujing-known")||"[]"));setSaved(JSON.parse(localStorage.getItem("yujing-saved")||"[]"))}catch{}},[]);
  useEffect(()=>{if(words.length){localStorage.setItem("yujing-known",JSON.stringify(known));localStorage.setItem("yujing-saved",JSON.stringify(saved))}},[known,saved,words.length]);
  const map=useMemo(()=>new Map(words.map(w=>[w.w,w])),[words]); const item=map.get(active); const index=item?words.indexOf(item):0;
  const stage=index<1200?"高频":index<2400?"中频":"低频"; const daily=words.slice(Math.floor(index/20)*20,Math.floor(index/20)*20+20);
  const search=useMemo(()=>{const q=query.trim().toLowerCase();return (q?words.filter(w=>w.w.includes(q)||w.t.includes(query.trim())):words).slice(0,limit)},[words,query,limit]);
  function selectWord(w:string){setActive(w);if(view!=="learn")setView("reading");}
  function markKnown(){if(!known.includes(active))setKnown(k=>[...k,active]);const next=words[Math.min(index+1,words.length-1)];if(next)setActive(next.w);}
  function toggleSaved(){setSaved(s=>s.includes(active)?s.filter(x=>x!==active):[...s,active]);setToast(saved.includes(active)?"已移出生词本":"已加入生词本");setTimeout(()=>setToast(""),1400)}
  async function playAudio(){setLoadingAudio(true);try{if(LOCAL_AUDIO.has(active)){await new Audio(`/audio/${active}.mp3`).play();return}const r=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${active}`);const d=await r.json();const url=d?.flatMap((e:{phonetics?:{audio?:string}[]})=>e.phonetics||[]).find((p:{audio?:string})=>p.audio)?.audio;if(!url)throw new Error();await new Audio(url).play()}catch{setToast("这个词暂无真人录音");setTimeout(()=>setToast(""),1600)}finally{setLoadingAudio(false)}}
  const display=item|| (FUNCTION_WORDS[active]?{w:active,p:FUNCTION_WORDS[active].p||"",t:FUNCTION_WORDS[active].t,d:"文章中的常用功能词",f:0,b:0,x:""}:null);

  return <main className="app-shell">
    <header className="app-header"><a className="brand" href="#" onClick={()=>setView("learn")}><span>境</span><div>语境<small>高中 3500 词</small></div></a><nav>{([['learn','学习'],['reading','读文章'],['book','生词本'],['library','全部词库']] as [View,string][]).map(([id,label])=><button key={id} className={view===id?"active":""} onClick={()=>setView(id)}>{label}{id==="book"&&saved.length>0?<b>{saved.length}</b>:null}</button>)}</nav><div className="streak">✦ 连续 12 天</div></header>
    {view==="learn"&&<><section className="dashboard"><div><p className="eyebrow">今日学习 · {stage}阶段</p><h1>在语境里，<em>真正记住</em>每一个词。</h1><p>完整收录 {words.length||"3,674"} 个高考标注词条，按词频从高到低学习。</p></div><div className="overall"><strong>{known.length}</strong><span>/ {words.length||3674} 已掌握</span><div><i style={{width:`${words.length?known.length/words.length*100:0}%`}}/></div></div></section><section className="daily-strip"><div><span>今日 20 词</span><strong>{Math.min(known.filter(w=>daily.some(d=>d.w===w)).length,20)} / 20</strong></div>{daily.map((w,i)=><button key={w.w} className={`${active===w.w?"active":""} ${known.includes(w.w)?"known":""}`} onClick={()=>setActive(w.w)}><small>{i+1}</small>{w.w}</button>)}</section><StudyCard display={display} index={index} total={words.length} stage={stage} saved={saved.includes(active)} loading={loadingAudio} onAudio={playAudio} onSave={toggleSaved} onKnow={markKnown}/><section className="reading-teaser"><div><p className="eyebrow">语境阅读</p><h2>把今天的词放回一篇文章里</h2><p>文章中的每个英文单词都能点击查询和收藏。</p></div><button onClick={()=>setView("reading")}>开始阅读 →</button></section></>}
    {view==="reading"&&<section className="reader-layout"><div className="article-list">{ARTICLES.map((a,i)=><button key={a.title} className={article===i?"active":""} onClick={()=>setArticle(i)}><small>{a.tag}</small><strong>{a.title}</strong><span>{a.cn}</span></button>)}</div><article className="reader"><p className="eyebrow">{ARTICLES[article].tag} · 全文可点词</p><h1>{ARTICLES[article].title}</h1><h2>{ARTICLES[article].cn}</h2><div className="article-copy"><ClickableText text={ARTICLES[article].text} map={map} onWord={selectWord}/></div><p className="reader-hint">轻触任何英文单词，即可在右侧查看并学习</p></article><StudyCard compact display={display} index={index} total={words.length} stage={stage} saved={saved.includes(active)} loading={loadingAudio} onAudio={playAudio} onSave={toggleSaved} onKnow={markKnown}/></section>}
    {view==="book"&&<WordGrid title="我的生词本" subtitle={`已收藏 ${saved.length} 个词，点击继续学习`} words={saved.map(w=>map.get(w)).filter(Boolean) as Vocab[]} known={known} onWord={w=>{setActive(w);setView("learn")}} empty="还没有生词。阅读文章时，点击单词并加入生词本。"/>}
    {view==="library"&&<section className="library"><div className="library-head"><div><p className="eyebrow">完整高考词库</p><h1>{words.length.toLocaleString()} 个词条</h1><p>按现代语料词频排列：高频 → 中频 → 低频</p></div><label>⌕<input value={query} onChange={e=>{setQuery(e.target.value);setLimit(60)}} placeholder="搜索英文或中文释义"/></label></div><WordGrid words={search} known={known} onWord={w=>{setActive(w);setView("learn")}} empty="没有找到这个词。"/>{search.length<(query?words.filter(w=>w.w.includes(query.toLowerCase())||w.t.includes(query)).length:words.length)&&<button className="load-more" onClick={()=>setLimit(x=>x+60)}>加载更多</button>}</section>}
    <footer><span>语境 · 高中英语 3500 词</span><span>词典数据：ECDICT（MIT） · 发音：Wikimedia Commons / Dictionary API</span></footer>{toast&&<div className="toast">✓ {toast}</div>}
  </main>;
}

function StudyCard({display,index,total,stage,saved,loading,onAudio,onSave,onKnow,compact=false}:{display:Vocab|null;index:number;total:number;stage:string;saved:boolean;loading:boolean;onAudio:()=>void;onSave:()=>void;onKnow:()=>void;compact?:boolean}){
  if(!display)return <aside className={`study-card ${compact?"compact":""}`}><p>词库加载中…</p></aside>;
  return <aside className={`study-card ${compact?"compact":""}`}><div className="card-top"><span>{stage}词 · {Math.max(index+1,1)}/{total||3674}</span><button onClick={onSave} aria-label="收藏">{saved?"★":"☆"}</button></div><h2>{display.w}</h2><div className="pronounce"><span>{display.p||"音标整理中"}</span><button onClick={onAudio} disabled={loading}>{loading?"加载中…":"▶ 真人发音"}</button></div><div className="definition"><strong>{display.t||"暂无中文释义"}</strong>{display.d&&<p>{display.d}</p>}</div><div className="card-actions"><button onClick={onSave}>{saved?"已加入生词本":"我不认识"}</button><button className="know" onClick={onKnow}>我认识 →</button></div></aside>;
}

function WordGrid({title,subtitle,words,known,onWord,empty}:{title?:string;subtitle?:string;words:Vocab[];known:string[];onWord:(w:string)=>void;empty:string}){return <section className="word-section">{title&&<div className="section-title"><p className="eyebrow">复习</p><h1>{title}</h1><p>{subtitle}</p></div>}{!words.length?<div className="empty">{empty}</div>:<div className="word-grid">{words.map((w,i)=><button key={w.w} onClick={()=>onWord(w.w)}><small>{i+1}</small><div><strong>{w.w}</strong><span>{w.p}</span><p>{w.t.split(/[；\n]/)[0]}</p></div><i>{known.includes(w.w)?"✓":"→"}</i></button>)}</div>}</section>}
