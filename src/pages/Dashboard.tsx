import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Clock,
  CreditCard,
  Shield,
  TrendingUp,
  Calendar,
  RefreshCw,
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
  LineChart,
  Line,
  Legend,
} from "recharts";

// Mock data
const hourlyData = [
  { hour: "6AM", entries: 45, exits: 12 },
  { hour: "7AM", entries: 120, exits: 25 },
  { hour: "8AM", entries: 280, exits: 45 },
  { hour: "9AM", entries: 350, exits: 60 },
  { hour: "10AM", entries: 180, exits: 85 },
  { hour: "11AM", entries: 120, exits: 95 },
  { hour: "12PM", entries: 90, exits: 150 },
  { hour: "1PM", entries: 110, exits: 120 },
  { hour: "2PM", entries: 85, exits: 90 },
  { hour: "3PM", entries: 70, exits: 180 },
  { hour: "4PM", entries: 45, exits: 250 },
  { hour: "5PM", entries: 30, exits: 320 },
];

const zoneData = [
  { name: "Main Hall", value: 450, color: "hsl(217, 91%, 60%)" },
  { name: "Exhibition A", value: 280, color: "hsl(187, 92%, 43%)" },
  { name: "Exhibition B", value: 220, color: "hsl(142, 76%, 36%)" },
  { name: "Conference", value: 180, color: "hsl(38, 92%, 50%)" },
  { name: "VIP Lounge", value: 85, color: "hsl(0, 84%, 60%)" },
];

const weeklyTrend = [
  { day: "Mon", attendance: 1250 },
  { day: "Tue", attendance: 1380 },
  { day: "Wed", attendance: 1520 },
  { day: "Thu", attendance: 1450 },
  { day: "Fri", attendance: 1680 },
  { day: "Sat", attendance: 2100 },
  { day: "Sun", attendance: 1850 },
];

const recentLogs = [
  { id: 1, name: "Alice Johnson", action: "Entry", zone: "Main Hall", time: "2 min ago", status: "success" },
  { id: 2, name: "Bob Smith", action: "Exit", zone: "Exhibition A", time: "5 min ago", status: "success" },
  { id: 3, name: "Carol White", action: "Denied", zone: "VIP Lounge", time: "8 min ago", status: "denied" },
  { id: 4, name: "David Brown", action: "Entry", zone: "Conference", time: "12 min ago", status: "success" },
  { id: 5, name: "Eve Davis", action: "Entry", zone: "Main Hall", time: "15 min ago", status: "success" },
];

const alerts = [
  { id: 1, type: "warning", message: "High occupancy in Main Hall (92%)", time: "5 min ago" },
  { id: 2, type: "error", message: "Multiple access denials at VIP Lounge", time: "12 min ago" },
  { id: 3, type: "info", message: "Sync completed for Gate 3", time: "20 min ago" },
];

type UserRole = "admin" | "gate_operator" | "kitchen_operator";

const Dashboard = () => {
  const [userRole] = useState<UserRole>("admin");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar userRole={userRole} />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time overview of attendance and access
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Role-based info banner */}
        {userRole !== "admin" && (
          <Card className="mb-6 border-l-4 border-l-accent">
            <CardContent className="py-3">
              <p className="text-sm">
                You are viewing the dashboard as a{" "}
                <strong className="text-accent">
                  {userRole === "gate_operator" ? "Gate Operator" : "Kitchen Operator"}
                </strong>
                . Some features may be limited.
              </p>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Inside"
            value="1,215"
            change="+12% from yesterday"
            changeType="positive"
            icon={Users}
            iconColor="text-primary"
            borderColor="border-l-primary"
          />
          <KPICard
            title="Entries Today"
            value="2,847"
            change="+8% from yesterday"
            changeType="positive"
            icon={ArrowUpRight}
            iconColor="text-success"
            borderColor="border-l-success"
          />
          <KPICard
            title="Exits Today"
            value="1,632"
            change="Normal rate"
            changeType="neutral"
            icon={ArrowDownRight}
            iconColor="text-accent"
            borderColor="border-l-accent"
          />
          <KPICard
            title="Active Alerts"
            value="3"
            change="2 require attention"
            changeType="negative"
            icon={AlertTriangle}
            iconColor="text-warning"
            borderColor="border-l-warning"
          />
        </div>

        {/* Additional KPIs for Admin */}
        {userRole === "admin" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Active Cards"
              value="5,230"
              change="98.5% utilization"
              changeType="positive"
              icon={CreditCard}
              iconColor="text-primary"
              borderColor="border-l-primary"
            />
            <KPICard
              title="Active Zones"
              value="12"
              change="All operational"
              changeType="positive"
              icon={Shield}
              iconColor="text-success"
              borderColor="border-l-success"
            />
            <KPICard
              title="Peak Hour"
              value="9:00 AM"
              change="350 entries"
              changeType="neutral"
              icon={Clock}
              iconColor="text-accent"
              borderColor="border-l-accent"
            />
            <KPICard
              title="Weekly Trend"
              value="+15%"
              change="Compared to last week"
              changeType="positive"
              icon={TrendingUp}
              iconColor="text-success"
              borderColor="border-l-success"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hourly Entry/Exit Chart */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Hourly Traffic</CardTitle>
              <CardDescription>Entries and exits throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="entries" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="exits" fill="hsl(187, 92%, 43%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Zone Distribution Pie Chart */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Zone Distribution</CardTitle>
              <CardDescription>Current occupancy by zone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={zoneData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {zoneData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trend Line Chart */}
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
            <CardDescription>Total attendance over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "hsl(217, 91%, 60%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Logs and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity Logs */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest access events</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/logs">View All</a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {log.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{log.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.action} • {log.zone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={log.status === "denied" ? "destructive" : "secondary"}
                        className={log.status === "success" ? "bg-success/10 text-success" : ""}
                      >
                        {log.action}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>System notifications requiring attention</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/alerts">View All</a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      alert.type === "error"
                        ? "bg-destructive/10"
                        : alert.type === "warning"
                        ? "bg-warning/10"
                        : "bg-muted"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 flex-shrink-0 ${
                        alert.type === "error"
                          ? "text-destructive"
                          : alert.type === "warning"
                          ? "text-warning"
                          : "text-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions for specific roles */}
        {(userRole === "gate_operator" || userRole === "kitchen_operator") && (
          <Card variant="elevated" className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {userRole === "gate_operator"
                  ? "Common gate operations"
                  : "Kitchen management actions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {userRole === "gate_operator" ? (
                  <>
                    <Button variant="default">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Scan Card
                    </Button>
                    <Button variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Manual Entry
                    </Button>
                    <Button variant="outline">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Report Issue
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="default">
                      <Calendar className="mr-2 h-4 w-4" />
                      Meal Tracking
                    </Button>
                    <Button variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Head Count
                    </Button>
                    <Button variant="outline">
                      <Clock className="mr-2 h-4 w-4" />
                      Serving Times
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
