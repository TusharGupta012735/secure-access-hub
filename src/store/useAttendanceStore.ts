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
      console.log(res);
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
  bsduid: string;
  fullname: string;
  datetime: string;
  location: string;
  event: string;
}

interface AttendanceState {
  records: Attendance[];
  isAttendanceLoading: boolean;
  getAttendance: () => Promise<void>;
}
