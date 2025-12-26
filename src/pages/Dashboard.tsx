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

  const {
    records: attendanceRecords,
    getAttendance,
    isAttendanceLoading,
    getAttendanceByEvent,
  } = useAttendanceStore();

  const fetchData = useCallback(() => {
    if (eventName.trim()) {
      getAttendanceByEvent(eventName);
    } else {
      getAttendance();
    }
  }, [eventName, getAttendance, getAttendanceByEvent]);

  // Combined Polling Effect
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const safeRecords = useMemo(
    () =>
      attendanceRecords.map((r) => ({
        ...r,
        event: r.event ?? "",
        fullname: r.fullname ?? "Unknown",
        location: r.location ?? "Unknown",
        datetime: r.datetime ?? "",
        bsguid: r.bsguid ?? "",
      })),
    [attendanceRecords]
  );

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

  const hourlyData = useMemo(() => {
    const hours: Record<number, { hour: string; entries: number }> = {};
    for (let i = 8; i <= 17; i++) {
      const label = i > 12 ? `${i - 12}PM` : `${i}${i === 12 ? "PM" : "AM"}`;
      hours[i] = { hour: label, entries: 0 };
    }

    safeRecords.forEach((rec) => {
      if (!rec.datetime) return;
      // Extract hour safely from "YYYY-MM-DD HH:mm:ss"
      const timePart = rec.datetime.split(" ")[1];
      if (timePart) {
        const hour = parseInt(timePart.split(":")[0], 10);
        if (hours[hour]) hours[hour].entries += 1;
      }
    });

    return Object.values(hours);
  }, [safeRecords]);

  const securityAlerts = useMemo(() => {
    return safeRecords
      .filter((r) => r.event.toLowerCase().includes("denied"))
      .reverse()
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        message: `Access Denied: ${r.fullname} at ${r.location}`,
        time: r.datetime.split(" ")[1] ?? "--",
      }));
  }, [safeRecords]);

  const recentLogs = useMemo(() => {
    return [...safeRecords]
      .reverse()
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: r.fullname,
        action: r.event || "Unknown",
        zone: r.location,
        time: r.datetime.split(" ")[1] ?? "--",
        status: r.event.toLowerCase().includes("denied") ? "denied" : "success",
      }));
  }, [safeRecords]);

  const roomOccupancyData = useMemo(() => {
    const roomCounts: Record<string, number> = {};
    safeRecords.forEach((rec) => {
      if (rec.location) {
        roomCounts[rec.location] = (roomCounts[rec.location] || 0) + 1;
      }
    });
    return Object.entries(roomCounts).map(([room, count]) => ({ room, count }));
  }, [safeRecords]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar userRole={userRole} />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 transition-all duration-300">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                System Oversight
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-xs font-medium text-green-600 uppercase">
                  Live Feed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Find User or BSGUID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-10 py-2 bg-secondary/50 border-none rounded-full text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
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

          <AnimatePresence>
            {lastKnownPosition && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1, marginBottom: 12 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="border-primary/40 bg-primary/5">
                  <CardContent className="py-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                        {lastKnownPosition.fullname.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base leading-tight">
                          {lastKnownPosition.fullname}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          ID: {lastKnownPosition.bsguid}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
                          Last Zone
                        </p>
                        <div className="flex items-center gap-1.5 text-primary">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-sm font-semibold">
                            {lastKnownPosition.location}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
                          Timestamp
                        </p>
                        <p className="text-sm font-semibold">
                          {lastKnownPosition.datetime.split(" ")[1]}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
                          Status
                        </p>
                        <Badge
                          variant={
                            lastKnownPosition.event
                              .toLowerCase()
                              .includes("denied")
                              ? "destructive"
                              : "default"
                          }
                        >
                          {lastKnownPosition.event}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-6">
          <Card className="bg-card/50 border-dashed">
            <CardContent className="py-4 flex flex-col sm:flex-row items-end sm:items-center gap-4">
              <div className="flex-1 w-full">
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 block ml-1">
                  Filter by Specific Event
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                  <input
                    type="text"
                    placeholder="Enter Event Name (e.g. 'Morning Check-in')..."
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={eventName ? "default" : "secondary"}
                  className="h-10 px-4 rounded-xl"
                >
                  {eventName ? `Viewing: ${eventName}` : "Showing All Data"}
                </Badge>
                {eventName && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEventName("")}
                    className="rounded-xl border"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Logs"
            value={safeRecords.length.toString()}
            change="Database total"
            changeType="positive"
            icon={Users}
            iconColor="text-primary"
            borderColor="border-l-primary"
          />
          <KPICard
            title="Locations"
            value={zoneData.length.toString()}
            change="Active zones"
            changeType="neutral"
            icon={MapPin}
            iconColor="text-emerald-500"
            borderColor="border-l-emerald-500"
          />
          <KPICard
            title="Latest Scan"
            value={recentLogs[0]?.name.split(" ")[0] || "None"}
            change={recentLogs[0]?.zone || "Awaiting data"}
            changeType="neutral"
            icon={LogIn}
            iconColor="text-blue-500"
            borderColor="border-l-blue-500"
          />
          <KPICard
            title="Security Flags"
            value={securityAlerts.length.toString()}
            change="Denied attempts"
            changeType={securityAlerts.length > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="text-orange-500"
            borderColor="border-l-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base">Traffic Flow</CardTitle>
                <CardDescription>Attendee frequency by hour</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient
                      id="colorEntries"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
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
                    fillOpacity={1}
                    fill="url(#colorEntries)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Zone Distribution</CardTitle>
              <CardDescription>Activity per location</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={zoneData}
                    dataKey="value"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                  >
                    {zoneData.map((e, i) => (
                      <Cell key={i} fill={e.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Current Room Occupancy
            </CardTitle>
            <CardDescription>
              Real-time head count based on last detected location
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={roomOccupancyData}
                layout="vertical"
                margin={{ left: 20, right: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="room"
                  type="category"
                  fontSize={12}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  label={{
                    position: "right",
                    fontSize: 12,
                    fontWeight: "bold",
                    fill: "#1e40af",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="flex justify-between flex-row items-center border-b pb-4">
              <CardTitle className="text-base">Live Activity</CardTitle>
              <Badge variant="secondary" className="font-mono">
                {safeRecords.length}
              </Badge>
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
                      className="text-[10px] px-1.5 py-0"
                      variant={
                        log.status === "denied" ? "destructive" : "outline"
                      }
                    >
                      {log.action}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {log.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-orange-100 dark:border-orange-950">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">
                Security Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {securityAlerts.length ? (
                securityAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 bg-destructive/5 border border-destructive/10 rounded-xl flex gap-3 items-start"
                  >
                    <div className="mt-0.5 p-1 bg-destructive/10 rounded-full">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-destructive block">
                        {a.message}
                      </span>
                      <p className="text-[10px] opacity-60 font-mono mt-0.5">
                        {a.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
                  <Shield className="h-8 w-8 mb-2 opacity-10" />
                  <p className="text-sm">No recent incidents</p>
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
