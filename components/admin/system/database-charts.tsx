// components/admin/system/database-charts.tsx
"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ClockCounterClockwiseIcon,
  ChartBarIcon,
  ChartPieIcon,
  PulseIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react";

// ==============================================================================
// TYPES
// ==============================================================================

interface TimelinePoint {
  date: string;
  error: number;
  warn: number;
  info: number;
  debug: number;
  total: number;
}

interface TableStat {
  name: string;
  count: number;
}

interface HourlyPoint {
  hour: string;
  count: number;
}

interface LogsStats {
  total: number;
  errorTotal: number;
  warnTotal: number;
  infoTotal: number;
  debugTotal: number;
  last24hCount?: number;
  last7dCount?: number;
  errorLast24h?: number;
}

interface MetricsResponse {
  timeline: TimelinePoint[];
  tableStats: TableStat[];
  hourly: HourlyPoint[];
  logsStats: LogsStats;
  health: {
    dbOk: boolean;
    dbLatencyMs: number;
  };
  timestamp: string;
}

const EMPTY_STATS: LogsStats = {
  total: 0,
  errorTotal: 0,
  warnTotal: 0,
  infoTotal: 0,
  debugTotal: 0,
};

const LEVEL_COLORS: Record<string, string> = {
  error: "#ef4444",
  warn: "#f59e0b",
  info: "#3b82f6",
  debug: "#94a3b8",
};

const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#94a3b8"];

// ==============================================================================
// COMPONENT
// ==============================================================================

export function DatabaseCharts() {
  const [data, setData] = React.useState<MetricsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [lastUpdate, setLastUpdate] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  const fetchMetrics = React.useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/system/database/metrics");
      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();

      // ✅ Handle 2 bentuk: { data: {...} } atau langsung { ... }
      const payload: MetricsResponse = json.data ?? json;

      // ✅ Pastikan array & object tidak undefined
      const normalized: MetricsResponse = {
        timeline: payload.timeline ?? [],
        tableStats: payload.tableStats ?? [],
        hourly: payload.hourly ?? [],
        logsStats: payload.logsStats ?? EMPTY_STATS,
        health: payload.health ?? { dbOk: false, dbLatencyMs: 0 },
        timestamp: payload.timestamp ?? new Date().toISOString(),
      };

      setData(normalized);
      setLastUpdate(new Date().toLocaleTimeString("id-ID"));
    } catch (err) {
      console.error("Gagal fetch metrics:", err);
      setError("Gagal memuat metrik");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch awal
  React.useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh tiap 30 detik
  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchMetrics, 30_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMetrics]);

  // ============================================================================
  // LOADING
  // ============================================================================
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-80 animate-pulse rounded-lg border bg-muted/20" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg border bg-muted/20" />
          <div className="h-80 animate-pulse rounded-lg border bg-muted/20" />
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR
  // ============================================================================
  if (error || !data) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-destructive">
            {error ?? "Data metrik tidak tersedia"}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={fetchMetrics}
          >
            <ArrowsClockwiseIcon className="mr-1 h-3 w-3" />
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // DERIVED DATA
  // ============================================================================
  const logsStats = data.logsStats ?? EMPTY_STATS;

  const pieData = [
    { name: "Error", value: logsStats.errorTotal },
    { name: "Warning", value: logsStats.warnTotal },
    { name: "Info", value: logsStats.infoTotal },
    { name: "Debug", value: logsStats.debugTotal },
  ].filter((d) => d.value > 0);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <div className="flex items-center gap-3">
          <Badge
            variant={data.health.dbOk ? "default" : "destructive"}
            className="gap-1"
          >
            <PulseIcon className="h-3 w-3" />
            {data.health.dbOk ? "Live" : "Down"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Latency: <strong>{data.health.dbLatencyMs}ms</strong>
            {lastUpdate && (
              <>
                {" "}
                · Last update: <strong>{lastUpdate}</strong>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-xs cursor-pointer">
              Auto (30s)
            </Label>
          </div>
          <Button size="sm" variant="outline" onClick={fetchMetrics}>
            <ArrowsClockwiseIcon className="mr-1 h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Timeline Log 7 Hari */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClockCounterClockwiseIcon className="h-4 w-4" />
            Log Timeline (7 Hari)
          </CardTitle>
          <CardDescription>
            Distribusi log per hari berdasarkan level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {data.timeline.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Belum ada data log
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeline}>
                  <defs>
                    <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={LEVEL_COLORS.error}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={LEVEL_COLORS.error}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorWarn" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={LEVEL_COLORS.warn}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={LEVEL_COLORS.warn}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={LEVEL_COLORS.info}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={LEVEL_COLORS.info}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => String(v).slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="error"
                    stackId="1"
                    stroke={LEVEL_COLORS.error}
                    fill="url(#colorError)"
                    name="Error"
                  />
                  <Area
                    type="monotone"
                    dataKey="warn"
                    stackId="1"
                    stroke={LEVEL_COLORS.warn}
                    fill="url(#colorWarn)"
                    name="Warn"
                  />
                  <Area
                    type="monotone"
                    dataKey="info"
                    stackId="1"
                    stroke={LEVEL_COLORS.info}
                    fill="url(#colorInfo)"
                    name="Info"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2 Kolom: Pie + Bar */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pie — Distribusi Level Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartPieIcon className="h-4 w-4" />
              Distribusi Level Log
            </CardTitle>
            <CardDescription>Proporsi tiap level log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {pieData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Belum ada log
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bar — Statistik Tabel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartBarIcon className="h-4 w-4" />
              Statistik Tabel
            </CardTitle>
            <CardDescription>Jumlah row per tabel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {data.tableStats.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Belum ada data
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.tableStats}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aktivitas 24 Jam */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PulseIcon className="h-4 w-4" />
            Aktivitas 24 Jam Terakhir
          </CardTitle>
          <CardDescription>Jumlah log per jam (real-time)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            {data.hourly.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Tidak ada aktivitas 24 jam terakhir
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.hourly}>
                  <defs>
                    <linearGradient
                      id="colorHourly"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorHourly)"
                    name="Log"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}