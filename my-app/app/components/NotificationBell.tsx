"use client";

// ================================================================
//  NotificationBell — the header bell + notifications popover,
//  shared by the resident Navbar and TownshipNavbar so the two
//  headers stay identical. The panel mirrors the mobile app's
//  notifications screen (title + "Mark all read", soft-blue unread
//  cards with a blue dot, "{project} • {time}" subtitle) as an
//  anchored overlay instead of a separate page. The unread dot on
//  the bell reflects the store's live unread count.
// ================================================================

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BellIcon } from "./icons";
import {
  useNotifications,
  markAllAsRead,
  markAsRead,
  toggleRead,
  type NotificationItem,
} from "./notificationsStore";

export default function NotificationBell() {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // The bell is shared between the resident and township headers —
  // each notification links to the relevant page for the current app.
  const isTownship = pathname.startsWith("/township");
  const openNotification = (n: NotificationItem) => {
    markAsRead(n.id);
    setOpen(false);
    router.push(isTownship ? n.townshipHref : n.residentHref);
  };

  // Close on navigation — synced during render, the repo's pattern
  // for adjusting state when a prop-like value changes.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (open) setOpen(false);
  }

  // Outside click + Escape close the panel.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "flex", flexShrink: 0 }}>
      <button
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative",
          color: "white",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          padding: 0,
        }}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              background: "#CD481B",
              borderRadius: "50%",
            }}
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: "absolute",
            top: 40,
            right: 0,
            zIndex: 50,
            width: 380,
            maxHeight: "min(70vh, 560px)",
            overflowY: "auto",
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 20px 44px rgba(2, 12, 27, 0.18)",
            padding: 16,
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 17, fontWeight: 700, color: "#0f2d59" }}>Notifications</span>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 13,
                fontWeight: 600,
                color: unreadCount === 0 ? "#9ca3af" : "#2563eb",
                cursor: unreadCount === 0 ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              Mark all read
            </button>
          </div>

          {/* Notification list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                role="link"
                tabIndex={0}
                aria-label={`${n.title} — ${n.project}, ${n.time}`}
                onClick={() => openNotification(n)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openNotification(n);
                  }
                }}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: 12,
                  background: n.unread ? "#eff6ff" : "#ffffff",
                  border: `1px solid ${n.unread ? "#dbeafe" : "#f1f5f9"}`,
                  cursor: "pointer",
                  transition: "background 0.15s ease, border-color 0.15s ease",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: n.unread ? "#2563eb" : "#cbd5e1",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13.5,
                      fontWeight: n.unread ? 600 : 400,
                      color: "#1e293b",
                      lineHeight: 1.4,
                    }}
                  >
                    {n.title}
                  </span>
                  <span style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 3 }}>
                    {n.project} • {n.time}
                  </span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRead(n.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#2563eb",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  {n.unread ? "Mark read" : "Mark unread"}
                </button>
              </div>
            ))}

            {notifications.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: "#64748b" }}>
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
