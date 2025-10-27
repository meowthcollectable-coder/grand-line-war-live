import React, { useRef, useEffect } from "react";
import { ASSETS } from "../assets";

export default function Ship({ name, pirate, progress, isWinner, lostPoint }) {
  const trackRef = useRef(null);
  const shipRef = useRef(null);

  useEffect(() => {
    if (trackRef.current && shipRef.current) {
      const trackWidth = trackRef.current.offsetWidth;
      const shipWidth = shipRef.current.offsetWidth;

      // distanza percorribile reale in pixel
      const maxTravel = trackWidth - shipWidth;

      // movimento effettivo in pixel
      const move = Math.min(progress, 1) * maxTravel;

      // applica spostamento
      shipRef.current.style.transform = `translate(${move}px, -50%)`;
    }
  }, [progress]);

  return (
    <div
      className="ship-row"
      style={{
        position: "relative",
        height: "32px", // via di mezzo
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
          left: 0,
          top: "50%",
          width: "80%",
          height: "22px", // via di mezzo
          background: "rgba(255,255,255,0.15)",
          borderRadius: "4px",
          transform: "translateY(-50%)",
          zIndex: 0,
        }}
      />

      {/* === NAVE === */}
      <div
        ref={shipRef}
        className={`ship ${lostPoint ? "blink" : ""}`}
        style={{
          position: "absolute",
          top: "50%",
          transform: "translate(0, -50%)",
          transition: "transform 1s ease-out",
          display: "flex",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <img
          src={ASSETS.SHIP}
          alt="ship"
          className="ship-img"
          style={{
            width: "44px", // via di mezzo tra 48 e 38
            height: "auto",
            transition: "filter 0.3s",
          }}
        />
        <div
          className="ship-name"
          style={{
            fontWeight: "bold",
            color: isWinner ? "gold" : "white",
            textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
            marginLeft: "8px",
            fontSize: "11px", // via di mezzo
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}
