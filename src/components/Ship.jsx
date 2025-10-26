import React from "react";
import { ASSETS } from "../assets";

export default function Ship({ name, pirate, progress, isWinner, lostPoint }) {
  const translateX = `${progress * 100}%`;

  return (
    <div
      className="ship-row"
      style={{
        position: "relative",
        height: "100px",
        overflow: "visible",
      }}
    >
      {/* Contenitore nave */}
      <div
        className="ship"
        style={{
          transform: `translateX(${translateX})`,
          transition: "transform 1s ease-out",
          position: "absolute",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 100,
          overflow: "visible",
        }}
      >
        {/* Nave + fumo */}
        <div className="ship-wrapper" style={{ position: "relative", overflow: "visible" }}>
          <img
            src={ASSETS.SHIP}
            alt="ship"
            className="ship-img"
            style={{
              width: "80px",
              height: "auto",
              zIndex: 100,
              position: "relative",
            }}
          />

          {/* Fumo test visibile */}
          {true && (
            <div
              className="smoke-test"
              style={{
                position: "absolute",
                top: "-90px",
                left: "-30px",
                width: "150px",
                height: "150px",
                background: "rgba(255,0,0,0.5)",
                border: "3px solid yellow",
                zIndex: 9999,
              }}
            >
              TEST
            </div>
          )}
        </div>

        {/* Nome giocatore */}
        <div
          className="ship-name"
          style={{
            fontWeight: "bold",
            color: isWinner ? "gold" : "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
            minWidth: "120px",
            zIndex: 200,
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}
