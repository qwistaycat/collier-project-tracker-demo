"use client";

// ================================================================
//  NotificationBell — the header bell + unread dot, shared by the
//  resident Navbar and TownshipNavbar so the two headers stay
//  visually identical (same icon size, same alert badge).
// ================================================================

import { BellIcon } from "./icons";

export default function NotificationBell() {
  return (
    <button
      aria-label="Notifications"
      style={{
        position: "relative",
        color: "white",
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexShrink: 0,
        padding: 0,
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
  );
}
