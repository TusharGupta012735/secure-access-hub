import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [],
  isAttendanceLoading: false,

  getAttendance: async () => {
    set({ isAttendanceLoading: true });
    try {
      const res = await axiosInstance.get<Attendance[]>("/attendance/");
      set({ records: res.data });
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
        `/attendance/${encodeURIComponent(eventName)}`
      );
      set({ records: res.data });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch attendance";
      toast.error(errorMessage);
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
  getAttendance: () => Promise<void>;
  getAttendanceByEvent: (eventName: string) => Promise<void>;
}
