"use client";

// ================================================================
//  StaffContext — portal-wide state for the township staff portal:
//  the project registry, navigation between staff screens, the AI
//  Assistance toggle, posting department, toasts, and the shared
//  lifecycle/moderation actions used from multiple screens.
// ================================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Citation, Comment, Project, Reply, Spotlight } from "./types";
import { seedProjects, SEED_CITATIONS } from "./data";
import { MAX_SPOTLIGHTS, STAFF_NAME } from "./utils";

export type StaffScreen =
  | "login"
  | "projects"
  | "detail"
  | "create"
  | "feedback"
  | "insights"
  | "reports"
  | "trash"
  | "preview";

export type FeedbackSubTab = "private" | "public" | "moderation";
export type ProjTab = "details" | "feedback" | "polls";

interface Toast {
  id: number;
  msg: string;
}

interface OpenProjOpts {
  tab?: ProjTab;
  feedbackSub?: FeedbackSubTab;
  review?: boolean;
}

interface StaffContextValue {
  screen: StaffScreen;
  nav: (screen: StaffScreen) => void;

  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  updateProject: (id: string, fn: (p: Project) => Project) => void;

  citations: Citation[];
  setCitations: React.Dispatch<React.SetStateAction<Citation[]>>;

  aiMode: boolean;
  toggleAi: () => void;
  dept: string;
  setDept: (d: string) => void;

  toasts: Toast[];
  toast: (msg: string) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  activeId: string | null;
  activeProject: Project | null;
  projTab: ProjTab;
  setProjTab: (t: ProjTab) => void;
  feedbackSub: FeedbackSubTab;
  setFeedbackSub: (t: FeedbackSubTab) => void;
  reviewMode: boolean;
  setReviewMode: (v: boolean) => void;

  openProj: (id: string, opts?: OpenProjOpts) => void;
  openPreview: (id: string) => void;
  exitPreview: () => void;
  previewReturn: StaffScreen;

  // Lifecycle actions
  publishProject: (id: string) => void;
  moveToDraft: (id: string) => void;
  markCompleted: (id: string) => void;
  reopenProject: (id: string) => void;
  recallSubmission: (id: string) => void;
  deleteToTrash: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  purgeTrash: (id: string) => void;
  duplicateProject: (id: string) => void;
  submitForReview: (id: string, reviewer: string, urgency: string, note: string) => void;
  reviewApprove: (id: string) => void;
  reviewSendBack: (id: string, type: "changes" | "reject", note: string) => void;
  saveSpotlight: (id: string, sp: Spotlight) => boolean;
  removeSpotlight: (id: string) => void;

  // Comment actions
  addReply: (projId: string, commentId: string, reply: Reply) => void;
  editReply: (projId: string, commentId: string, replyIdx: number, text: string) => void;
  deleteReply: (projId: string, commentId: string, replyIdx: number) => void;
  deleteComment: (projId: string, commentId: string) => void;
  approveComment: (projId: string, commentId: string) => void;
  rejectComment: (projId: string, commentId: string) => void;
  restoreRejected: (projId: string, commentId: string) => void;

  addLog: (projId: string, what: string) => void;
}

const StaffContext = createContext<StaffContextValue | null>(null);

export function useStaff(): StaffContextValue {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used within StaffProvider");
  return ctx;
}

