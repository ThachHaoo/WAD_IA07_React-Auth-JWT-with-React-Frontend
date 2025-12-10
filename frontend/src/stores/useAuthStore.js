import { create } from "zustand";
import axiosClient from "../api/axiosClient";
import { queryClient } from "../api/queryClient";

// Tạo một Store (kho chứa state) với Zustand
export const useAuthStore = create((set) => ({
  // 1. KHỞI TẠO STATE (Initial State)
  // Khi user f5 tải lại trang, ta cần biết họ đã login chưa.
  // Logic: Kiểm tra xem có 'accessToken' trong LocalStorage (Ghi nhớ) hoặc SessionStorage (Không ghi nhớ) không.
  // Dấu '!!' dùng để ép kiểu về Boolean: có chuỗi -> true, null/undefined -> false.
  isAuthenticated:
    !!localStorage.getItem("accessToken") ||
    !!sessionStorage.getItem("accessToken"),

  // 2. ACTION LOGIN (Hành động đăng nhập)
  // Hàm này được gọi sau khi API /auth/login thành công (bên trang Login.jsx).
  login: (accessToken, refreshToken, isRemembered) => {
    // Lưu token vào Storage tùy theo lựa chọn "Ghi nhớ đăng nhập" của user.
    if (isRemembered) {
      // LocalStorage: Dữ liệu còn mãi ngay cả khi tắt trình duyệt.
      localStorage.setItem("accessToken", accessToken);

      // Lưu ý: Nếu bạn đang dùng cơ chế HttpOnly Cookie cho Refresh Token (như file auth.controller.ts),
      // thì tham số refreshToken ở đây có thể là null. Dòng dưới này có thể lưu giá trị "null" hoặc undefined.
      // Nếu dùng Cookie thì không cần lưu refreshToken vào Storage nhé.
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    } else {
      // SessionStorage: Dữ liệu mất khi đóng Tab hoặc đóng trình duyệt.
      sessionStorage.setItem("accessToken", accessToken);
      if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
    }

    // Cập nhật State isAuthenticated = true
    // Việc này sẽ kích hoạt React render lại giao diện (chuyển từ trang Login sang trang Home).
    set({ isAuthenticated: true });
  },

  // 3. ACTION LOGOUT (Hành động đăng xuất)
  logout: async () => {
    try {
      // Bước 1: Gọi API để Server xóa Cookie HttpOnly (chứa Refresh Token).
      // Điều này quan trọng để ngăn hacker dùng cookie cũ để lấy token mới.
      await axiosClient.post("/auth/logout");
      console.log("Server logout success (Cookie cleared)");
    } catch (error) {
      console.error("Server logout failed (nhưng vẫn xóa local)", error);
    } finally {
      // Bước 2: Dọn dẹp phía Client (Quan trọng!)
      // Dùng finally để đảm bảo dù Server lỗi hay mất mạng, thì ở Frontend người dùng VẪN ĐƯỢC đăng xuất.

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken"); // Xóa nếu có lưu
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      // Bước 3: Xóa Cache của React Query
      // Đây là bước cực kỳ quan trọng nhưng hay bị quên.
      // Nếu không xóa, khi User B đăng nhập vào máy User A, User B có thể thấy dữ liệu cũ (profile, settings) của User A do React Query cache lại.
      queryClient.removeQueries();
      queryClient.clear();

      // Bước 4: Cập nhật State về false -> App chuyển hướng về trang Login
      set({ isAuthenticated: false });
    }
  },
}));
