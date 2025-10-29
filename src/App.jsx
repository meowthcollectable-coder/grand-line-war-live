import React, { useEffect, useState, useRef } from "react";
import { fetchSheet } from "./api/sheets";
import Ship from "./components/Ship";
import { Howl } from "howler";
import { SOUND_URLS } from "./sounds";
import { ASSETS } from "./assets";

import tradimentoImg from "./assets/events/tradimento.png";
import duelloImg from "./assets/events/duello.png";
import pioggiaImg from "./assets/events/pioggia.png";
import tesoroImg from "./assets/events/tesoro.png";
import vittoriaImg from "./assets/events/vittoria.png";

import tradimentoAudio from "./assets/events/tradimento.mp3";
import attaccoAudio from "./assets/events/attacco.mp3";
import pioggiaAudio from "./assets/events/pioggia.mp3";
import tesoroAudio from "./assets/events/tesoro.mp3";
import vittoriaAudio from "./assets/events/vittoria.mp3";

import leaderboardBg from "./assets/ui/leaderboard.png";
import "./styles.css";

const MAX_POINTS = 60;
const SHEET_ID = "1P05Uw_P7rfapZcO0KLz5wAa1Rjnp6h5XmK3yOGSnZLo";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyrWxxSlHsYJlNyYw1hX9cz2z3-Qce6sXN1wKqSGh8aTFynwW6iVwFRRDq8K0NLEUjXEg/exec";

const DEFAULT_PLAYERS = [
  "carlo","riccardo","daniele","domenico","nicholas","mattia z.","mattia a.","francesca",
  "dario","alessandro p","cristina","pietro s.","pietro d.","vincenzo","francesco",
  "giuseppe","alessandro a.","diego","andrea","filippo","felice","simone","roberto","christian"
].map(n => ({ name: n, pirate: "", points: 0 }));

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
  const [activeEvent, setActiveEvent] = useState(null);
  const [lastEventHandled, setLastEventHandled] = useState("");
  const [showVictory, setShowVictory] = useState(false);

  const dingRef = useRef(null);
  const boomRef = useRef(null);
  const finishRef = useRef(null);
  const vittoriaSound = useRef(new Howl({ src: [vittoriaAudio], volume: 1 }));

  const eventSounds = useRef({
    tradimento: new Howl({ src: [tradimentoAudio], volume: 1, loop: true }),
    duello: new Howl({ src: [attaccoAudio], volume: 1, loop: true }),
    pioggia: new Howl({ src: [pioggiaAudio], volume: 1, loop: true }),
    tesoro: new Howl({ src: [tesoroAudio], volume: 1, loop: true }),
  });

  const eventImages = {
    tradimento: tradimentoImg,
    duello: duelloImg,
    pioggia: pioggiaImg,
    tesoro: tesoroImg,
  };

 useEffect(() => {
  // ✅ Sblocca automaticamente l’audio dopo la prima interazione
  Howler.autoUnlock = true;

  dingRef.current = new Howl({ src: [SOUND_URLS.ding], volume: 1, html5: true });
  boomRef.current = new Howl({ src: [SOUND_URLS.boom], volume: 1, html5: true });
  finishRef.current = new Howl({ src: [SOUND_URLS.finish], volume: 1, html5: true });
}, []);


  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const rows = await fetchSheet(SHEET_ID, 0);
        const parsed = parseRows(rows);

        const res = await fetch(`https://opensheet.elk.sh/${SHEET_ID}/Eventi`);
const eventSheet = await res.json();
const currentEvent = eventSheet?.[0]?.Evento || eventSheet?.[0]?.event || "";
console.log("📢 Evento letto (OpenSheet):", currentEvent);


        if (!currentEvent) {
          console.log("🟢 Nessun evento attivo");
        }

        if (!cancelled && currentEvent && currentEvent !== lastEventHandled) {
          console.log("🚨 Nuovo evento:", currentEvent);
          setActiveEvent(currentEvent);
          setLastEventHandled(currentEvent);

          const sound = eventSounds.current[currentEvent];
          if (sound) {
            sound.stop();
            sound.play();
          }

          setTimeout(() => {
            sound?.fade(1, 0, 1500);
            setTimeout(() => sound?.stop(), 1500);
            setActiveEvent(null);
          }, 10000);

          setTimeout(async () => {
            try {
              await fetch(`${SCRIPT_URL}?event=`);
              console.log("✅ Evento resettato su Google Sheet");
            } catch (err) {
              console.error("Errore reset evento:", err);
            }
          }, 11000);
        }

        if (!cancelled) {
          setPlayers(parsed);
        }
      } catch (e) {
        console.error("Errore polling:", e);
      }
    }

    poll();
    const id = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, [lastEventHandled]);

  const normalize = points => Math.min(points / MAX_POINTS, 1);
  const leader = [...players].sort((a, b) => b.points - a.points)[0]?.name;

 // ✍️ Scrive e resetta l’evento su Google Sheet (visibile per 40s)
