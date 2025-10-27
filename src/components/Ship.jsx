import React, { useRef, useEffect, useState } from "react";
import { ASSETS } from "../assets";

export default function Ship({ name, pirate, progress, isWinner, lostPoint }) {
  const trackRef = useRef(null);
  const shipRef = useRef(null);
  const [prevProgress, setPrevProgress] = useState(progress);
  const [tilt, setTilt] = useState(false);
  const [showTrail, setShowTrail] = useState(false);

  useEffect(() => {
    if (trackRef.current && shipRef.current) {
      const trackWidth = trackRef.current.offsetWidth;
      const shipWidth = shipRef.current.offsetWidth;
      const maxTravel = trackWidth - shipWidth;
      const move = Math.min(progress, 1) * maxTravel;

      // inclinazione e scia se la nave avanza
      if (progress > prevProgress) {
        setTilt(true);
        setShowTrail(true);
        setTimeout(() => setTilt(false), 400);
        setTimeout(() => setShowTrail(false), 600);
      }

      // aggiorna posizione orizzontale della nave
      shipRef.current.style.transform = `translate(${move}px, -55%)`;
      setPrevProgress(progress);
    }
  }, [progress]);

  return (
    <div
      className="ship-row"
      style={{
        position: "relative",
        height: "29px",
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {/* === TRACCIATO === */}
      <div
        ref={trackRef}
        className="ship-track"
        style={{
          position: "absolute",
          left: "5%", // ⬅️ tutto inizia 5% più a destra
          top: "50%",
          width: "75%", // ⬅️ fine invariata
          height: "11px",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "4px",
          transform: "translateY(-50%)",
          zIndex: 0,
        }}
      />

      {/* === CONTENITORE NAVE === */}
      <div
        ref={shipRef}
        className={`ship ${lostPoint ? "blink" : ""} ${tilt ? "tilt" : ""}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "5%", // ⬅️ nave allineata al nuovo offset
          transform: "translate(0, -55%)",
          transition: "transform 1s ease-out",
          display: "flex",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* 🌊 Scia */}
        {showTrail && (
          <div
            className="ship-trail"
            style={{
              position: "absolute",
              left: "-25px", // offset locale dietro la nave
              top: "50%",
              transform: "translateY(-50%)",
              width: "35px",
              height: "12px",
              background:
                "linear-gradient(90deg, rgba(173,216,230,0.9), rgba(173,216,230,0))",
              borderRadius: "6px",
              opacity: 0,
              animation: "trailFade 0.6s ease-out forwards",
              zIndex: 5,
              boxShadow:
                "0 0 10px 3px rgba(173,216,230,0.6), 0 0 20px 6px rgba(255,255,255,0.3)",
            }}
          />
        )}

        {/* 🚢 NAVE */}
        <div
          className="ship-wrapper"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={ASSETS.SHIP}
            alt="ship"
            className="ship-img floating"
            style={{
              width: "44px",
              height: "auto",
              transition: "filter 0.3s, transform 0.3s ease-out",
              transformOrigin: "center",
            }}
          />
        </div>

        {/* 🏴‍☠️ NOME */}
        <div
          className="ship-name"
          style={{
            position: "absolute",
            top: "50%",
            left: "110%",
            transform: "translateY(-50%)",
            fontWeight: "bold",
            color: isWinner ? "gold" : "white",
            textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
            fontSize: "11px",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}
