"use client";

// ================================================================
//  Township login — simulated staff sign-in. Credentials are
//  prefilled and not validated; Sign In lands on the projects
//  gallery. Adapted from the prototype's gradient login to the
//  flat design system (solid navy canvas, white card).
// ================================================================

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { STAFF_EMAIL } from "./data";

export default function TownshipLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(STAFF_EMAIL);
  const [password, setPassword] = useState("password");

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#475569",
    display: "block",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "0 12px",
    fontSize: 14,
    color: "#111827",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d2240",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 380,
          background: "#fff",
          borderRadius: 12,
          padding: "38px 34px",
          boxShadow: "0 24px 60px rgba(2, 12, 27, 0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            marginBottom: 26,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <Image src="/logo.png" alt="Collier Blueprint Logo" width={56} height={56} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f2d59" }}>
            Collier Blueprint Township
          </div>
        </div>

        <label style={labelStyle}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ ...inputStyle, marginBottom: 16 }}
        />
        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...inputStyle, marginBottom: 22 }}
        />
        <button
          onClick={() => router.push("/township/projects")}
          style={{
            width: "100%",
            height: 44,
            background: "#0d2240",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.15s ease",
          }}
        >
          Sign In
        </button>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <a href="#" style={{ fontSize: 13, color: "#2563eb" }}>
            Forgot password?
          </a>
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          Access is provisioned by your township administrator.
        </div>
      </div>
    </main>
  );
}
