import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [],
  isAttendanceLoading: false,

  resetAttendance: () =>
    set({
      records: [],
      isAttendanceLoading: false,
    }),

  getAttendance: async () => {
    set({ isAttendanceLoading: true });
    try {
      const res = await axiosInstance.get<Attendance[]>("/attendance/admin/");
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
      const res = await axiosInstance.get<Attendance[]>(
        `/attendance/admin/${encodeURIComponent(eventName)}`
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
    date: string // "2026-01-03"
  ) => {
    set({ isAttendanceLoading: true });
    try {
      const res = await axiosInstance.get<Attendance[]>(
        "/attendance/admin/search/by-event-and-date",
        {
          params: {
            eventName,
            date,
          },
        }
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
    endTime: string // "12:00:00"
  ) => {
    set({ isAttendanceLoading: true });
    try {
      const res = await axiosInstance.get<Attendance[]>(
        "/attendance/admin/search/by-event-date-and-time",
        {
          params: {
            eventName,
            date,
            startTime,
            endTime,
          },
        }
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
    time: string
  ) => {
    set({ isAttendanceLoading: true });
    try {
      const res = await axiosInstance.get<Attendance[]>(
        "/attendance/admin/search/by-event-date-and-time-after",
        {
          params: { eventName, date, time },
        }
      );

      set((state) => {
        // merge existing + new
        const merged = [...state.records, ...res.data];

        // dedupe by id (IMPORTANT)
        const unique = Array.from(
          new Map(merged.map((r) => [r.id, r])).values()
        );

        return { records: unique };
      });

      return res.data;
    } finally {
      set({ isAttendanceLoading: false });
    }
  },
}));

export interface Attendance {
  id: number;
  carduid: string;
  bsguid: string;
  fullname: string;
  date_time: string;
  location: string;
  event: string;
}

interface AttendanceState {
  records: Attendance[];
  isAttendanceLoading: boolean;
  resetAttendance: () => void;
  getAttendance: () => Promise<Attendance[]>;
  getAttendanceByEvent: (eventName: string) => Promise<Attendance[]>;
  getAttendanceByEventAndDate: (
    eventName: string,
    date: string
  ) => Promise<Attendance[]>;
  getAttendanceByEventDateAndTime: (
    eventName: string,
    date: string,
    startTime: string,
    endTime: string
  ) => Promise<Attendance[]>;
  getAttendanceByEventDateAndTimeAfter: (
    eventName: string,
    date: string,
    time: string
  ) => Promise<Attendance[]>;
}
