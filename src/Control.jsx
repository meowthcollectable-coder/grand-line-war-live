import React, { useEffect, useState, useRef } from "react";
import { fetchSheet } from "./api/sheets";
import { SOUND_URLS } from "./sounds";
import { Howl } from "howler";

const SHEET_ID = "1P05Uw_P7rfapZcO0KLz5wAa1Rjnp6h5XmK3yOGSnZLo";

export default function Control(){
  const [rows,setRows]=useState([]);
  const eventSounds = useRef({});

  useEffect(()=>{ refresh();
    eventSounds.current = {
      attack: SOUND_URLS.event_attack ? new Howl({src:[SOUND_URLS.event_attack],loop:true,volume:.8,html5:true}) : null,
      betrayal: SOUND_URLS.event_betrayal ? new Howl({src:[SOUND_URLS.event_betrayal],loop:true,volume:.8,html5:true}) : null,
      duel: SOUND_URLS.event_duel ? new Howl({src:[SOUND_URLS.event_duel],loop:true,volume:.8,html5:true}) : null,
      skypiea: SOUND_URLS.event_skypiea ? new Howl({src:[SOUND_URLS.event_skypiea],loop:true,volume:.8,html5:true}) : null,
      berries: SOUND_URLS.event_berries ? new Howl({src:[SOUND_URLS.event_berries],loop:true,volume:.8,html5:true}) : null,
      fruit: SOUND_URLS.event_fruit ? new Howl({src:[SOUND_URLS.event_fruit],loop:true,volume:.8,html5:true}) : null
    };
  },[]);

  async function refresh(){
    const d = await fetchSheet(SHEET_ID, 0);
    setRows(d);
  }
  function toggleEvent(name){
    const s = eventSounds.current[name];
    if(!s) return;
    s.playing() ? s.stop() : s.play();
  }

  return (
    <div style={{padding:20,color:"#fff",background:"#0b2b3a",minHeight:"100vh"}}>
      <h2>CONTROL - Grand Line War</h2>
      <button onClick={refresh}>🔄 Aggiorna da Google Sheets</button>
      <table style={{width:"100%",marginTop:10,borderCollapse:"collapse"}}>
        <thead><tr><th align="left">Nome</th><th align="left">Pirata</th><th align="left">Punti</th></tr></thead>
        <tbody>
          {rows.map((r,i)=>{
            const name = r.Nome || r.Name || r.nome || Object.values(r)[0];
            const pirate = r.Pirata || r.pirata || "";
            const pointsKey = Object.keys(r).find(k=>k.toLowerCase().includes("punt")) || Object.keys(r)[2];
            const pts = Number(r[pointsKey] || 0);
            return <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.1)"}}>
              <td>{name}</td><td>{pirate}</td><td>{pts}</td>
            </tr>
          })}
        </tbody>
      </table>

      <h3 style={{marginTop:24}}>Eventi speciali (toggle ON/OFF)</h3>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        <button onClick={()=>toggleEvent("attack")}>🪖 Attacco</button>
        <button onClick={()=>toggleEvent("betrayal")}>🗡️ Tradimento</button>
        <button onClick={()=>toggleEvent("duel")}>⚔️ Duello</button>
        <button onClick={()=>toggleEvent("skypiea")}>💎 Skypiea</button>
        <button onClick={()=>toggleEvent("berries")}>💰 Berries</button>
        <button onClick={()=>toggleEvent("fruit")}>🍇 Frutto</button>
      </div>

      <p style={{opacity:.8,marginTop:12}}>Imposta gli URL suoni in <code>src/sounds.js</code>.</p>
    </div>
  );
}
