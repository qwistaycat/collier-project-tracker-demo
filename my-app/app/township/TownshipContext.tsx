"use client";

// ================================================================
//  TownshipContext — session state for the staff-facing side.
//  Holds the mutable project registry (seeded once per session),
//  the AI-assistance toggle, the acting department, citations for
//  the Reports page, and the toast queue. Screens read projects
//  and mutate through updateProject/setProjects with functional
//  updates; there is deliberately no per-action API here so each
//  screen owns its own behavior.
// ================================================================

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  seedProjects,
  seedCitations,
  DEFAULT_DEPT,
  type Citation,
  type StaffProject,
} from "./data";

interface Toast {
  id: number;
  msg: string;
}

interface TownshipState {
  projects: StaffProject[];
  setProjects: React.Dispatch<React.SetStateAction<StaffProject[]>>;
  /** Immutable helper: replace one project via updater. */
  updateProject: (id: string, updater: (p: StaffProject) => StaffProject) => void;
  getProject: (id: string | null | undefined) => StaffProject | undefined;
  citations: Citation[];
  setCitations: React.Dispatch<React.SetStateAction<Citation[]>>;
  aiMode: boolean;
  setAiMode: React.Dispatch<React.SetStateAction<boolean>>;
  dept: string;
  setDept: React.Dispatch<React.SetStateAction<string>>;
  toasts: Toast[];
  toast: (msg: string) => void;
}

const TownshipContext = createContext<TownshipState | null>(null);

export function TownshipProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<StaffProject[]>(seedProjects);
  const [citations, setCitations] = useState<Citation[]>(seedCitations);
  const [aiMode, setAiMode] = useState(false);
  const [dept, setDept] = useState(DEFAULT_DEPT);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((msg: string) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts, { id, msg }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 2600);
  }, []);

  const updateProject = useCallback(
    (id: string, updater: (p: StaffProject) => StaffProject) => {
      setProjects((ps) => ps.map((p) => (p.id === id ? updater(p) : p)));
    },
    []
  );

  const getProject = useCallback(
    (id: string | null | undefined) => projects.find((p) => p.id === id),
    [projects]
  );

  return (
    <TownshipContext.Provider
      value={{
        projects,
        setProjects,
        updateProject,
        getProject,
        citations,
        setCitations,
        aiMode,
        setAiMode,
        dept,
        setDept,
        toasts,
        toast,
      }}
    >
      {children}
    </TownshipContext.Provider>
  );
}

export function useTownship(): TownshipState {
  const ctx = useContext(TownshipContext);
  if (!ctx) throw new Error("useTownship must be used within TownshipProvider");
  return ctx;
}
