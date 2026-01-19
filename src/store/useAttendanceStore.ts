import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

export type AttendanceRecord = {
  id: number;
  fullname: string;
  bsguid: string;
  carduid: string;
  event: string;
  location: string;
  date_time: string; // KEEP AS STANDARD
  exit_status?: number;
  exit_time?: string;
};

export type LocationOccupancyDTO = {
  location: string;
  live: number;
  total: number;
};

type AttendanceStore = {
  records: AttendanceRecord[];
  locationOccupancy: LocationOccupancyDTO[];

  isAttendanceLoading: boolean;
  isOccupancyLoading: boolean;

  resetAttendance: () => void;

  // Existing calls (NO CHANGES)
  getAttendance: () => Promise<AttendanceRecord[] | undefined>;
  getAttendanceByEvent: (
    eventName: string,
  ) => Promise<AttendanceRecord[] | undefined>;
  getAttendanceByEventAndDate: (
    eventName: string,
    date: string,
  ) => Promise<AttendanceRecord[] | undefined>;
  getAttendanceByEventDateAndTime: (
    eventName: string,
    date: string,
    startTime: string,
    endTime: string,
  ) => Promise<AttendanceRecord[] | undefined>;
  getAttendanceByEventDateAndTimeAfter: (
    eventName: string,
    date: string,
    time: string,
  ) => Promise<AttendanceRecord[] | undefined>;

  // New call
  getLiveOccupancy: (
    eventName: string,
    date: string,
  ) => Promise<LocationOccupancyDTO[] | undefined>;
};

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  records: [],
  locationOccupancy: [],

  isAttendanceLoading: false,
  isOccupancyLoading: false,

  resetAttendance: () =>
    set({
      records: [],
      locationOccupancy: [],
      isAttendanceLoading: false,
      isOccupancyLoading: false,
    }),

  // =========================
  // Existing calls (NO CHANGES)
  // =========================

  getAttendance: async () => {
    set({ isAttendanceLoading: true });
    try {
      const res =
        await axiosInstance.get<AttendanceRecord[]>("/attendance/admin/");
      set({ records: res.data });
      return res.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch attendance";
      toast.error(errorMessage);
    } finally {
      set({ isAttendanceLoading: false });
    }
  },

  getAttendanceByEvent: async (eventName: string) => {
    set({ isAttendanceLoading: true });
    try {
      const res = await axiosInstance.get<AttendanceRecord[]>(
        `/attendance/admin/${encodeURIComponent(eventName)}`,
      );
      set({ records: res.data });
      return res.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch attendance";
      toast.error(errorMessage);
    } finally {
      set({ isAttendanceLoading: false });
    }
  },

  getAttendanceByEventAndDate: async (
    eventName: string,
    date: string, // "2026-01-03"
  ) => {
    set({ isAttendanceLoading: true });
    try {
      const res = await axiosInstance.get<AttendanceRecord[]>(
        "/attendance/admin/search/by-event-and-date",
        {
          params: {
            eventName,
            date,
          },
        },
      );
      set({ records: res.data });
      return res.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch attendance by event and date";
      toast.error(errorMessage);
    } finally {
      set({ isAttendanceLoading: false });
    }
  },

  getAttendanceByEventDateAndTime: async (
    eventName: string,
    date: string, // "2026-01-03"
    startTime: string, // "09:00:00"
    endTime: string, // "12:00:00"
  ) => {
    set({ isAttendanceLoading: true });
    try {
      const res = await axiosInstance.get<AttendanceRecord[]>(
        "/attendance/admin/search/by-event-date-and-time",
        {
          params: {
            eventName,
            date,
            startTime,
            endTime,
          },
        },
      );
      set({ records: res.data });
      return res.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch attendance by event, date and time range";
      toast.error(errorMessage);
    } finally {
      set({ isAttendanceLoading: false });
    }
  },

  getAttendanceByEventDateAndTimeAfter: async (
    eventName: string,
    date: string,
    time: string,
  ) => {
    set({ isAttendanceLoading: true });
    try {
      const res = await axiosInstance.get<AttendanceRecord[]>(
        "/attendance/admin/search/by-event-date-and-time-after",
        {
          params: { eventName, date, time },
        },
      );

      set((state) => {
        // merge existing + new
        const merged = [...state.records, ...res.data];

        // dedupe by id (IMPORTANT)
        const unique = Array.from(
          new Map(merged.map((r) => [r.id, r])).values(),
        );

        return { records: unique };
      });

      return res.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch attendance after given time";
      toast.error(errorMessage);
    } finally {
      set({ isAttendanceLoading: false });
    }
  },

  // =========================
  // New call (Live Occupancy)
  // =========================
  getLiveOccupancy: async (eventName: string, date: string) => {
    set({ isOccupancyLoading: true });
    try {
      const res = await axiosInstance.get<
        { location: string; liveCount: number; totalCount: number }[]
      >("/attendance/admin/search/live-occupancy", {
        params: { eventName: eventName.trim(), date: date.trim() },
      });

      const normalized: LocationOccupancyDTO[] = res.data.map((x) => ({
        location: x.location,
        live: x.liveCount ?? 0,
        total: x.totalCount ?? 0,
      }));

      set({ locationOccupancy: normalized });
      return normalized;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch live occupancy";
      toast.error(errorMessage);
    } finally {
      set({ isOccupancyLoading: false });
    }
  },
}));
