import React from "react";
import { ASSETS } from "../assets";

export default function Ship({ name, pirate, progress, isWinner }) {
  const translateX = `${progress * 100}%`;

  return (
    <div className="ship-row">
      <div className="ship-track" />
      <div
        className="ship"
        style={{
          transform: `translateX(${translateX})`,
          transition: "transform 1s ease-out",
        }}
      >
        <img src={ASSETS.SHIP} alt="ship" className="ship-img" />
        <div className="ship-name">{name}</div>
      </div>
    </div>
  );
}
