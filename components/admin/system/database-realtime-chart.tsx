// components/admin/system/database-realtime-chart.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

interface HourlyPoint {
  hour: string;
  count: number;
}

interface Props {
  initialData: HourlyPoint[];
  /** Interval refresh dalam ms — default 10 detik */
  refreshInterval?: number;
}

export function DatabaseRealtimeChart({
  initialData,
  refreshInterval = 10000,
}: Props) {
  const [data, setData] = useState<HourlyPoint[]>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/system/database/activity", {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.data ?? []);
          setLastUpdate(new Date());
        }
      } catch {
        // silent
      }
    }

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  function manualRefresh() {
    startTransition(async () => {
      const res = await fetch("/api/admin/system/database/activity", {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data ?? []);
        setLastUpdate(new Date());
      }
    });
  }

  const total = data.reduce((s, p) => s + p.count, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            Aktivitas 24 Jam
            <Badge variant="outline" className="gap-1 text-[10px]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Live
            </Badge>
          </CardTitle>
          <CardDescription>
            Total {total.toLocaleString("id-ID")} log · Update{" "}
            {lastUpdate.toLocaleTimeString("id-ID")}
          </CardDescription>
        </div>
        <button
          type="button"
          onClick={manualRefresh}
          disabled={isPending}
          aria-label="Refresh"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          <ArrowsClockwiseIcon
            className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
          />
        </button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--popover))",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}