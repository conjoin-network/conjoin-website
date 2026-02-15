export type PipelineStatus = "TODO" | "DOING" | "DONE";
export type PipelinePriority = "P0" | "P1" | "P2" | "P3";

export type PipelineTask = {
  id: string;
  phase: string;
  title: string;
  status: PipelineStatus;
  owner: string;
  priority: PipelinePriority;
  dependsOn: string[];
  notes: string;
  nextPrompt?: string;
};

export const PIPELINE_TASKS: PipelineTask[] = [
  {
    id: "C0",
    phase: "Cleanup",
    title: "Remove invalid nested absolute paths under src",
    status: "DONE",
    owner: "Codex",
    priority: "P0",
    dependsOn: [],
    notes: "Re-audited src tree for /Users/msleox path artifacts; none remain."
  },
  {
    id: "G0-UI-01",
    phase: "Go-live UI",
    title: "Logo size + tagline authority pass",
    status: "DONE",
    owner: "Codex",
    priority: "P0",
    dependsOn: ["C0"],
    notes: "Increased logo visibility, tightened header spacing, upgraded enterprise tagline."
  },
  {
    id: "G0-UI-02",
    phase: "Go-live UI",
    title: "Hero white panel readability",
    status: "DONE",
    owner: "Codex",
    priority: "P0",
    dependsOn: ["G0-UI-01"],
    notes: "Forced dark text hierarchy for white slide cards and maintained readable control contrast."
  },
  {
    id: "G0-UI-03",
    phase: "Go-live UI",
    title: "Mobile hero slider clipping guard",
    status: "DONE",
    owner: "Codex",
    priority: "P0",
    dependsOn: ["G0-UI-02"],
    notes: "Expanded mobile-safe carousel spacing and slide minimum height."
  },
  {
    id: "G0-NAV-01",
    phase: "Go-live UI",
    title: "Mobile hamburger reliability",
    status: "DONE",
    owner: "Codex",
    priority: "P0",
    dependsOn: ["G0-UI-01"],
    notes: "Toggle behavior, overlay/backdrop, escape close, and body scroll lock verified."
  },
  {
    id: "G0-NAV-02",
    phase: "Go-live UI",
    title: "Header micro-polish",
    status: "DONE",
    owner: "Codex",
    priority: "P0",
    dependsOn: ["G0-NAV-01"],
    notes: "Animated nav underline, thin divider, and scroll blur behavior added."
  },
  {
    id: "A1",
    phase: "Visibility",
    title: "Pipeline board in admin",
    status: "DONE",
    owner: "Codex",
    priority: "P0",
    dependsOn: [],
    notes: "Pipeline markdown + /admin/pipeline with status counts.",
    nextPrompt: "Start P0-01 RFQ reliability hardening and prove with QA screenshots."
  },
  {
    id: "P0-01",
    phase: "Revenue Blockers",
    title: "RFQ submission reliability and persistence",
    status: "DONE",
    owner: "Codex",
    priority: "P0",
    dependsOn: ["A1"],
    notes: "API retries, loading UX, leadId success feedback, persistence checks.",
    nextPrompt: "Finalize RFQ retry+error mapping and capture submit success + CRM proof screenshots."
  },
  {
    id: "P0-02",
    phase: "Revenue Blockers",
    title: "Event log and audit trail foundation",
    status: "DONE",
    owner: "Codex",
    priority: "P0",
    dependsOn: ["P0-01"],
    notes: "Track lead create/assign/status/note/email/whatsapp events and expose /admin/events.",
    nextPrompt: "Wire event logging into quote + admin patch flows and add admin events page filters."
  },
  {
    id: "P1-01",
    phase: "AI CRM",
    title: "AI lead summary in lead detail",
    status: "DOING",
    owner: "Codex",
    priority: "P1",
    dependsOn: ["P0-02"],
    notes: "Generate concise summary + next action + priority label with graceful fallback."
  },
  {
    id: "P1-02",
    phase: "AI CRM",
    title: "AI email draft for quote response",
    status: "TODO",
    owner: "Codex",
    priority: "P1",
    dependsOn: ["P1-01"],
    notes: "Produce subject/body draft, copy action, save in lead notes."
  },
  {
    id: "P1-03",
    phase: "AI CRM",
    title: "AI objection reply chips",
    status: "TODO",
    owner: "Codex",
    priority: "P1",
    dependsOn: ["P1-01"],
    notes: "Short and long reply generation for common sales objections."
  },
  {
    id: "P2-01",
    phase: "Automation",
    title: "SLA rules engine and lead tasks",
    status: "TODO",
    owner: "Codex",
    priority: "P2",
    dependsOn: ["P0-02"],
    notes: "Auto task creation by lead score with overdue widget."
  },
  {
    id: "P2-02",
    phase: "Automation",
    title: "Follow-up sequences + automation runner",
    status: "TODO",
    owner: "Codex",
    priority: "P2",
    dependsOn: ["P2-01"],
    notes: "Cron-safe follow-up processing with manual run fallback."
  },
  {
    id: "P2-03",
    phase: "Automation",
    title: "Round-robin assignment",
    status: "TODO",
    owner: "Codex",
    priority: "P2",
    dependsOn: ["P2-01"],
    notes: "Distribute new leads by least load among active agents."
  },
  {
    id: "P3-01",
    phase: "Sales Acceleration",
    title: "Quote builder v1",
    status: "TODO",
    owner: "Codex",
    priority: "P3",
    dependsOn: ["P2-01"],
    notes: "Unit pricing + discount + tax + printable quote snapshot."
  },
  {
    id: "P3-02",
    phase: "Sales Acceleration",
    title: "UTM capture and source filtering",
    status: "TODO",
    owner: "Codex",
    priority: "P3",
    dependsOn: ["P0-01"],
    notes: "Capture and filter by utm_source, campaign, and term."
  }
];

export const PIPELINE_NOW = ["P1-01"];
export const PIPELINE_NEXT = ["P1-02", "P1-03", "P2-01"];
export const PIPELINE_LATER = ["P2-02", "P2-03", "P3-01", "P3-02"];
