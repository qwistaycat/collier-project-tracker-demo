"use client";

import Link from "next/link";
import { BuildingIcon, HomeIcon, BellIcon } from "./icons";

export default function Navbar() {
  return (
    <nav
      style={{
        backgroundColor: "#0d2240",
        height: 56,
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left: logo icon + site name */}
      <Link
        href="/dashboard"
        style={{
          color: "white",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        <HomeIcon />
      </Link>

      {/* Right: bell + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>

        <button
          style={{
            position: "relative",
            color: "white",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
          }}
        >
          <BellIcon />
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              background: "#ef4444",
              borderRadius: "50%",
            }}
          />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#60a5fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            C
          </div>
          <span style={{ color: "white", fontSize: 14 }}>Hi, Christy</span>
        </div>
      </div>
    </nav>
  );
}
