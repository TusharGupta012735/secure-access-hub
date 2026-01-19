import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAttendanceDeniedStore } from "@/store/useAttendanceDeniedStore";
import { AlertTriangle, RefreshCw, Search, X } from "lucide-react";

type UserRole = "admin" | "gate_operator" | "kitchen_operator";

const DeniedCandidates = () => {
  const [userRole] = useState<UserRole>("admin");

  const [eventName, setEventName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [lastDeniedFetchedTime, setLastDeniedFetchedTime] = useState<
    string | null
  >(null);

  // Selected denial reason dropdown
  const [selectedReason, setSelectedReason] = useState<string>("ALL");

  const {
    records: deniedRecords,
    resetDenied,
    isDeniedLoading,
    getDeniedByEventAndDate,
    getDeniedByEventDateAndTimeAfter,
  } = useAttendanceDeniedStore();

  useEffect(() => {
    resetDenied();
  }, [resetDenied]);

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0]; // yyyy-MM-dd
  }, []);

  // Reset incremental fetch when event changes
  useEffect(() => {
    setLastDeniedFetchedTime(null);
  }, [eventName]);

  // Polling fetch (same pattern as Dashboard)
  const fetchDenied = useCallback(async () => {
    if (!eventName.trim()) return;

    if (!lastDeniedFetchedTime) {
      const denied = await getDeniedByEventAndDate(eventName, today);

      if (denied && denied.length > 0) {
        const latestDenied = denied.reduce((max, r) =>
          new Date(r.attempted_date_time) > new Date(max.attempted_date_time)
            ? r
            : max
        );

        setLastDeniedFetchedTime(
          new Date(latestDenied.attempted_date_time).toTimeString().slice(0, 8)
        );
      }
    } else {
      const newDenied = await getDeniedByEventDateAndTimeAfter(
        eventName,
        today,
        lastDeniedFetchedTime
      );

      if (newDenied && newDenied.length > 0) {
        const latestDenied = newDenied.reduce((max, r) =>
          new Date(r.attempted_date_time) > new Date(max.attempted_date_time)
            ? r
            : max
        );

        setLastDeniedFetchedTime(
          new Date(latestDenied.attempted_date_time).toTimeString().slice(0, 8)
        );
      }
    }
  }, [
    eventName,
    today,
    lastDeniedFetchedTime,
    getDeniedByEventAndDate,
    getDeniedByEventDateAndTimeAfter,
  ]);

  useEffect(() => {
    fetchDenied();
    const interval = setInterval(fetchDenied, 5000);
    return () => clearInterval(interval);
  }, [fetchDenied]);

  // Normalize denied records
  const safeDenied = useMemo(() => {
    return deniedRecords.map((r) => {
      const dt = r.attempted_date_time ? new Date(r.attempted_date_time) : null;

      const time = dt
        ? dt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "--:--";

      return {
        ...r,
        full_name: r.full_name ?? "Unknown",
        bsguid: r.bsguid ?? "--",
        location: r.location ?? "Unknown",
        denial_reason: r.denial_reason ?? "DENIED",
        displayTime: time,
      };
    });
  }, [deniedRecords]);

  // Unique reasons for dropdown
  const reasons = useMemo(() => {
    const set = new Set<string>();
    safeDenied.forEach((r) => set.add(r.denial_reason));
    return ["ALL", ...Array.from(set).sort()];
  }, [safeDenied]);

  // Filtered list by reason + search
  const filteredDenied = useMemo(() => {
    let data = [...safeDenied].reverse(); // latest first

    if (selectedReason !== "ALL") {
      data = data.filter((r) => r.denial_reason === selectedReason);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          (r.bsguid || "").toLowerCase().includes(q) ||
          (r.location || "").toLowerCase().includes(q)
      );
    }

    return data;
  }, [safeDenied, selectedReason, searchQuery]);

  const totalDenied = useMemo(() => {
    return safeDenied.length;
  }, [safeDenied]);

  const deniedForReasonCount = useMemo(() => {
    if (selectedReason === "ALL") return safeDenied.length;
    return safeDenied.filter((r) => r.denial_reason === selectedReason).length;
  }, [safeDenied, selectedReason]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar userRole={userRole} />

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Denied Candidates
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                View denied attendance entries filtered by denial reason.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                <Input
                  placeholder="Search Name / BSGUID / Location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-10 w-full sm:w-72 rounded-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={fetchDenied}
                disabled={isDeniedLoading || !eventName.trim()}
                title="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isDeniedLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Event Filter */}
        <div className="mb-6">
          <Card className="bg-card/50 border-dashed">
            <CardContent className="py-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Enter event name (e.g. RoadBasher)..."
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
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

        {/* Reason Dropdown */}
        <div className="mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Filter by Reason</CardTitle>
                <CardDescription className="text-xs">
                  Choose a denial reason to list candidates
                </CardDescription>
              </div>

              <Badge variant="outline" className="text-[10px]">
                {isDeniedLoading ? "Updating..." : "Live"}
              </Badge>
            </CardHeader>

            <CardContent className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="w-full sm:max-w-sm">
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={!eventName.trim()}
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Badge variant="secondary" className="text-[11px]">
                  Total Denied Today: {eventName.trim() ? totalDenied : "--"}
                </Badge>

                <Badge variant="destructive" className="text-[11px]">
                  Showing: {eventName.trim() ? deniedForReasonCount : "--"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Denied List */}
        <Card className="border-orange-100 dark:border-orange-900">
          <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Denied Logs
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {selectedReason === "ALL" ? "All Reasons" : selectedReason}
            </Badge>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {!eventName.trim() ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Enter an event name to load denied candidates.
              </div>
            ) : filteredDenied.length ? (
              filteredDenied.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center gap-4 p-3 rounded-xl bg-card/50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">{log.full_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {log.location} • {log.bsguid}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="destructive" className="text-[10px]">
                      {log.denial_reason}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {log.displayTime}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No denied candidates for this filter today.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DeniedCandidates;
