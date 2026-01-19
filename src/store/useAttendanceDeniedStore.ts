import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

/* ================= STORE ================= */

export const useAttendanceDeniedStore = create<AttendanceDeniedState>((set) => ({
  records: [],
  isDeniedLoading: false,

  resetDenied: () =>
    set({
      records: [],
      isDeniedLoading: false,
    }),

  /* ================= FETCH ALL ================= */

  getDeniedAttendance: async () => {
    set({ isDeniedLoading: true });
    try {
      const res = await axiosInstance.get<AttendanceDenied[]>(
        "/attendance/denied/admin/"
      );
      set({ records: res.data });
      return res.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch denied attendance";
      toast.error(errorMessage);
      return [];
    } finally {
      set({ isDeniedLoading: false });
    }
  },

  /* ================= BY EVENT ================= */

  getDeniedByEvent: async (eventName: string) => {
    set({ isDeniedLoading: true });
    try {
      const res = await axiosInstance.get<AttendanceDenied[]>(
        `/attendance/denied/admin/${encodeURIComponent(eventName)}`
      );
      set({ records: res.data });
      return res.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch denied attendance by event";
      toast.error(errorMessage);
      return [];
    } finally {
      set({ isDeniedLoading: false });
    }
  },

  /* ================= BY EVENT + DATE ================= */

  getDeniedByEventAndDate: async (
    eventName: string,
    date: string // "2026-01-03"
  ) => {
    set({ isDeniedLoading: true });
    try {
      const res = await axiosInstance.get<AttendanceDenied[]>(
        "/attendance/denied/admin/search/by-event-and-date",
        {
          params: { eventName, date },
        }
      );
      set({ records: res.data });
      return res.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch denied attendance by event and date";
      toast.error(errorMessage);
      return [];
    } finally {
      set({ isDeniedLoading: false });
    }
  },

  /* ================= BY EVENT + DATE + TIME RANGE ================= */

  getDeniedByEventDateAndTime: async (
    eventName: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    set({ isDeniedLoading: true });
    try {
      const res = await axiosInstance.get<AttendanceDenied[]>(
        "/attendance/denied/admin/search/by-event-date-and-time",
        {
          params: { eventName, date, startTime, endTime },
        }
      );
      set({ records: res.data });
      return res.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch denied attendance by event, date and time range";
      toast.error(errorMessage);
      return [];
    } finally {
      set({ isDeniedLoading: false });
    }
  },

  /* ================= LIVE MODE (TIME AFTER) ================= */

  getDeniedByEventDateAndTimeAfter: async (
    eventName: string,
    date: string,
    time: string
  ) => {
    set({ isDeniedLoading: true });
    try {
      const res = await axiosInstance.get<AttendanceDenied[]>(
        "/attendance/denied/admin/search/by-event-date-and-time-after",
        {
          params: { eventName, date, time },
        }
      );

      set((state) => {
        const merged = [...state.records, ...res.data];

        // dedupe by id
        const unique = Array.from(
          new Map(merged.map((r) => [r.id, r])).values()
        );

        return { records: unique };
      });

      return res.data;
    } finally {
      set({ isDeniedLoading: false });
    }
  },
}));

/* ================= TYPES ================= */

export interface AttendanceDenied {
  id: number;
  carduid: string;
  bsguid: string | null;
  full_name: string | null;
  event_id: number;
  event_name: string;
  location: string;
  attempted_date_time: string;
  denial_reason: string;
  participant_type: string | null;
  entry_from: string | null;
  entry_till: string | null;
  created_at: string;
}

interface AttendanceDeniedState {
  records: AttendanceDenied[];
  isDeniedLoading: boolean;

  resetDenied: () => void;

  getDeniedAttendance: () => Promise<AttendanceDenied[]>;
  getDeniedByEvent: (eventName: string) => Promise<AttendanceDenied[]>;
  getDeniedByEventAndDate: (
    eventName: string,
    date: string
  ) => Promise<AttendanceDenied[]>;
  getDeniedByEventDateAndTime: (
    eventName: string,
    date: string,
    startTime: string,
    endTime: string
  ) => Promise<AttendanceDenied[]>;
  getDeniedByEventDateAndTimeAfter: (
    eventName: string,
    date: string,
    time: string
  ) => Promise<AttendanceDenied[]>;
}
