import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import axiosClient from "./api/axiosClient";
// Import các trang (pages) của ứng dụng
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
// Import component hiển thị thông báo (toast) từ thư viện sonner
import { Toaster } from "@/components/ui/sonner";
// Import các component bảo vệ Route (HOC - Higher Order Components)
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
// Import Store quản lý trạng thái đăng nhập (Zustand)
import { useAuthStore } from "@/stores/useAuthStore";

// Import và cấu hình TanStack Query (React Query) để quản lý state từ server
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";

function App() {
  // Lấy state và action từ Zustand Store
  const logout = useAuthStore((state) => state.logout);
  const { isAuthenticated, login } = useAuthStore();

  // --- 1. CƠ CHẾ SILENT REFRESH (Làm mới token ngầm) ---
  useEffect(() => {
    // Nếu chưa đăng nhập thì không cần chạy logic này
    if (!isAuthenticated) return;

    // Hàm gọi refresh token chủ động
    const silentRefresh = async () => {
      try {
        // Gọi API Refresh Token (Backend sẽ check Cookie HttpOnly để cấp AccessToken mới)
        const { data } = await axiosClient.post("/auth/refresh");

        // Cập nhật lại Access Token mới vào kho (Store + Storage)
        // Kiểm tra xem user trước đó chọn "Ghi nhớ đăng nhập" (LocalStorage) hay không
        const isRemembered = !!localStorage.getItem("accessToken");

        // Gọi hàm login để update state trong store.
        // Tham số thứ 2 là null vì thường API refresh chỉ trả về token, không trả về full user info.
        login(data.accessToken, null, isRemembered);
        console.log(
          "🔄 Silent Refresh thành công! Token mới đã được cập nhật."
        );
      } catch (error) {
        console.log(
          "Silent Refresh lỗi (có thể do hết hạn cookie hoặc mạng)",
          error
        );
        // Tùy chọn: Có thể gọi logout() ở đây nếu muốn chặt chẽ
      }
    };

    // Thiết lập Interval: Tự động chạy hàm refresh định kỳ.
    // Logic: Access Token sống 10s -> Ta gọi refresh mỗi 9s.
    // -> Mục đích: Luôn đảm bảo user có token mới TRƯỚC KHI token cũ hết hạn.
    // (Trong thực tế: Nếu Token sống 15 phút, bạn nên để interval khoảng 14 phút).
    const intervalId = setInterval(silentRefresh, 9000);

    // Cleanup function: Xóa interval khi component App bị hủy (unmount) hoặc khi user logout.
    // Giúp tránh rò rỉ bộ nhớ (memory leak).
    return () => clearInterval(intervalId);
  }, [isAuthenticated, login]);

  // --- 2. CƠ CHẾ ĐỒNG BỘ ĐĂNG XUẤT GIỮA CÁC TAB ---
  useEffect(() => {
    // Hàm xử lý khi Storage thay đổi (Sự kiện này chỉ kích hoạt ở các tab KHÁC tab hiện tại)
    const handleStorageChange = (event) => {
      // Nếu key bị thay đổi là "accessToken" và giá trị mới là null
      // -> Nghĩa là user đã bấm "Đăng xuất" ở một tab khác.
      if (event.key === "accessToken" && event.newValue === null) {
        console.log("Đã đăng xuất từ tab khác -> Đăng xuất tab này luôn.");
        logout(); // Gọi hàm logout để cập nhật state của tab hiện tại về trạng thái chưa đăng nhập.
      }
    };

    // Đăng ký lắng nghe sự kiện 'storage' của trình duyệt
    window.addEventListener("storage", handleStorageChange);

    // Dọn dẹp listener khi component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [logout]);

  return (
    // Bọc toàn bộ ứng dụng trong QueryClientProvider để các component con có thể sử dụng useQuery/useMutation
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        {/* Container chứa các Route */}
        <Routes>
          {/* --- PROTECTED ROUTE (Cần đăng nhập) ---
              Nếu chưa login mà cố vào -> Bị đá về /login 
          */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* --- PUBLIC ROUTE (Chỉ cho khách) ---
              Nếu đã login mà cố vào /login -> Bị đá về Home (/)
              Giúp trải nghiệm user tốt hơn, không bị kẹt ở trang login khi đã đăng nhập rồi.
          */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Trang 404 cho các đường dẫn không xác định */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Component Toaster: Hiển thị thông báo (popup) ở góc trên cùng */}
        <Toaster richColors position="top-center" />
      </div>
    </QueryClientProvider>
  );
}

export default App;