export function StaffProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<StaffScreen>("login");
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [citations, setCitations] = useState<Citation[]>(SEED_CITATIONS);
  const [aiMode, setAiMode] = useState(false);
  const [dept, setDeptState] = useState("Manager's Office");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [projTab, setProjTab] = useState<ProjTab>("details");
  const [feedbackSub, setFeedbackSub] = useState<FeedbackSubTab>("public");
  const [reviewMode, setReviewMode] = useState(false);
  const [previewReturn, setPreviewReturn] = useState<StaffScreen>("projects");
  const lastTab = useRef<Record<string, ProjTab>>({});

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((item) => item.id !== id)), 2600);
  }, []);

  const nav = useCallback((s: StaffScreen) => {
    setScreen(s);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const updateProject = useCallback((id: string, fn: (p: Project) => Project) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  const addLog = useCallback(
    (projId: string, what: string) => {
      updateProject(projId, (p) => ({
        ...p,
        log: [{ who: STAFF_NAME, when: "just now", what }, ...p.log],
      }));
    },
    [updateProject]
  );

  const toggleAi = useCallback(() => {
    toast(`AI Assistance ${!aiMode ? "ON" : "OFF"}`);
    setAiMode(!aiMode);
  }, [aiMode, toast]);

  const setDept = useCallback(
    (d: string) => {
      setDeptState(d);
      toast(`Now posting as ${d}`);
    },
    [toast]
  );

  const openProj = useCallback(
    (id: string, opts?: OpenProjOpts) => {
      setActiveId(id);
      const tab = opts?.tab ?? lastTab.current[id] ?? "details";
      setProjTab(tab);
      lastTab.current[id] = tab;
      if (opts?.feedbackSub) setFeedbackSub(opts.feedbackSub);
      else setFeedbackSub("public");
      setReviewMode(!!opts?.review);
      nav("detail");
    },
    [nav]
  );

  const openPreview = useCallback(
    (id: string) => {
      setActiveId(id);
      setPreviewReturn(screen === "preview" ? "projects" : screen);
      nav("preview");
    },
    [nav, screen]
  );

  const exitPreview = useCallback(() => {
    nav(previewReturn === "preview" ? "projects" : previewReturn);
  }, [nav, previewReturn]);

  const activeProject = projects.find((p) => p.id === activeId) ?? null;

  // ── Lifecycle actions ──────────────────────────────────────────

  const publishProject = useCallback(
    (id: string) => {
      updateProject(id, (p) => ({ ...p, lc: "published", status: "Active" }));
      addLog(id, "Published project to residents");
      toast("Project published to residents");
    },
    [updateProject, addLog, toast]
  );

  const moveToDraft = useCallback(
    (id: string) => {
      updateProject(id, (p) => ({
        ...p,
        lc: "draft",
        status: "Draft",
        prevPublishedDate: "Jul 14, 2026",
        prevPublishedBy: STAFF_NAME,
      }));
      addLog(id, "Moved this project to Draft");
      toast("Project moved to Draft — no longer visible to residents");
    },
    [updateProject, addLog, toast]
  );

  const markCompleted = useCallback(
    (id: string) => {
      updateProject(id, (p) => ({
        ...p,
        lc: "completed",
        status: "Completed",
        completedDate: "Jul 2026",
      }));
      addLog(id, "Marked project as Completed");
      toast("Project marked as Completed");
    },
    [updateProject, addLog, toast]
  );

  const reopenProject = useCallback(
    (id: string) => {
      updateProject(id, (p) => ({
        ...p,
        lc: "published",
        status: "Active",
        reopenedDate: "Jul 8, 2026",
        reopenedBy: STAFF_NAME,
      }));
      addLog(id, "Reopened this project");
      toast("Project reopened");
    },
    [updateProject, addLog, toast]
  );

  const recallSubmission = useCallback(
    (id: string) => {
      updateProject(id, (p) => ({
        ...p,
        lc: "draft",
        status: "Draft",
        rejectedSub: false,
      }));
      addLog(id, "Recalled submission to edit");
      toast("Submission recalled — the project is back in Draft");
    },
    [updateProject, addLog, toast]
  );

  const deleteToTrash = useCallback(
    (id: string) => {
      updateProject(id, (p) => ({
        ...p,
        prevLc: p.lc,
        lc: "trash",
        trashedDate: "just now",
        spotlight: null,
      }));
      toast("Moved to Trash — restore within 30 days");
      nav("projects");
    },
    [updateProject, toast, nav]
  );

  const restoreFromTrash = useCallback(
    (id: string) => {
      updateProject(id, (p) => ({
        ...p,
        lc: p.prevLc && p.prevLc !== "trash" ? p.prevLc : "draft",
        trashedDate: undefined,
      }));
      toast("Project restored");
    },
    [updateProject, toast]
  );

  const purgeTrash = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast("Project permanently deleted");
    },
    [toast]
  );

  const duplicateProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        const src = prev.find((p) => p.id === id);
        if (!src) return prev;
        const dupId = `dup-${Date.now()}`;
        const dup: Project = {
          ...src,
          id: dupId,
          title: `${src.title} (Copy)`,
          lc: "draft",
          status: "Draft",
          edited: "just now",
          followers: 0,
          spotlight: null,
          polls: [],
          sentiment: { supportive: 0, mixed: 0, concerns: 0 },
          themes: [],
          privateMsgs: [],
          public: [],
          hidden: [],
          rejected: [],
          log: [{ who: STAFF_NAME, when: "just now", what: "Created project (duplicate)" }],
          stages: src.stages.map((s) => ({ ...s, bullets: [...s.bullets] })),
          submittedBy: undefined,
          submittedDate: undefined,
          reviewFeedback: undefined,
          rejectedSub: undefined,
        };
        setActiveId(dupId);
        return [dup, ...prev];
      });
      setProjTab("details");
      setReviewMode(false);
      nav("detail");
      toast("Project duplicated as a draft");
    },
    [nav, toast]
  );

  const submitForReview = useCallback(
    (id: string, reviewer: string, urgency: string, note: string) => {
      updateProject(id, (p) => ({
        ...p,
        lc: "pending",
        status: "In Review",
        submittedBy: STAFF_NAME,
        submittedDept: dept,
        submittedDate: "just now",
        reviewer,
        urgency: urgency as Project["urgency"],
        srNote: note,
        rejectedSub: false,
        reviewFeedback: undefined,
      }));
      addLog(id, `Submitted for review to ${reviewer}`);
      toast(`Sent to ${reviewer} for review`);
    },
    [updateProject, addLog, dept, toast]
  );

  const reviewApprove = useCallback(
    (id: string) => {
      const p = projects.find((x) => x.id === id);
      updateProject(id, (x) => ({ ...x, lc: "published", status: "Active" }));
      addLog(id, `Approved and published (review by ${STAFF_NAME})`);
      toast(`Approved and published — ${p?.submittedBy ?? "the creator"} notified`);
      setReviewMode(false);
      nav("projects");
    },
    [projects, updateProject, addLog, toast, nav]
  );

  const reviewSendBack = useCallback(
    (id: string, type: "changes" | "reject", note: string) => {
      updateProject(id, (p) => ({
        ...p,
        lc: type === "changes" ? "draft" : "pending",
        status: type === "changes" ? "Draft" : p.status,
        rejectedSub: type === "reject",
        reviewFeedback: { type, by: STAFF_NAME, note, when: "just now" },
      }));
      addLog(id, type === "changes" ? "Requested changes from the creator" : "Rejected this submission");
      toast(type === "changes" ? "Changes requested — the creator was notified" : "Submission rejected — the creator was notified");
      setReviewMode(false);
      nav("projects");
    },
    [updateProject, addLog, toast, nav]
  );

  const saveSpotlight = useCallback(
    (id: string, sp: Spotlight): boolean => {
      const activeCount = projects.filter((p) => p.spotlight && p.id !== id).length;
      if (activeCount >= MAX_SPOTLIGHTS) {
        toast(`You already have ${MAX_SPOTLIGHTS} projects spotlighted`);
        return false;
      }
      updateProject(id, (p) => ({ ...p, spotlight: sp }));
      addLog(id, "Spotlighted this project for residents");
      toast("Project spotlighted for residents");
      return true;
    },
    [projects, updateProject, addLog, toast]
  );

  const removeSpotlight = useCallback(
    (id: string) => {
      updateProject(id, (p) => ({ ...p, spotlight: null }));
      addLog(id, "Removed the spotlight");
      toast("Spotlight removed");
    },
    [updateProject, addLog, toast]
  );

  // ── Comment actions ────────────────────────────────────────────

  const mapComments = useCallback(
    (projId: string, fn: (list: Comment[]) => Comment[]) => {
      updateProject(projId, (p) => ({
        ...p,
        public: fn(p.public),
        privateMsgs: fn(p.privateMsgs),
        hidden: fn(p.hidden),
        rejected: fn(p.rejected),
      }));
    },
    [updateProject]
  );

  const addReply = useCallback(
    (projId: string, commentId: string, reply: Reply) => {
      mapComments(projId, (list) =>
        list.map((c) => (c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c))
      );
    },
    [mapComments]
  );

  const editReply = useCallback(
    (projId: string, commentId: string, replyIdx: number, text: string) => {
      mapComments(projId, (list) =>
        list.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: c.replies.map((r, i) =>
                  i === replyIdx ? { ...r, text, edited: true } : r
                ),
              }
            : c
        )
      );
    },
    [mapComments]
  );

  const deleteReply = useCallback(
    (projId: string, commentId: string, replyIdx: number) => {
      mapComments(projId, (list) =>
        list.map((c) =>
          c.id === commentId
            ? { ...c, replies: c.replies.filter((_, i) => i !== replyIdx) }
            : c
        )
      );
      toast("Reply deleted");
    },
    [mapComments, toast]
  );

  const deleteComment = useCallback(
    (projId: string, commentId: string) => {
      mapComments(projId, (list) => list.filter((c) => c.id !== commentId));
      toast("Comment deleted");
    },
    [mapComments, toast]
  );

  const approveComment = useCallback(
    (projId: string, commentId: string) => {
      updateProject(projId, (p) => {
        const c = p.hidden.find((x) => x.id === commentId);
        if (!c) return p;
        return {
          ...p,
          hidden: p.hidden.filter((x) => x.id !== commentId),
          public: [{ ...c, flag: null }, ...p.public],
        };
      });
      toast("Comment approved and published");
    },
    [updateProject, toast]
  );

  const rejectComment = useCallback(
    (projId: string, commentId: string) => {
      updateProject(projId, (p) => {
        const c =
          p.hidden.find((x) => x.id === commentId) ??
          p.public.find((x) => x.id === commentId);
        if (!c) return p;
        return {
          ...p,
          hidden: p.hidden.filter((x) => x.id !== commentId),
          public: p.public.filter((x) => x.id !== commentId),
          rejected: [c, ...p.rejected],
        };
      });
      toast("Comment rejected — kept in the audit log");
    },
    [updateProject, toast]
  );

  const restoreRejected = useCallback(
    (projId: string, commentId: string) => {
      updateProject(projId, (p) => {
        const c = p.rejected.find((x) => x.id === commentId);
        if (!c) return p;
        return {
          ...p,
          rejected: p.rejected.filter((x) => x.id !== commentId),
          public: [{ ...c, flag: null }, ...p.public],
        };
      });
      toast("Comment restored to the forum");
    },
    [updateProject, toast]
  );

  const value: StaffContextValue = {
    screen,
    nav,
    projects,
    setProjects,
    updateProject,
    citations,
    setCitations,
    aiMode,
    toggleAi,
    dept,
    setDept,
    toasts,
    toast,
    searchQuery,
    setSearchQuery,
    activeId,
    activeProject,
    projTab,
    setProjTab,
    feedbackSub,
    setFeedbackSub,
    reviewMode,
    setReviewMode,
    openProj,
    openPreview,
    exitPreview,
    previewReturn,
    publishProject,
    moveToDraft,
    markCompleted,
    reopenProject,
    recallSubmission,
    deleteToTrash,
    restoreFromTrash,
    purgeTrash,
    duplicateProject,
    submitForReview,
    reviewApprove,
    reviewSendBack,
    saveSpotlight,
    removeSpotlight,
    addReply,
    editReply,
    deleteReply,
    deleteComment,
    approveComment,
    rejectComment,
    restoreRejected,
    addLog,
  };

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}
