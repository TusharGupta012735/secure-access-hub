import { useEffect, useState, useMemo, useCallback } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { KPICard } from "@/components/dashboard/KPICard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  AlertTriangle,
  RefreshCw,
  LogIn,
  MapPin,
  Shield,
  Search,
  X,
  TrendingUp,
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
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { useAttendanceStore } from "@/store/useAttendanceStore";

type UserRole = "admin" | "gate_operator" | "kitchen_operator";

const Dashboard = () => {
  const [userRole] = useState<UserRole>("admin");
  const [eventName, setEventName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastFetchedTime, setLastFetchedTime] = useState<string | null>(null);

  const {
    records: attendanceRecords,
    resetAttendance,
    getAttendance,
    isAttendanceLoading,
    getAttendanceByEvent,
    getAttendanceByEventAndDate,
    getAttendanceByEventDateAndTimeAfter,
  } = useAttendanceStore();

  useEffect(() => {
    resetAttendance();
  }, [resetAttendance]);

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const fetchData = useCallback(async () => {
    if (!eventName.trim()) {
      // Clear records if no event name
      return;
    }

    // 1️⃣ First fetch - Get all data for event and date
    if (!lastFetchedTime) {
      const data = await getAttendanceByEventAndDate(eventName, today);

      if (!data || data.length === 0) return;

      const latest = data.reduce((max, r) =>
        new Date(r.date_time) > new Date(max.date_time) ? r : max
      );

      setLastFetchedTime(new Date(latest.date_time).toTimeString().slice(0, 8));
      return;
    }

    // 2️⃣ Incremental fetch - Get only new records after last fetch
    const newData = await getAttendanceByEventDateAndTimeAfter(
      eventName,
      today,
      lastFetchedTime
    );

    if (!newData || newData.length === 0) return;

    const latest = newData.reduce((max, r) =>
      new Date(r.date_time) > new Date(max.date_time) ? r : max
    );

    setLastFetchedTime(new Date(latest.date_time).toTimeString().slice(0, 8));
  }, [
    eventName,
    today,
    lastFetchedTime,
    getAttendanceByEventAndDate,
    getAttendanceByEventDateAndTimeAfter,
  ]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, [fetchData]);

  // --- DATA NORMALIZATION ---
  const safeRecords = useMemo(() => {
    return attendanceRecords.map((r) => {
      // Parse the ISO date_time (2025-12-26T11:48:18...)
      const parsedDate = r.date_time ? new Date(r.date_time) : null;
      const timeString = parsedDate
        ? parsedDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "--:--";

      return {
        ...r,
        event: r.event ?? "General",
        fullname: r.fullname ?? "Unknown",
        location: r.location ?? "Unknown",
        // Using date_time as the source of truth for display and logic
        displayTime: timeString,
        rawHour: parsedDate ? parsedDate.getHours() : null,
        bsguid: r.bsguid ?? "",
      };
    });
  }, [attendanceRecords]);

  useEffect(() => {
    setLastFetchedTime(null);
  }, [eventName]);

  // --- CHART LOGIC ---

  // 1. Traffic Flow (Hourly Trend)
  const hourlyData = useMemo(() => {
    // Initialize 24-hour slots to ensure graph is continuous
    const hoursMap: Record<number, { hour: string; entries: number }> = {};
    for (let i = 0; i < 24; i++) {
      const label =
        i >= 12
          ? i === 12
            ? "12PM"
            : `${i - 12}PM`
          : i === 0
          ? "12AM"
          : `${i}AM`;
      hoursMap[i] = { hour: label, entries: 0 };
    }

    safeRecords.forEach((rec) => {
      if (rec.rawHour !== null && hoursMap[rec.rawHour]) {
        hoursMap[rec.rawHour].entries += 1;
      }
    });

    return Object.values(hoursMap);
  }, [safeRecords]);

  // 2. Zone Distribution (Pie)
  const zoneData = useMemo(() => {
    const counts: Record<string, number> = {};
    safeRecords.forEach((rec) => {
      counts[rec.location] = (counts[rec.location] || 0) + 1;
    });

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [safeRecords]);

  // 3. Room Occupancy (Bar)
  const roomOccupancyData = useMemo(() => {
    const roomCounts: Record<string, number> = {};
    safeRecords.forEach((rec) => {
      if (rec.location)
        roomCounts[rec.location] = (roomCounts[rec.location] || 0) + 1;
    });
    return Object.entries(roomCounts).map(([room, count]) => ({ room, count }));
  }, [safeRecords]);

  // --- UI DERIVED DATA ---
  const securityAlerts = useMemo(() => {
    return safeRecords
      .filter((r) => r.event.toLowerCase().includes("denied"))
      .reverse()
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        message: `Denied: ${r.fullname} at ${r.location}`,
        time: r.displayTime,
      }));
  }, [safeRecords]);

  const recentLogs = useMemo(() => {
    return [...safeRecords]
      .reverse()
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: r.fullname,
        action: r.event,
        zone: r.location,
        time: r.displayTime,
        status: r.event.toLowerCase().includes("denied") ? "denied" : "success",
      }));
  }, [safeRecords]);

  const lastKnownPosition = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return [...safeRecords]
      .reverse()
      .find(
        (r) =>
          r.bsguid.toLowerCase().includes(query) ||
          r.fullname.toLowerCase().includes(query)
      );
  }, [searchQuery, safeRecords]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar userRole={userRole} />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 transition-all duration-300">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                System Oversight
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-xs font-medium text-green-600 uppercase">
                  Live Feed Active
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search Name or BSGUID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-10 py-2 bg-secondary/50 border-none rounded-full text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchData}
                disabled={isAttendanceLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isAttendanceLoading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* User Search Spotlight */}
        <AnimatePresence>
          {lastKnownPosition && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-primary/40 bg-primary/5">
                <CardContent className="py-4 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {lastKnownPosition.fullname.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold">
                        {lastKnownPosition.fullname}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        ID: {lastKnownPosition.bsguid}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        Last Seen
                      </p>
                      <p className="text-sm font-semibold">
                        {lastKnownPosition.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        Time
                      </p>
                      <p className="text-sm font-semibold">
                        {lastKnownPosition.displayTime}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Event Filter */}
        <div className="mb-6">
          <Card className="bg-card/50 border-dashed">
            <CardContent className="py-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <input
                  placeholder="Filter by specific event name (e.g. Viksit Bharat)..."
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border rounded-xl text-sm"
                />
              </div>
              {eventName && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEventName("")}
                >
                  <X className="h-4 w-4 mr-2" /> Clear
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Logs"
            value={safeRecords.length.toString()}
            icon={Users}
            iconColor="text-primary"
          />
          <KPICard
            title="Active Zones"
            value={zoneData.length.toString()}
            icon={MapPin}
            iconColor="text-emerald-500"
          />
          <KPICard
            title="Security Flags"
            value={securityAlerts.length.toString()}
            icon={AlertTriangle}
            iconColor="text-orange-500"
          />
          <KPICard
            title="Latest"
            value={recentLogs[0]?.name || "--"}
            icon={LogIn}
            iconColor="text-blue-500"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Traffic Flow (24h)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="hour"
                    fontSize={11}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zone Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={zoneData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {zoneData.map((e, i) => (
                      <Cell key={i} fill={e.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Room Occupancy Bar Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">
              Real-time Room Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={roomOccupancyData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="room"
                  type="category"
                  width={100}
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  label={{ position: "right", fontSize: 10 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Footer: Live Logs & Security Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                      {log.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{log.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {log.zone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        log.status === "denied" ? "destructive" : "outline"
                      }
                      className="text-[10px]"
                    >
                      {log.action}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {log.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-orange-100 dark:border-orange-900">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Security Alerts</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {securityAlerts.length ? (
                securityAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 bg-destructive/5 border border-destructive/10 rounded-xl flex gap-3 items-start"
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-destructive block">
                        {a.message}
                      </span>
                      <p className="text-[10px] opacity-60 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No incidents reported
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
