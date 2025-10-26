import React, { useEffect, useState, useRef } from "react";
import { fetchSheet } from "./api/sheets";
import Ship from "./components/Ship";
import { Howl } from "howler";
import { SOUND_URLS } from "./sounds";
import { ASSETS } from "./assets";
import "./styles.css";

const SHEET_ID = "1P05Uw_P7rfapZcO0KLz5wAa1Rjnp6h5XmK3yOGSnZLo"; // Google Sheet

const DEFAULT_PLAYERS = [
  "carlo","riccardo","daniele","domenico","nicholas","mattia z.","mattia a.","francesca",
  "dario","alessandro p","cristina","pietro s.","pietro d.","vincenzo","francesco",
  "giuseppe","alessandro a.","diego","andrea","filippo","felice","simone","roberto","christian"
].map(n=>({name:n, pirate:"", points:0}));

function parseRows(rows) {
  const parsed = rows.map(r => ({
    name: r.Nome || r.Name || r[Object.keys(r)[0]],
    pirate: r.Pirata || r.Pirate || r[Object.keys(r)[1]] || "",
    points: Number(r.Punti || r.Points || r[Object.keys(r)[2]] || 0)
  })).filter(x => !!x.name);
  return parsed.length ? parsed : DEFAULT_PLAYERS;
}

export default function App() {
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [maxPoints, setMaxPoints] = useState(1);
  const ambientRef = useRef(null);
  const dingRef = useRef(null);
  const boomRef = useRef(null);
  const finishRef = useRef(null);

  useEffect(() => {
    if (SOUND_URLS.ambient) ambientRef.current = new Howl({ src: [SOUND_URLS.ambient], loop: true, volume: 0.25, html5: true });
    if (SOUND_URLS.ding) dingRef.current = new Howl({ src: [SOUND_URLS.ding], volume: 1.0, html5: true });
    if (SOUND_URLS.boom) boomRef.current = new Howl({ src: [SOUND_URLS.boom], volume: 1.0, html5: true });
    if (SOUND_URLS.finish) finishRef.current = new Howl({ src: [SOUND_URLS.finish], volume: 1.0, html5: true });
    const startAudio = () => { if (ambientRef.current && !ambientRef.current.playing()) ambientRef.current.play(); };
    window.addEventListener("touchstart", startAudio, { once: true });
    window.addEventListener("click", startAudio, { once: true });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function poll(){
      try {
        const rows = await fetchSheet(SHEET_ID, 0);
        const parsed = parseRows(rows);
        if(!cancelled){
          setPlayers(prev => {
            parsed.forEach(p => {
              const before = prev.find(x => x.name===p.name);
              if (before) {
                if (p.points > before.points && dingRef.current) dingRef.current.play();
                if (p.points < before.points && boomRef.current) boomRef.current.play();
              }
            });
            return parsed;
          });
          setMaxPoints(Math.max(1, ...parsed.map(p=>p.points||0)));
        }
      } catch(e){ console.error(e); }
    }
    poll();
    const id=setInterval(poll, 10000);
    return ()=>{ cancelled=true; clearInterval(id); };
  }, []);

  const handleFinish = () => {
    if (!players.length) return;
    const winner = [...players].sort((a,b)=>b.points-a.points)[0];
    if (finishRef.current) finishRef.current.play();
    setPlayers(ps => ps.map(p => p.name===winner.name ? {...p,_forceWin:true}:p));
    if (ambientRef.current) {
      let vol = ambientRef.current.volume();
      const fade=setInterval(()=>{ vol-=0.05; if(vol<=0){ambientRef.current.stop(); clearInterval(fade);} else ambientRef.current.volume(vol); },200);
    }
  };

const MAX_POINTS = 200;
const normalize = (points) => Math.min(1, points / MAX_POINTS);

  return (
    <div className="app">
      <div className="left-panel">
        <h1>Grand Line War</h1>
        <div className="leaderboard">
          {players.map(p=>(
            <div key={p.name} className="leader-row">
              <div className="leader-name">{p.name}</div>
              <div className="leader-points">{p.points}</div>
              <div className="leader-bar"><div style={{width:`${(p.points/maxPoints)*100}%`}}/></div>
            </div>
          ))}
        </div>
        <div className="controls-bottom">
          <button className="finish-btn" onClick={handleFinish}>🏝️ Fine Gara</button>
        </div>
      </div>
      <div className="race-area">
        <div className="sea-bg" style={{backgroundImage: ASSETS.MAP ? `url(${ASSETS.MAP})` : 'none'}}>
          {ASSETS.ISLAND && <img src={ASSETS.ISLAND} className="island-img" alt="island" />}
          <div className="ships">
            {players.map(p=>{
              const progress = p._forceWin ? 1.05 : normalize(p.points);
              return <Ship key={p.name} name={p.name} pirate={p.pirate} progress={progress} isWinner={!!p._forceWin} />
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
