// components/admin/tasks/task-settings-view.tsx
"use client";

interface Props {
  settings: unknown;
}

export function TaskSettingsView({ settings }: Props) {
  return (
    <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs font-mono">
      {JSON.stringify(settings, null, 2)}
    </pre>
  );
}