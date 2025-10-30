import React, { useEffect, useState, useRef } from "react";
import { fetchSheet } from "./api/sheets";
import Ship from "./components/Ship";
import { Howl } from "howler";
import { SOUND_URLS } from "./sounds";
import { ASSETS } from "./assets";

import attaccoImg from "./assets/events/attacco.png";
import duelloImg from "./assets/events/duello.png";
import tradimentoImg from "./assets/events/tradimento.png";
import pioggiaImg from "./assets/events/pioggia.png";
import tesoroImg from "./assets/events/tesoro.png";
import fruttoImg from "./assets/events/frutto.png";
import vittoriaImg from "./assets/events/vittoria.png";

import attaccoAudio from "./assets/events/attacco.mp3";
import duelloAudio from "./assets/events/duello.mp3";
import tradimentoAudio from "./assets/events/tradimento.mp3";
import pioggiaAudio from "./assets/events/pioggia.mp3";
import tesoroAudio from "./assets/events/tesoro.mp3";
import fruttoAudio from "./assets/events/frutto.mp3";
import vittoriaAudio from "./assets/events/vittoria.mp3";

import leaderboardBg from "./assets/ui/leaderboard.png";
import "./styles.css";

const MAX_POINTS = 86;
const SHEET_ID = "1P05Uw_P7rfapZcO0KLz5wAa1Rjnp6h5XmK3yOGSnZLo";

