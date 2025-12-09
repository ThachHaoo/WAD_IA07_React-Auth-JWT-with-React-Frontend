import { create } from "zustand";
import axiosClient from "../api/axiosClient";

export const useAuthStore = create((set) => ({
  // 1. Khởi tạo State: Kiểm tra token trong cả 2 kho
  isAuthenticated:
    !!localStorage.getItem("accessToken") ||
    !!sessionStorage.getItem("accessToken"),

  // 2. Action Login
  login: (accessToken, refreshToken, isRemembered) => {
    // Lưu vào Storage
    if (isRemembered) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
    }

    // Cập nhật State -> Giao diện tự đổi
    set({ isAuthenticated: true });
  },

  // 3. Action Logout
  logout: async () => {
    try {
      // Gọi API để Server xóa Cookie HttpOnly
      await axiosClient.post("/auth/logout");
      console.log("Server logout success (Cookie cleared)");
    } catch (error) {
      console.error("Server logout failed (nhưng vẫn xóa local)", error);
    } finally {
      // Dù API thành công hay thất bại, Frontend vẫn phải xóa sạch dấu vết
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      // Không cần xóa refreshToken vì nó ở Cookie (Server đã xóa hoặc JS không xóa được)

      set({ isAuthenticated: false });
    }
  },
}));
