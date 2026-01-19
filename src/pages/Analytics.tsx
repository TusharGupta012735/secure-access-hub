import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { KPICard } from "@/components/dashboard/KPICard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle2,
  MapPin,
  X,
  Calendar,
  LineChartIcon,
  RefreshCw,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  Line,
  LineChart,
} from "recharts";
import { useAttendanceStore } from "@/store/useAttendanceStore";
import { useAttendanceDeniedStore } from "@/store/useAttendanceDeniedStore";

const Analytics = () => {
  const [userRole] = useState("admin");
  const [searchEvent, setSearchEvent] = useState("");

  // Allowed + Denied data
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [deniedAnalyticsData, setDeniedAnalyticsData] = useState<any[]>([]);

  // Incremental polling timestamps
  const [lastFetchedTime, setLastFetchedTime] = useState<string | null>(null);
  const [lastDeniedFetchedTime, setLastDeniedFetchedTime] = useState<
    string | null
  >(null);

  const {
    resetAttendance,
    isAttendanceLoading,
    getAttendanceByEventAndDate,
    getAttendanceByEventDateAndTimeAfter,
  } = useAttendanceStore();

  const {
    resetDenied,
    isDeniedLoading,
    getDeniedByEventAndDate,
    getDeniedByEventDateAndTimeAfter,
  } = useAttendanceDeniedStore();

  useEffect(() => {
    resetAttendance();
    resetDenied();
  }, [resetAttendance, resetDenied]);

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // ✅ MAIN POLLING (Allowed + Denied)
  const fetchAnalyticsData = useCallback(async () => {
    if (!searchEvent.trim()) return;

    /* ================== ALLOWED ================== */
    if (!lastFetchedTime) {
      const data = await getAttendanceByEventAndDate(searchEvent, today);
      setAnalyticsData(data || []);

      if (data && data.length > 0) {
        const latest = data.reduce((max: any, r: any) =>
          new Date(r.date_time) > new Date(max.date_time) ? r : max,
        );

        setLastFetchedTime(
          new Date(latest.date_time).toTimeString().slice(0, 8),
        );
      }
    } else {
      const newData = await getAttendanceByEventDateAndTimeAfter(
        searchEvent,
        today,
        lastFetchedTime,
      );

      if (newData && newData.length > 0) {
        setAnalyticsData((prev) => [...prev, ...newData]);

        const latest = newData.reduce((max: any, r: any) =>
          new Date(r.date_time) > new Date(max.date_time) ? r : max,
        );

        setLastFetchedTime(
          new Date(latest.date_time).toTimeString().slice(0, 8),
        );
      }
    }

    /* ================== DENIED ================== */
    if (!lastDeniedFetchedTime) {
      const denied = await getDeniedByEventAndDate(searchEvent, today);
      setDeniedAnalyticsData(denied || []);

      if (denied && denied.length > 0) {
        const latestDenied = denied.reduce((max: any, r: any) =>
          new Date(r.attempted_date_time) > new Date(max.attempted_date_time)
            ? r
            : max,
        );

        setLastDeniedFetchedTime(
          new Date(latestDenied.attempted_date_time).toTimeString().slice(0, 8),
        );
      }
    } else {
      const newDenied = await getDeniedByEventDateAndTimeAfter(
        searchEvent,
        today,
        lastDeniedFetchedTime,
      );

      if (newDenied && newDenied.length > 0) {
        setDeniedAnalyticsData((prev) => [...prev, ...newDenied]);

        const latestDenied = newDenied.reduce((max: any, r: any) =>
          new Date(r.attempted_date_time) > new Date(max.attempted_date_time)
            ? r
            : max,
        );

        setLastDeniedFetchedTime(
          new Date(latestDenied.attempted_date_time).toTimeString().slice(0, 8),
        );
      }
    }
  }, [
    searchEvent,
    today,
    lastFetchedTime,
    lastDeniedFetchedTime,
    getAttendanceByEventAndDate,
    getAttendanceByEventDateAndTimeAfter,
    getDeniedByEventAndDate,
    getDeniedByEventDateAndTimeAfter,
  ]);

  // Poll every 5 sec
  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 5000);
    return () => clearInterval(interval);
  }, [fetchAnalyticsData]);

  // Reset when event changes
  useEffect(() => {
    setAnalyticsData([]);
    setDeniedAnalyticsData([]);
    setLastFetchedTime(null);
    setLastDeniedFetchedTime(null);
  }, [searchEvent]);

  // ✅ Merge Allowed + Denied into one dataset for charts + KPIs
  const filteredRecords = useMemo(() => {
    if (!searchEvent.trim()) return [];

    const allowedMapped = analyticsData.map((r) => ({
      ...r,
      event: r.event ?? searchEvent,
      fullname: r.fullname ?? "Unknown",
      location: r.location ?? "Unknown Zone",
      datetime: r.date_time ?? "",
      status: "success",
    }));

    const deniedMapped = deniedAnalyticsData.map((r) => ({
      ...r,
      event: r.event_name ?? searchEvent,
      fullname: r.full_name ?? "Unknown",
      location: r.location ?? "Unknown Zone",
      datetime: r.attempted_date_time ?? "",
      status: "denied",
      denial_reason: r.denial_reason ?? "DENIED",
    }));

    return [...allowedMapped, ...deniedMapped];
  }, [analyticsData, deniedAnalyticsData, searchEvent]);

  // --- ANALYTICS CALCULATIONS ---

  // A. Zone Distribution
  const zoneData = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    const counts: Record<string, number> = {};
    filteredRecords.forEach((rec: any) => {
      counts[rec.location] = (counts[rec.location] || 0) + 1;
    });
    const COLORS = ["#06b6d4", "#f43f5e", "#84cc16", "#eab308", "#6366f1"];
    return Object.entries(counts)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  // B. Status Distribution (NOW WORKS ✅)
  const statusData = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    const counts = { success: 0, denied: 0 };

    filteredRecords.forEach((rec: any) => {
      if (rec.status === "denied") counts.denied++;
      else counts.success++;
    });

    return [
      { name: "Authorized", value: counts.success, color: "#10b981" },
      { name: "Denied", value: counts.denied, color: "#ef4444" },
    ];
  }, [filteredRecords]);

  // C. Hourly Trend
  const hourlyTrendData = useMemo(() => {
    if (filteredRecords.length === 0) return [];

    const hourMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourMap[i] = 0;

    filteredRecords.forEach((rec: any) => {
      if (!rec.datetime) return;
      const dt = new Date(rec.datetime);
      const h = dt.getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    });

    const formatHour = (i: number) => {
      if (i === 0) return "12AM";
      if (i < 12) return `${i}AM`;
      if (i === 12) return "12PM";
      return `${i - 12}PM`;
    };

    return Object.entries(hourMap).map(([hour, entries]) => ({
      hour: formatHour(Number(hour)),
      entries,
    }));
  }, [filteredRecords]);

  // D. Daily Distribution
  const dailyData = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    const dayMap: Record<string, number> = {};
    filteredRecords.forEach((rec: any) => {
      if (!rec.datetime) return;
      const dateLabel = new Date(rec.datetime).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      dayMap[dateLabel] = (dayMap[dateLabel] || 0) + 1;
    });
    return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
  }, [filteredRecords]);

  const uniqueUsers = new Set(filteredRecords.map((r: any) => r.bsguid)).size;

  const successRate = filteredRecords.length
    ? Math.round(
        (filteredRecords.filter((r: any) => r.status === "success").length /
          filteredRecords.length) *
          100,
      )
    : 0;

  const hasData = filteredRecords.length > 0;

  //-----------------------------Export Button Logic -----------------------------//
  const handleExport = () => {
    if (!hasData) return;

    const headers = [
      "Full Name",
      "BSD UID",
      "Event",
      "Location",
      "Date Time",
      "Status",
      "Denial Reason",
    ];

    const rows = filteredRecords.map((r: any) => [
      r.fullname,
      r.bsguid,
      r.event,
      r.location,
      r.datetime,
      r.status,
      r.status === "denied" ? (r.denial_reason ?? "") : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((e) => e.map((v) => `"${v ?? ""}"`).join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute(
      "download",
      `${searchEvent.replace(/\s+/g, "_")}_analytics_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
    );
    link.setAttribute("href", encodedUri);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  //-----------------------------Export Button Logic -----------------------------//

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar userRole={userRole as any} />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 transition-all duration-300">
        {/* Header & Controls */}
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Event Analytics
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Search for an event to generate specific attendance reports.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter Event Name to Load Data (e.g. 'RoadBasher')..."
                className="pl-10"
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
              />
              {searchEvent && (
                <button
                  onClick={() => setSearchEvent("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-border hidden sm:block"></div>

            <div className="text-sm text-muted-foreground hidden sm:block">
              {hasData ? (
                <span className="text-green-600 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {filteredRecords.length} records found
                </span>
              ) : searchEvent ? (
                <span>No records found</span>
              ) : (
                <span>Waiting for input...</span>
              )}
            </div>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchAnalyticsData}
              disabled={
                isAttendanceLoading || isDeniedLoading || !searchEvent.trim()
              }
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isAttendanceLoading || isDeniedLoading ? "animate-spin" : ""
                }`}
              />
            </Button>

            <div className="ml-auto">
              <Button
                variant="outline"
                disabled={!hasData}
                className="gap-2"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Logs"
            value={hasData ? filteredRecords.length.toLocaleString() : "--"}
            change={hasData ? "Allowed + Denied" : "No event selected"}
            changeType="neutral"
            icon={FileText}
            iconColor="text-primary"
            borderColor="border-l-primary"
          />
          <KPICard
            title="Attendees"
            value={hasData ? uniqueUsers.toLocaleString() : "--"}
            change={hasData ? "Unique IDs" : "No event selected"}
            changeType="positive"
            icon={CheckCircle2}
            iconColor="text-emerald-500"
            borderColor="border-l-emerald-500"
          />
          <KPICard
            title="Locations"
            value={hasData ? zoneData.length.toString() : "--"}
            change={hasData ? "Active zones" : "No event selected"}
            changeType="neutral"
            icon={MapPin}
            iconColor="text-violet-500"
            borderColor="border-l-violet-500"
          />
          <KPICard
            title="Auth Rate"
            value={hasData ? `${successRate}%` : "--"}
            change={hasData ? "Access granted" : "No event selected"}
            changeType={successRate > 95 ? "positive" : "negative"}
            icon={Filter}
            iconColor="text-blue-500"
            borderColor="border-l-blue-500"
          />
        </div>

        {/* PIE CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Zone Distribution */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-500" />
                Zone Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              {!hasData ? (
                <p className="text-sm text-muted-foreground">
                  Enter event name to view zone data
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={zoneData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {zoneData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "none" }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4 text-emerald-500" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              {!hasData ? (
                <p className="text-sm text-muted-foreground">
                  Enter event name to view status data
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "none" }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HOURLY TREND */}
        <Card className="shadow-sm mb-8 border-t-4 border-t-indigo-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-indigo-500" />
              Peak Activity Times
            </CardTitle>
            <CardDescription>
              Hourly attendance flow (Allowed + Denied)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {!hasData ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Search event to see trends
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyTrendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="hour"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="entries"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#6366f1" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* DAILY ATTENDEES */}
        <Card className="shadow-sm mb-8 border-t-4 border-t-emerald-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Attendance by Date
            </CardTitle>
            <CardDescription>Daily volume breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {!hasData ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Waiting for event data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(16, 185, 129, 0.05)" }} />
                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
