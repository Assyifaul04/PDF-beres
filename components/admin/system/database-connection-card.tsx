// components/admin/system/database-connection-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDatabaseHealth } from "@/lib/queries/system";
import {
  CheckCircleIcon,
  WarningCircleIcon,
  DatabaseIcon,
} from "@phosphor-icons/react/dist/ssr";

export async function DatabaseConnectionCard() {
  const health = await getDatabaseHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DatabaseIcon className="h-5 w-5" />
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Database</span>
          <Badge variant={health.dbOk ? "default" : "destructive"} className="gap-1">
            {health.dbOk ? (
              <>
                <CheckCircleIcon className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <WarningCircleIcon className="h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Latency</span>
          <span className="font-mono text-sm">
            {health.dbLatencyMs} ms
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Provider</span>
          <span className="font-mono text-sm">PostgreSQL</span>
        </div>
      </CardContent>
    </Card>
  );
}