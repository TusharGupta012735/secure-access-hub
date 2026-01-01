import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAttendanceStore } from "@/store/useAttendanceStore";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const EventAnalytics = () => {
  const { records, getAttendance } = useAttendanceStore();

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<string>("all");

  useEffect(() => {
    getAttendance(); // one-time fetch
  }, [getAttendance]);

  /* ---------- Event distribution ---------- */
  const eventPieData = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      if (!r.event) return;
      map[r.event] = (map[r.event] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [records]);

  /* ---------- Records for selected event ---------- */
  const eventRecords = useMemo(() => {
    if (!selectedEvent) return [];
    return records.filter((r) => r.event === selectedEvent);
  }, [records, selectedEvent]);

  /* ---------- Location pie ---------- */
  const locationPieData = useMemo(() => {
    const map: Record<string, number> = {};
    eventRecords.forEach((r) => {
      map[r.location ?? "Unknown"] =
        (map[r.location ?? "Unknown"] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [eventRecords]);

  /* ---------- Time series ---------- */
  const timeData = useMemo(() => {
    const map: Record<string, number> = {};
    eventRecords.forEach((r) => {
      if (!r.datetime) return;
      const hour = new Date(r.datetime).getHours();
      const label = hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([hour, entries]) => ({
      hour,
      entries,
    }));
  }, [eventRecords]);

  /* ---------- Table data ---------- */
  const tableData = useMemo(() => {
    return eventRecords.filter(
      (r) => roomFilter === "all" || r.location === roomFilter
    );
  }, [eventRecords, roomFilter]);

  return (
    <div className="p-6 space-y-6">

      {/* ---------- Event selector ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Event Analytics</CardTitle>
          <CardDescription>Select an event to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <select
            className="border p-2 rounded"
            value={selectedEvent ?? ""}
            onChange={(e) =>
              setSelectedEvent(e.target.value || null)
            }
          >
            <option value="">-- Select Event --</option>
            {[...new Set(records.map((r) => r.event))].map(
              (e) =>
                e && (
                  <option key={e} value={e}>
                    {e}
                  </option>
                )
            )}
          </select>
        </CardContent>
      </Card>

      {/* ---------- Event distribution pie ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Attendee Distribution by Event</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={eventPieData} dataKey="value" label>
                {eventPieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ---------- Conditional analytics ---------- */}
      {!selectedEvent ? (
        <Card>
          <CardContent className="text-center text-muted-foreground py-12">
            Select an event to view detailed analytics
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Location pie */}
          <Card>
            <CardHeader>
              <CardTitle>Location Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={locationPieData} dataKey="value" label>
                    {locationPieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Time graph */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer>
                <AreaChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    dataKey="entries"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendee table */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Attendees</CardTitle>
              <select
                className="border p-1 rounded text-sm"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="all">All Rooms</option>
                {[...new Set(eventRecords.map((r) => r.location))].map(
                  (room) =>
                    room && (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    )
                )}
              </select>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Name</th>
                    <th>BSGUID</th>
                    <th>Room</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{r.fullname}</td>
                      <td>{r.bsguid}</td>
                      <td>
                        <Badge>{r.location}</Badge>
                      </td>
                      <td>{r.datetime?.split(" ")[1] ?? "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EventAnalytics;
