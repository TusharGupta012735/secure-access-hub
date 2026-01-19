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
  Crown,
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
import { useAttendanceDeniedStore } from "@/store/useAttendanceDeniedStore";

type UserRole = "admin" | "gate_operator" | "kitchen_operator";

const Dashboard = () => {
  const [userRole] = useState<UserRole>("admin");
  const [eventName, setEventName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastFetchedTime, setLastFetchedTime] = useState<string | null>(null);
  const [lastDeniedFetchedTime, setLastDeniedFetchedTime] = useState<
    string | null
  >(null);

  const {
    records: attendanceRecords,
    locationOccupancy,
    resetAttendance,
    isAttendanceLoading,
    isOccupancyLoading,
    getAttendanceByEventAndDate,
    getAttendanceByEventDateAndTimeAfter,
    getLiveOccupancy,
  } = useAttendanceStore();

  const {
    records: deniedRecords,
    resetDenied,
    isDeniedLoading,
    getDeniedByEventAndDate,
    getDeniedByEventDateAndTimeAfter,
  } = useAttendanceDeniedStore();

  useEffect(() => {
    resetAttendance();
    resetDenied();
  }, [resetAttendance]);

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0]; // yyyy-MM-dd
  }, []);

  // ✅ MAIN POLLING FUNCTION (Attendance + Occupancy)
  const fetchData = useCallback(async () => {
    if (!eventName.trim()) return;

    // Always refresh occupancy
    await getLiveOccupancy(eventName, today);

    /* ================== ALLOWED ATTENDANCE ================== */

    if (!lastFetchedTime) {
      const data = await getAttendanceByEventAndDate(eventName, today);

      if (data && data.length > 0) {
        const latest = data.reduce((max, r) =>
          new Date(r.date_time) > new Date(max.date_time) ? r : max,
        );

        setLastFetchedTime(
          new Date(latest.date_time).toTimeString().slice(0, 8),
        );
      }
    } else {
      const newData = await getAttendanceByEventDateAndTimeAfter(
        eventName,
        today,
        lastFetchedTime,
      );

      if (newData && newData.length > 0) {
        const latest = newData.reduce((max, r) =>
          new Date(r.date_time) > new Date(max.date_time) ? r : max,
        );

        setLastFetchedTime(
          new Date(latest.date_time).toTimeString().slice(0, 8),
        );
      }
    }

    /* ================== DENIED ATTENDANCE ================== */

    if (!lastDeniedFetchedTime) {
      const denied = await getDeniedByEventAndDate(eventName, today);

      if (denied && denied.length > 0) {
        const latestDenied = denied.reduce((max, r) =>
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
        eventName,
        today,
        lastDeniedFetchedTime,
      );

      if (newDenied && newDenied.length > 0) {
        const latestDenied = newDenied.reduce((max, r) =>
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
    eventName,
    today,
    lastFetchedTime,
    lastDeniedFetchedTime,
    getAttendanceByEventAndDate,
    getAttendanceByEventDateAndTimeAfter,
    getDeniedByEventAndDate,
    getDeniedByEventDateAndTimeAfter,
    getLiveOccupancy,
  ]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    setLastFetchedTime(null);
    setLastDeniedFetchedTime(null);
  }, [eventName]);

  // --- DATA NORMALIZATION ---
  const safeRecords = useMemo(() => {
    return attendanceRecords.map((r) => {
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
        displayTime: timeString,
        rawHour: parsedDate ? parsedDate.getHours() : null,
        bsguid: r.bsguid ?? "",
      };
    });
  }, [attendanceRecords]);

  // ✅ SMART LOCATION SORTING
  const sortedLocationOccupancy = useMemo(() => {
    const getLocationSortKey = (name: string) => {
      const match = name.match(/^([a-zA-Z]+)\s*-?\s*(\d+)$/);
      if (match) {
        const prefix = match[1].toLowerCase();
        const num = parseInt(match[2], 10);
        return { prefix, num, raw: name.toLowerCase() };
      }

      const match2 = name.match(/^(.+?)\s*-?\s*(\d+)$/);
      if (match2) {
        const prefix = match2[1].trim().toLowerCase();
        const num = parseInt(match2[2], 10);
        return { prefix, num, raw: name.toLowerCase() };
      }

      return {
        prefix: name.toLowerCase(),
        num: Number.MAX_SAFE_INTEGER,
        raw: name.toLowerCase(),
      };
    };

    return [...locationOccupancy].sort((a, b) => {
      const ka = getLocationSortKey(a.location);
      const kb = getLocationSortKey(b.location);

      if (ka.prefix < kb.prefix) return -1;
      if (ka.prefix > kb.prefix) return 1;

      return ka.num - kb.num;
    });
  }, [locationOccupancy]);

  // --- CHART LOGIC ---

  // 1) Traffic Flow (Hourly Trend) - from logs
  const hourlyData = useMemo(() => {
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

  // 2) Zone Distribution (Pie) - based on TOTAL per location
  const zoneData = useMemo(() => {
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    return sortedLocationOccupancy
      .filter((x) => (x.total || 0) > 0)
      .map((x, index) => ({
        name: x.location,
        value: x.total,
        color: COLORS[index % COLORS.length],
      }));
  }, [sortedLocationOccupancy]);

  // 3) Room Occupancy (Bar) - based on LIVE per location
  const roomOccupancyData = useMemo(() => {
    return sortedLocationOccupancy.map((x) => ({
      room: x.location,
      count: x.live || 0,
    }));
  }, [sortedLocationOccupancy]);

  // --- UI DERIVED DATA ---
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
          r.fullname.toLowerCase().includes(query),
      );
  }, [searchQuery, safeRecords]);

  // Global totals from occupancy API
  const totalEntriesToday = useMemo(() => {
    return sortedLocationOccupancy.reduce((sum, x) => sum + (x.total || 0), 0);
  }, [sortedLocationOccupancy]);

  const liveInsideNow = useMemo(() => {
    return sortedLocationOccupancy.reduce((sum, x) => sum + (x.live || 0), 0);
  }, [sortedLocationOccupancy]);

  // ✅ MOST CROWDED LOCATION (LIVE)
  const mostCrowdedLocation = useMemo(() => {
    if (!sortedLocationOccupancy.length) return null;

    return [...sortedLocationOccupancy].sort((a, b) => {
      if ((b.live || 0) !== (a.live || 0)) return (b.live || 0) - (a.live || 0);
      return (b.total || 0) - (a.total || 0);
    })[0];
  }, [sortedLocationOccupancy]);

  // This is placeholder because denied logs are not in attendanceRecords currently
  const securityFlagsCount = useMemo(() => {
    if (!eventName.trim()) return 0;
    return deniedRecords.length;
  }, [deniedRecords, eventName]);

  const recentDeniedLogs = useMemo(() => {
    return [...deniedRecords]
      .reverse()
      .slice(0, 6)
      .map((r) => {
        const dt = r.attempted_date_time
          ? new Date(r.attempted_date_time)
          : null;

        const time = dt
          ? dt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "--:--";

        return {
          id: r.id,
          name: r.full_name ?? "Unknown",
          bsguid: r.bsguid ?? "--",
          location: r.location ?? "Unknown",
          reason: r.denial_reason ?? "DENIED",
          time,
        };
      });
  }, [deniedRecords]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar userRole={userRole} />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 transition-all duration-300">
        {/* Header */}
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

            {/* Search */}
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
                disabled={
                  isAttendanceLoading || isOccupancyLoading || isDeniedLoading
                }
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isAttendanceLoading || isOccupancyLoading || isDeniedLoading
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Spotlight */}
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

        {/* Event Filter */}
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
            title="Total Entries Today"
            value={eventName.trim() ? totalEntriesToday.toString() : "--"}
            icon={Users}
            iconColor="text-primary"
          />
          <KPICard
            title="Live Inside Now"
            value={eventName.trim() ? liveInsideNow.toString() : "--"}
            icon={LogIn}
            iconColor="text-emerald-500"
          />
          <KPICard
            title="Active Zones"
            value={eventName.trim() ? zoneData.length.toString() : "--"}
            icon={MapPin}
            iconColor="text-blue-500"
          />
          <KPICard
            title="Security Flags"
            value={securityFlagsCount.toString()}
            icon={AlertTriangle}
            iconColor="text-orange-500"
          />
        </div>

        {/* Most Crowded Now */}
        {eventName.trim() && mostCrowdedLocation && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Most Crowded Now
                  </p>
                  <p className="text-lg font-bold">
                    {mostCrowdedLocation.location}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Live
                  </p>
                  <p className="text-lg font-bold">
                    {mostCrowdedLocation.live}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Total
                  </p>
                  <p className="text-lg font-bold">
                    {mostCrowdedLocation.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ Better Location-wise Cards */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">
                Location Live Occupancy
              </CardTitle>
              <CardDescription className="text-xs">
                Live = inside right now, Total = entries today
              </CardDescription>
            </div>

            <Badge variant="outline" className="text-[10px]">
              {isOccupancyLoading ? "Updating..." : "Live"}
            </Badge>
          </CardHeader>

          <CardContent>
            {!eventName.trim() ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Enter an event name to see live occupancy.
              </div>
            ) : !sortedLocationOccupancy.length ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No occupancy data found for today.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedLocationOccupancy.map((loc) => {
                  const live = loc.live || 0;
                  const total = loc.total || 0;
                  const insidePct =
                    total > 0 ? Math.round((live / total) * 100) : 0;

                  const isTop =
                    mostCrowdedLocation?.location === loc.location && live > 0;

                  return (
                    <Card
                      key={loc.location}
                      className={`relative overflow-hidden bg-card/60 ${
                        isTop ? "border-primary/50" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">
                              {loc.location}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {insidePct}% currently inside
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {isTop && (
                              <Badge className="text-[10px]">
                                <Crown className="h-3 w-3 mr-1" />
                                Top
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-[10px]">
                              Live
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-secondary/40 p-3">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                              Live
                            </p>
                            <p className="text-2xl font-bold">{live}</p>
                          </div>

                          <div className="rounded-xl bg-secondary/40 p-3">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                              Total
                            </p>
                            <p className="text-2xl font-bold">{total}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Inside ratio</span>
                            <span>{insidePct}%</span>
                          </div>

                          <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.min(100, insidePct)}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Traffic Flow (24h)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {!eventName.trim() ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Enter an event name to view chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient
                        id="colorArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
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
              )}
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Zone Distribution (Total)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {!eventName.trim() ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Enter an event name to view chart.
                </div>
              ) : zoneData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No distribution data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={zoneData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {zoneData.map((e, i) => (
                        <Cell key={i} fill={e.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Occupancy Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">
              Real-time Room Occupancy (Live)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {!eventName.trim() ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Enter an event name to view chart.
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {recentLogs.length ? (
                recentLogs.map((log) => (
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
                      <Badge variant="outline" className="text-[10px]">
                        {log.action}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {log.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No recent logs
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-100 dark:border-orange-900">
            <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Security Alerts</CardTitle>

              <Badge variant="outline" className="text-[10px]">
                {isDeniedLoading ? "Updating..." : "Live"}
              </Badge>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {!eventName.trim() ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Enter an event name to view denied logs.
                </div>
              ) : recentDeniedLogs.length ? (
                recentDeniedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">{log.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {log.location} • {log.bsguid}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="destructive" className="text-[10px]">
                        {log.reason}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {log.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No denied logs today.
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
