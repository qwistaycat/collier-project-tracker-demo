"use client";

// ================================================================
//  TownshipNavbar — global staff header. Mirrors the resident
//  Navbar's look (navy bar, pill search input, bell, avatar) and
//  adds the staff chrome: section tabs, Preview Resident View,
//  the AI Assistance toggle, and a profile dropdown with the
//  department switcher and Trash entry.
//
//  Search matches the resident app's header search: typing +
//  Enter lands on the projects gallery with a ?q= keyword filter.
// ================================================================

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BellIcon, SearchIcon, CloseIcon, EyeIcon } from "@/app/components/icons";
import { useTownship } from "../TownshipContext";
import { STAFF_NAME, STAFF_DEPARTMENTS, initialsOf } from "../data";

const NAV_ITEMS = [
  { label: "Projects", href: "/township/projects" },
  { label: "Feedback", href: "/township/feedback" },
  { label: "Insights", href: "/township/insights" },
  { label: "Reports", href: "/township/reports" },
];

export default function TownshipNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { aiMode, setAiMode, dept, setDept, projects, toast } = useTownship();

  const committedQ = pathname === "/township/projects" ? (searchParams.get("q") ?? "") : "";
  const [inputValue, setInputValue] = useState(committedQ);
  const [syncedQ, setSyncedQ] = useState(committedQ);
  if (syncedQ !== committedQ) {
    setSyncedQ(committedQ);
    setInputValue(committedQ);
  }

  const [profileOpen, setProfileOpen] = useState(false);
  const [deptSwitchOpen, setDeptSwitchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on navigation — synced during render, the
  // repo's pattern for adjusting state when a prop-like value changes.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (profileOpen) setProfileOpen(false);
  }

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const trashCount = projects.filter((p) => p.lc === "trash").length;

  const runSearch = () => {
    const q = inputValue.trim();
    router.push(q ? `/township/projects?q=${encodeURIComponent(q)}` : "/township/projects");
  };

  const clearInput = () => {
    setInputValue("");
    if (pathname === "/township/projects" && committedQ) {
      router.push("/township/projects");
    }
  };

  const toggleAi = () => {
    setAiMode((v) => {
      toast(v ? "AI Assistance OFF" : "AI Assistance ON");
      return !v;
    });
  };

  const isActive = (href: string) =>
    href === "/township/projects"
      ? pathname.startsWith("/township/projects") || pathname.startsWith("/township/create")
      : pathname.startsWith(href);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        backgroundColor: "#0d2240",
        height: 56,
        padding: "0 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: 18,
        zIndex: 30,
      }}
    >
      {/* Brand */}
      <Link
        href="/township/projects"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0d2240",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          CT
        </span>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap" }}>
          Collier Connect <span style={{ color: "#94a3b8", fontWeight: 400 }}>| Township</span>
        </span>
      </Link>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, marginLeft: 6, flexShrink: 0 }}>
        {NAV_ITEMS.map((item) => {
          const on = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                height: 34,
                display: "flex",
                alignItems: "center",
                padding: "0 13px",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: on ? 600 : 500,
                textDecoration: "none",
                background: on ? "rgba(255,255,255,.14)" : "transparent",
                color: on ? "#fff" : "#cbd5e1",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Search — same pill input as the resident header */}
      <div style={{ width: 260, position: "relative", flexShrink: 1, minWidth: 150 }}>
        <button
          onClick={runSearch}
          aria-label="Search"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 12,
            display: "flex",
            alignItems: "center",
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <SearchIcon size={15} />
        </button>
        <input
          type="text"
          value={inputValue}
          placeholder="Search projects"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            width: "100%",
            padding: "8px 30px 8px 34px",
            borderRadius: 9999,
            border: "1px solid transparent",
            fontSize: 13,
            backgroundColor: "#ffffff",
          }}
        />
        {inputValue && (
          <button
            onClick={clearInput}
            aria-label="Clear search"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 10,
              display: "flex",
              alignItems: "center",
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <CloseIcon size={12} />
          </button>
        )}
      </div>

      {/* Preview Resident View */}
      <a
        href="/dashboard"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          height: 34,
          padding: "0 13px",
          borderRadius: 9999,
          border: "1px solid rgba(255,255,255,.2)",
          background: "rgba(255,255,255,.06)",
          color: "#fff",
          fontSize: 12.5,
          fontWeight: 600,
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
          transition: "background 0.15s ease",
        }}
      >
        <EyeIcon size={15} />
        Preview Resident View
      </a>

      {/* AI Assistance toggle */}
      <button
        onClick={toggleAi}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          height: 34,
          padding: "0 13px",
          borderRadius: 9999,
          border: `1px solid ${aiMode ? "#7C3AED" : "rgba(255,255,255,.2)"}`,
          background: aiMode ? "rgba(124,58,237,.25)" : "rgba(255,255,255,.06)",
          color: "#fff",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: aiMode ? "#a78bfa" : "#64748b",
            display: "inline-block",
          }}
        />
        AI Assistance: {aiMode ? "ON" : "OFF"}
      </button>

      {/* Bell */}
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
        }}
      >
        <BellIcon size={20} />
        <span
          style={{
            position: "absolute",
            top: -5,
            right: -7,
            background: "#ef4444",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 9,
            padding: "1px 5px",
            border: "2px solid #0d2240",
          }}
        >
          4
        </span>
      </button>

      {/* Profile */}
      <div ref={profileRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setProfileOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#60a5fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {initialsOf(STAFF_NAME)}
          </span>
          <span style={{ lineHeight: 1.15, textAlign: "left" }}>
            <span style={{ display: "block", color: "#fff", fontSize: 13, fontWeight: 600 }}>
              {STAFF_NAME}
            </span>
            <span style={{ display: "block", color: "#94a3b8", fontSize: 11 }}>{dept}</span>
          </span>
        </button>

        {profileOpen && (
          <div
            style={{
              position: "absolute",
              top: 44,
              right: 0,
              zIndex: 50,
              width: 230,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 20px 44px rgba(2, 12, 27, 0.18)",
              padding: 8,
            }}
          >
            <div
              style={{
                padding: "8px 10px 10px",
                borderBottom: "1px solid #f1f5f9",
                marginBottom: 6,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{STAFF_NAME}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{dept}</div>
            </div>
            <button className="township-menu-item" onClick={() => setProfileOpen(false)}>
              Profile Settings
            </button>
            <button
              className="township-menu-item"
              onClick={() => {
                setDeptSwitchOpen(true);
                setProfileOpen(false);
              }}
            >
              Switch Department
            </button>
            <button
              className="township-menu-item"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              onClick={() => {
                setProfileOpen(false);
                router.push("/township/trash");
              }}
            >
              Trash
              {trashCount > 0 && (
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{trashCount}</span>
              )}
            </button>
            <button
              className="township-menu-item"
              style={{ color: "#dc2626" }}
              onClick={() => {
                setProfileOpen(false);
                router.push("/township");
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Department switcher modal */}
      {deptSwitchOpen && (
        <div
          onClick={() => setDeptSwitchOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 520,
              maxHeight: "80vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: 12,
              padding: 26,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: "#111827" }}>
              Which department are you posting as?
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 18 }}>
              You&apos;ll be posting as this department for all actions this session.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {STAFF_DEPARTMENTS.map((name) => {
                // The switcher list uses a curly apostrophe; session state
                // stores the straight-apostrophe form used across the data.
                const normalized = name === "Manager’s Office" ? "Manager's Office" : name;
                const current = normalized === dept;
                return (
                  <button
                    key={name}
                    onClick={() => {
                      setDept(normalized);
                      setDeptSwitchOpen(false);
                      toast(`Now posting as ${name}`);
                    }}
                    style={{
                      textAlign: "left",
                      padding: "13px 14px",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: current ? "#EFF6FF" : "#f8fafc",
                      border: `1px solid ${current ? "#2563eb" : "#e5e7eb"}`,
                      transition: "background 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0f2d59" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                      {current ? "Current · Manager" : "Staff"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