const DEFAULT_PLAYERS = [
  "carlo", "riccardo", "daniele", "domenico", "nicholas", "mattia z.", "mattia a.", "francesca",
  "dario", "alessandro p", "cristina", "pietro s.", "pietro d.", "vincenzo", "francesco",
  "giuseppe", "alessandro a.", "diego", "andrea", "filippo", "felice", "simone", "roberto", "christian"
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
  const [showVictory, setShowVictory] = useState(false);

  const dingRef = useRef(null);
  const boomRef = useRef(null);
  const finishRef = useRef(null);
  const vittoriaSound = useRef(new Howl({ src: [vittoriaAudio], volume: 1 }));

  const eventSounds = useRef({
    attacco: new Howl({ src: [attaccoAudio], volume: 1, loop: true }),
    duello: new Howl({ src: [duelloAudio], volume: 1, loop: true }),
    tradimento: new Howl({ src: [tradimentoAudio], volume: 1, loop: true }),
    tesoro: new Howl({ src: [tesoroAudio], volume: 1, loop: true }),
    pioggia: new Howl({ src: [pioggiaAudio], volume: 1, loop: true }),
    frutto: new Howl({ src: [fruttoAudio], volume: 1, loop: true }),
  });

  const eventImages = {
    attacco: attaccoImg,
    duello: duelloImg,
    tradimento: tradimentoImg,
    tesoro: tesoroImg,
    pioggia: pioggiaImg,
    frutto: fruttoImg,
  };

  useEffect(() => {
    dingRef.current = new Howl({ src: [SOUND_URLS.ding], volume: 1, html5: true });
    boomRef.current = new Howl({ src: [SOUND_URLS.boom], volume: 1, html5: true });
    finishRef.current = new Howl({ src: [SOUND_URLS.finish], volume: 1, html5: true });
  }, []);

  // 📊 Polling classifica
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const rows = await fetchSheet(SHEET_ID, 0);
        const parsed = parseRows(rows);
        if (!cancelled) {
          setPlayers(prev =>
            parsed.map(p => {
              const before = prev.find(x => x.name === p.name);
              const delta = before ? p.points - before.points : 0;
              if (delta > 0) dingRef.current?.play();
              if (delta < 0) boomRef.current?.play();
              if (delta !== 0) {
                p.deltaPoints = delta;
                setTimeout(() => { p.deltaPoints = 0; }, 3000);
              }
              if (before && p.points < before.points) {
                return { ...p, blinkUntil: Date.now() + 3000 };
              }
              return p;
            })
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // 🔔 Polling EVENTI da Google Sheet (gid=433893229)
  useEffect(() => {
    let cancelled = false;
    async function pollEvents() {
      try {
        const evRows = await fetchSheet(SHEET_ID, 433893229);
        const getYes = (rowIdx) =>
          (evRows?.[rowIdx]?.B || "").toString().trim().toUpperCase() === "SI";

        const flags = {
          attacco: getYes(0),
          duello: getYes(1),
          tradimento: getYes(2),
          tesoro: getYes(3),
          pioggia: getYes(4),
          frutto: getYes(5),
          vittoria: getYes(6),
        };

        const allEvents = ["attacco", "duello", "tradimento", "tesoro", "pioggia", "frutto"];
        const activeKey = allEvents.find(k => flags[k]) || null;

        // ▶️ Attiva evento
        if (!cancelled && activeKey && activeKey !== activeEvent) {
          Object.values(eventSounds.current).forEach(s => s.stop());
          const sound = eventSounds.current[activeKey];
          if (sound) {
            sound.stop();
            sound.volume(0);
            sound.play();
            sound.fade(0, 1, 1500);
          }
          setActiveEvent(activeKey);
        }

        // ⏹️ Disattiva evento
        if (!cancelled && !activeKey && activeEvent) {
          const sound = eventSounds.current[activeEvent];
          if (sound) {
            sound.fade(1, 0, 1500);
            setTimeout(() => sound.stop(), 1500);
          }
          setTimeout(() => setActiveEvent(null), 1000);
        }

        // 🏆 Vittoria
        if (!cancelled && flags.vittoria && !showVictory) {
          vittoriaSound.current.stop();
          vittoriaSound.current.volume(0);
          vittoriaSound.current.play();
          vittoriaSound.current.fade(0, 1, 1500);
          setShowVictory(true);
        }
        if (!cancelled && !flags.vittoria && showVictory) {
          vittoriaSound.current.fade(1, 0, 1500);
          setTimeout(() => vittoriaSound.current.stop(), 1500);
          setTimeout(() => setShowVictory(false), 1000);
        }
      } catch (e) {
        console.error("Polling eventi error:", e);
      }
    }
    pollEvents();
    const id = setInterval(pollEvents, 4000);
    return () => { cancelled = true; clearInterval(id); };
  }, [activeEvent, showVictory]);

  const normalize = points => Math.min(points / MAX_POINTS, 1);
  const leader = [...players].sort((a, b) => b.points - a.points)[0]?.name;

  return (
    <div className="app">
      {/* 🏴‍☠️ Leaderboard */}
      <div
        className="left-panel"
        style={{
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
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
            borderRadius: "8px",
            pointerEvents: "none",
          }}
        />
        <h1 style={{ fontSize: "26px", marginBottom: "20px", zIndex: 2 }}>LEADERBOARD</h1>

        <div className="leaderboard" style={{ width: "110%", zIndex: 2, paddingLeft: "20%" }}>
          {players.map(p => (
            <div
              key={p.name}
              className="leader-row"
              style={{
                color: "white",
                fontWeight: "normal",
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr 0.8fr",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <div className="leader-name" style={{ textAlign: "left" }}>{p.name}</div>
              <div
                className="leader-pirate"
                style={{
                  fontStyle: "italic",
                  color: "#ffffff",
                  opacity: 0.9,
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                {p.pirate || "-"}
              </div>
              <div className="leader-points" style={{ textAlign: "right" }}>{p.points}</div>
              <div
                className="leader-bar"
                style={{
                  gridColumn: "1 / span 3",
                  height: "6px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(p.points / MAX_POINTS) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #4d3a39, #3b2a29)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🌊 Area gara */}
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

        {/* 🌅 Overlay evento */}
        {activeEvent && (
          <div className="event-overlay fade-in">
            <img src={eventImages[activeEvent]} alt={activeEvent} />
          </div>
        )}

        {/* 🏆 Overlay Vittoria */}
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
