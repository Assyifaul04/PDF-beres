// components/admin/tasks/task-error-view.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";

interface Props {
  message: string;
}

export function TaskErrorView({ message }: Props) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <WarningCircleIcon className="h-5 w-5" />
          Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm text-destructive/90 font-mono">
          {message}
        </pre>
      </CardContent>
    </Card>
  );
}