"use client";

// ================================================================
//  /staff — the Township Staff portal entry. Wraps everything in
//  StaffProvider and switches between the login screen and the
//  portal shell (navbar + active screen). Ported from the Collier
//  Connect Staff v2 prototype, restyled to the project design
//  system and split into screens under ./screens.
// ================================================================

import React, { useState } from "react";
import { StaffProvider, useStaff } from "./lib/StaffContext";
import { STAFF_NAME } from "./lib/utils";
import StaffNavbar from "./components/StaffNavbar";
import { Toasts } from "./components/ui";
import ProjectsGallery from "./screens/ProjectsGallery";
import TrashScreen from "./screens/TrashScreen";
import ProjectDetail from "./screens/detail/ProjectDetail";
import CreateWizard from "./screens/CreateWizard";
import FeedbackCenter from "./screens/FeedbackCenter";
import InsightsScreen from "./screens/InsightsScreen";
import ReportsScreen from "./screens/ReportsScreen";
import ResidentPreview from "./screens/ResidentPreview";

export default function StaffPortalPage() {
  return (
    <StaffProvider>
      <StaffPortal />
    </StaffProvider>
  );
}

function StaffPortal() {
  const { screen, nav, toast } = useStaff();
  const [catFilter, setCatFilter] = useState("All");

  if (screen === "login") {
    return (
      <>
        <LoginScreen
          onLogin={() => {
            nav("projects");
            toast(`Signed in as ${STAFF_NAME}`);
          }}
        />
        <Toasts />
      </>
    );
  }

  if (screen === "preview") {
    return (
      <>
        <ResidentPreview />
        <Toasts />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] antialiased">
      <StaffNavbar onCategoryPick={setCatFilter} />
      {screen === "projects" && (
        <ProjectsGallery catFilter={catFilter} setCatFilter={setCatFilter} />
      )}
      {screen === "trash" && <TrashScreen />}
      {screen === "detail" && <ProjectDetail />}
      {screen === "create" && <CreateWizard />}
      {screen === "feedback" && <FeedbackCenter />}
      {screen === "insights" && <InsightsScreen />}
      {screen === "reports" && <ReportsScreen />}
      <Toasts />
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1E3A5F] to-[#0F2942]">
      <div className="w-[380px] rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3A5F] text-xl font-bold tracking-wide text-white">
            CT
          </div>
          <h1 className="text-xl font-bold text-[#1E3A5F]">Collier Connect Staff</h1>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold text-[#475569]">Email</label>
          <input
            type="text"
            readOnly
            value="amy.medway@colliertwp.gov"
            className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm text-[#0F172A] outline-none"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-xs font-semibold text-[#475569]">Password</label>
          <input
            type="password"
            readOnly
            value="password"
            className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm text-[#0F172A] outline-none"
          />
        </div>
        <button
          onClick={onLogin}
          className="h-11 w-full cursor-pointer rounded-lg border-none bg-[#1E3A5F] text-sm font-semibold text-white transition-colors hover:bg-[#152a45]"
        >
          Sign In
        </button>
        <button className="mt-3 w-full cursor-pointer border-none bg-transparent text-center text-xs font-medium text-[#2563EB] hover:underline">
          Forgot password?
        </button>
        <p className="mt-5 text-center text-xs text-[#94A3B8]">
          Access is provisioned by your township administrator.
        </p>
      </div>
    </div>
  );
}
