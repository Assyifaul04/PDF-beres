// components/admin/settings/settings-shell.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  GearIcon,
  DatabaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react/dist/ssr";

const TABS = [
  { href: "/admin/settings/general", label: "General", icon: GearIcon },
  { href: "/admin/settings/storage", label: "Storage", icon: DatabaseIcon },
  { href: "/admin/settings/retention", label: "Retention", icon: ClockIcon },
  { href: "/admin/settings/plans", label: "Plans & Pricing", icon: CurrencyDollarIcon },
];

interface Props {
  current: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SettingsShell({ current, title, description, children }: Props) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Tab nav */}
      <nav className="flex flex-wrap gap-1 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = current === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors -mb-px",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div>{children}</div>
    </div>
  );
}