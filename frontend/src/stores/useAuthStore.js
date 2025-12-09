import { create } from "zustand";

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
  logout: () => {
    // Xóa sạch Storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    // Cập nhật State -> Giao diện tự về Login
    set({ isAuthenticated: false });
  },
}));
