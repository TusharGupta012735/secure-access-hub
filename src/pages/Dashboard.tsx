import { useEffect, useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Shield,
  RefreshCw,
  LogIn,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAttendanceStore } from "@/store/useAttendanceStore";

type UserRole = "admin" | "gate_operator" | "kitchen_operator";

const Dashboard = () => {
  const [userRole] = useState<UserRole>("admin");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // 1. Hook into your Spring Boot Data
  const { records, getAttendance, isAttendanceLoading } = useAttendanceStore();

  useEffect(() => {
    getAttendance();
    const interval = setInterval(() => {
      getAttendance();
    }, 10000);

    return () => clearInterval(interval);
  }, [getAttendance]);

  const handleRefresh = () => {
    getAttendance();
    setLastRefresh(new Date());
  };

  // 2. DATA TRANSFORMATIONS (Turning raw JSON into Chart Data)

  // A. Zone Distribution (Pie Chart)
  const zoneData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((rec) => {
      counts[rec.location] = (counts[rec.location] || 0) + 1;
    });

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [records]);

  // B. Hourly Traffic (Bar Chart) - Groups records by the hour they occurred
  const hourlyData = useMemo(() => {
    const hours: Record<string, { hour: string; entries: number }> = {};
    // Initialize 8 hours for a clean look
    for (let i = 8; i <= 17; i++) {
      const label = i > 12 ? `${i - 12}PM` : `${i}${i === 12 ? "PM" : "AM"}`;
      hours[i] = { hour: label, entries: 0 };
    }

    records.forEach((rec) => {
      const hour = new Date(rec.datetime).getHours();
      if (hours[hour]) {
        hours[hour].entries += 1;
      }
    });
    return Object.values(hours);
  }, [records]);

  // C. Security Alerts (Filtering for "Denied" or "Unauthorized" events)
  const securityAlerts = useMemo(() => {
    return records
      .filter((r) => r.event.toLowerCase().includes("denied"))
      .map((r) => ({
        id: r.id,
        type: "error",
        message: `Access Denied: ${r.fullname} at ${r.location}`,
        time: r.datetime.split(" ")[1],
      }))
      .reverse()
      .slice(0, 3);
  }, [records]);

  // D. Recent Logs (Last 5 records)
  const recentLogs = useMemo(() => {
    return [...records]
      .reverse()
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: r.fullname,
        action: r.event,
        zone: r.location,
        time: r.datetime.split(" ")[1],
        status: r.event.toLowerCase().includes("denied") ? "denied" : "success",
      }));
  }, [records]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar userRole={userRole} />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Live Dashboard</h1>
            <p className="text-muted-foreground">
              Connected to Spring Boot API (Port 8080)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Last sync: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isAttendanceLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  isAttendanceLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards (Real Data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Logs"
            value={records.length.toString()}
            change="Live records in DB"
            changeType="positive"
            icon={Users}
            iconColor="text-primary"
            borderColor="border-l-primary"
          />
          <KPICard
            title="Active Locations"
            value={zoneData.length.toString()}
            change="Reported zones"
            changeType="neutral"
            icon={MapPin}
            iconColor="text-success"
            borderColor="border-l-success"
          />
          <KPICard
            title="Latest Event"
            value={recentLogs[0]?.action || "None"}
            change={recentLogs[0]?.name || "Waiting for data"}
            changeType="neutral"
            icon={LogIn}
            iconColor="text-accent"
            borderColor="border-l-accent"
          />
          <KPICard
            title="Security Flags"
            value={securityAlerts.length.toString()}
            change="Failed access attempts"
            changeType={securityAlerts.length > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="text-warning"
            borderColor="border-l-warning"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Real Hourly Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Traffic Pattern</CardTitle>
              <CardDescription>Activity logs grouped by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="entries"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Real Zone Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Zone Distribution</CardTitle>
              <CardDescription>Records per location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={zoneData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      // Smooth animation props:
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {zoneData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Real Logs vs Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real Recent Logs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live Activity Stream</CardTitle>
              <Badge variant="secondary">{records.length} Total</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {log.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{log.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.zone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          log.status === "denied" ? "destructive" : "outline"
                        }
                      >
                        {log.action}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real Alerts (from your Data) */}
          <Card>
            <CardHeader>
              <CardTitle>Security Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAlerts.length > 0 ? (
                  securityAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          {alert.message}
                        </p>
                        <p className="text-xs opacity-70">
                          Logged at {alert.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mb-2 opacity-20" />
                    <p>No security alerts detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
