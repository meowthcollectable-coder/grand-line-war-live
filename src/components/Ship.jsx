import React from "react";
import { ASSETS } from "../assets";

export default function Ship({ name, pirate, progress, isWinner }) {
  // progress tra 0 e 1 (grazie a normalize)
  const p = Math.max(0, Math.min(1, progress));

  return (
    <div className="ship-row">
      <div className="ship-label">
        <div className="ship-name">{name}</div>
        <div className="ship-pirate">{pirate}</div>
      </div>

      <div className="ship-track">
        <div
          className={`ship ${isWinner ? "winner" : ""}`}
          style={{ "--p": p }}
        >
          {ASSETS.SHIP ? (
            <img src={ASSETS.SHIP} alt="ship" />
          ) : (
            <div style={{ width: 48, height: 14, background: "#6b3", borderRadius: 4 }} />
          )}
        </div>
      </div>
    </div>
  );
}