// components/admin/system/log-level-badge.tsx
import { Badge } from "@/components/ui/badge";
import {
  WarningCircleIcon,
  WarningIcon,
  InfoIcon,
  BugIcon,
} from "@phosphor-icons/react/dist/ssr";

interface Props {
  level: string;
}

export function LogLevelBadge({ level }: Props) {
  const config: Record<
    string,
    { variant: "default" | "destructive" | "outline" | "secondary"; icon: React.ReactNode }
  > = {
    error: {
      variant: "destructive",
      icon: <WarningCircleIcon className="h-3 w-3" />,
    },
    warn: {
      variant: "outline",
      icon: <WarningIcon className="h-3 w-3 text-amber-600" />,
    },
    info: {
      variant: "secondary",
      icon: <InfoIcon className="h-3 w-3 text-blue-500" />,
    },
    debug: {
      variant: "outline",
      icon: <BugIcon className="h-3 w-3 text-muted-foreground" />,
    },
  };

  const c = config[level] ?? { variant: "outline" as const, icon: null };

  return (
    <Badge variant={c.variant} className="gap-1">
      {c.icon}
      {level}
    </Badge>
  );
}