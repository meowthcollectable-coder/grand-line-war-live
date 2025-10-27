import React, { useEffect, useState, useRef } from "react";
import { fetchSheet } from "./api/sheets";
import Ship from "./components/Ship";
import { Howl } from "howler";
import { SOUND_URLS } from "./sounds";
import { ASSETS } from "./assets";
import "./styles.css";

// 🔥 LIMITE PUNTI MASSIMO
const MAX_POINTS = 60;

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

  const dingRef = useRef(null);
  const boomRef = useRef(null);
  const finishRef = useRef(null);

  // 🎵 Inizializza i suoni
  useEffect(() => {
    dingRef.current = new Howl({ src: [SOUND_URLS.ding], volume: 1, html5: true });
    boomRef.current = new Howl({ src: [SOUND_URLS.boom], volume: 1, html5: true });
    finishRef.current = new Howl({ src: [SOUND_URLS.finish], volume: 1, html5: true });

    const unlockAudio = () => {
      dingRef.current?.play();
      boomRef.current?.play();
      finishRef.current?.play();
      setTimeout(() => {
        dingRef.current?.stop();
        boomRef.current?.stop();
        finishRef.current?.stop();
      }, 200);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("click", unlockAudio, { once: true });
  }, []);

  // 📊 Aggiorna dati dal Google Sheet
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const rows = await fetchSheet("1P05Uw_P7rfapZcO0KLz5wAa1Rjnp6h5XmK3yOGSnZLo", 0);
        const parsed = parseRows(rows);

        if (!cancelled) {
          setPlayers(prev => {
            return parsed.map(p => {
              const before = prev.find(x => x.name === p.name);

              // 🔒 Se la nave era vincitrice, la blocchiamo in fondo
              if (before && before._forceWin) {
                return { ...before, points: MAX_POINTS, _forceWin: true };
              }

              // 💣 Se il giocatore perde punti
              if (before && p.points < before.points) {
                // 🎵 Suona boom subito (2s prima che si muova la nave)
                boomRef.current?.play();

                // Mantiene temporaneamente i punti precedenti
                const frozen = { ...before, isBlinking: true };

                // ⏱️ Dopo 2 secondi aggiorna visivamente la perdita
                setTimeout(() => {
                  setPlayers(current =>
                    current.map(x =>
                      x.name === p.name
                        ? { ...x, points: p.points, isBlinking: true }
                        : x
                    )
                  );

                  // 🔁 Rimuove lampeggio dopo 5 secondi
                  setTimeout(() => {
                    setPlayers(current =>
                      current.map(x =>
                        x.name === p.name ? { ...x, isBlinking: false } : x
                      )
                    );
                  }, 5000);
                }, 2000);

                return frozen;
              }

              // 🔔 Se guadagna punti → suono ding
              if (before && p.points > before.points) {
                dingRef.current?.play();
              }

              return p;
            });
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    poll();
    const id = setInterval(poll, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // 🏁 Fine gara
  const handleFinish = () => {
    if (!players.length) return;
    const winner = [...players].sort((a, b) => b.points - a.points)[0];
    finishRef.current?.play();
    setPlayers(ps => ps.map(p => p.name === winner.name ? { ...p, _forceWin: true } : p));
  };

  // 📏 Normalizzazione: 0 → 60 punti = 0 → 1 progress
  const normalize = (points) => Math.min(points / MAX_POINTS, 1);

  return (
    <div className="app">
      {/* PANNELLO SINISTRO */}
      <div className="left-panel">
<h1 className="leaderboard-title">LEADERBOARD</h1>

        <div className="leaderboard">
          {players.map(p => (
            <div key={p.name} className="leader-row">
              <div className="leader-name">{p.name}</div>
              <div className="leader-points">{p.points}</div>
              <div className="leader-bar">
                <div style={{ width: `${(p.points / MAX_POINTS) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="controls-bottom">
          <button className="finish-btn" onClick={handleFinish}>🏝️ Fine Gara</button>
        </div>
      </div>

      {/* AREA DI GARA */}
      <div className="race-area">
        <div
          className="sea-bg"
          style={{
            backgroundImage: ASSETS.MAP ? `url(${ASSETS.MAP})` : "none",
          }}
        >

          <div className="ships">
            {players.map(p => {
              const progress = p._forceWin ? 1 : normalize(p.points);
              return (
                <Ship
                  key={p.name}
                  name={p.name}
                  pirate={p.pirate}
                  progress={progress}
                  isWinner={!!p._forceWin}
                  lostPoint={p.isBlinking} // 🔥 lampeggio
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