async function updateEventOnSheet(eventKey) {
  try {
    // Attiva evento
    await fetch(
      `https://script.google.com/macros/s/AKfycbyrWxxSlHsYJlNyYw1hX9cz2z3-Qce6sXN1wKqSGh8aTFynwW6iVwFRRDq8K0NLEUjXEg/exec?event=${eventKey}`
    );
    console.log(`✅ Evento "${eventKey}" scritto su Google Sheet`);

    // Mantiene il valore per 40 secondi
    setTimeout(async () => {
      await fetch(
        `https://script.google.com/macros/s/AKfycbyrWxxSlHsYJlNyYw1hX9cz2z3-Qce6sXN1wKqSGh8aTFynwW6iVwFRRDq8K0NLEUjXEg/exec?event=`
      );
      console.log(`🔁 Evento "${eventKey}" resettato su Google Sheet`);
    }, 40000);
  } catch (e) {
    console.error("Errore aggiornamento evento su Sheet:", e);
  }
}



  const toggleEvent = eventKey => updateEventOnSheet(eventKey);
  const toggleVictory = () => {
    vittoriaSound.current.stop();
    vittoriaSound.current.play();
    setTimeout(() => setShowVictory(true), 3000);
  };

  return (
    <div className="app">
      <div className="left-panel" style={{
        backgroundImage: `url(${leaderboardBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        fontFamily: "'Syne Mono', monospace",
        textShadow: "2px 2px 5px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "25px 10px",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.25)",
          borderRadius: "8px",
          pointerEvents: "none",
        }} />
        <h1 style={{ fontSize: "26px", marginBottom: "20px", zIndex: 2 }}>LEADERBOARD</h1>
        <div className="leaderboard" style={{ width: "102%", zIndex: 2, paddingLeft: "4%" }}>
          {players.map(p => (
            <div key={p.name} className="leader-row" style={{
              color: "white", fontWeight: "normal",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 0.8fr",
              alignItems: "center", gap: "8px", marginBottom: "4px"
            }}>
              <div className="leader-name" style={{ textAlign: "left" }}>{p.name}</div>
              <div className="leader-pirate" style={{
                fontStyle: "italic", color: "#ffffff", opacity: 0.9,
                fontSize: "13px", textAlign: "center"
              }}>{p.pirate || "-"}</div>
              <div className="leader-points" style={{ textAlign: "right" }}>{p.points}</div>
              <div className="leader-bar" style={{
                gridColumn: "1 / span 3", height: "6px",
                background: "rgba(255,255,255,0.15)", borderRadius: "3px", overflow: "hidden"
              }}>
                <div style={{
                  width: `${(p.points / MAX_POINTS) * 100}%`,
                  height: "100%", background: "linear-gradient(90deg, #4d3a39, #3b2a29)"
                }} />
              </div>
            </div>
          ))}
        </div>

        {window.location.hostname === "localhost" && (
          <div className="event-controls">
            <button title="Vittoria Finale" onClick={toggleVictory}>🏆</button>
            <button title="Duello" onClick={() => toggleEvent("duello")}>⚔️</button>
            <button title="Tradimento" onClick={() => toggleEvent("tradimento")}>☠️</button>
            <button title="Tesoro" onClick={() => toggleEvent("tesoro")}>💰</button>
            <button title="Pioggia" onClick={() => toggleEvent("pioggia")}>🌧️</button>
          </div>
        )}
      </div>

      <div className="race-area">
        <div className="sea-bg" style={{ backgroundImage: ASSETS.MAP ? `url(${ASSETS.MAP})` : "none" }}>
          <div className="ships">
            {players.map(p => {
              const progress = normalize(p.points);
              const isBlinking = p.blinkUntil && Date.now() < p.blinkUntil;
              return (
                <Ship
                  key={p.name}
                  name={p.name}
                  pirate={p.pirate}
                  progress={progress}
                  isWinner={false}
                  lostPoint={isBlinking}
                  deltaPoints={p.deltaPoints}
                />
              );
            })}
          </div>
        </div>

        {activeEvent && (
          <div className="event-overlay fade-in">
            <img src={eventImages[activeEvent]} alt={activeEvent} />
          </div>
        )}

        {showVictory && (
          <div className="victory-overlay">
            <img src={vittoriaImg} alt="Vittoria" />
            <h1 className="victory-winner">{leader?.toUpperCase() || "—"}</h1>
          </div>
        )}
      </div>
    </div>
  );
}

