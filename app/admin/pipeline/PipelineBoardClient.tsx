"use client";

import { useMemo, useState } from "react";
import type { PipelineTask } from "@/lib/pipeline-data";

type PipelineBoardClientProps = {
  tasks: PipelineTask[];
};

function statusClass(status: PipelineTask["status"]) {
  if (status === "DONE") {
    return "bg-emerald-400/15 text-emerald-200";
  }
  if (status === "DOING") {
    return "bg-amber-400/15 text-amber-200";
  }
  return "bg-slate-200/15 text-slate-200";
}

export default function PipelineBoardClient({ tasks }: PipelineBoardClientProps) {
  const [copied, setCopied] = useState("");
  const nextPromptTask = useMemo(
    () => tasks.find((task) => task.status === "DOING" && task.nextPrompt) ?? tasks.find((task) => task.nextPrompt),
    [tasks]
  );

  async function copyPrompt() {
    if (!nextPromptTask?.nextPrompt) {
      return;
    }
    await navigator.clipboard.writeText(nextPromptTask.nextPrompt);
    setCopied(nextPromptTask.id);
    window.setTimeout(() => setCopied(""), 1600);
  }

  return (
    <section className="admin-card space-y-4 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Task Board</h2>
        {nextPromptTask?.nextPrompt ? (
          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold"
          >
            {copied === nextPromptTask.id ? "Prompt Copied" : "Copy Next Task Prompt"}
          </button>
        ) : null}
      </div>
      <div className="overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-[var(--color-alt-bg)] text-xs uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              <th className="rounded-l-xl px-3 py-2">ID</th>
              <th className="px-3 py-2">Phase</th>
              <th className="px-3 py-2">Task</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Dependencies</th>
              <th className="rounded-r-xl px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-[var(--color-border)] align-top odd:bg-transparent even:bg-[var(--color-alt-bg)]/40">
                <td className="px-3 py-3 font-semibold text-[var(--color-text-primary)]">{task.id}</td>
                <td className="px-3 py-3">{task.phase}</td>
                <td className="px-3 py-3 text-[var(--color-text-primary)]">{task.title}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(task.status)}`}>{task.status}</span>
                </td>
                <td className="px-3 py-3 text-xs font-semibold">{task.priority}</td>
                <td className="px-3 py-3">{task.owner}</td>
                <td className="px-3 py-3 text-xs">{task.dependsOn.length ? task.dependsOn.join(", ") : "-"}</td>
                <td className="px-3 py-3 text-xs text-[var(--color-text-secondary)]">{task.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
