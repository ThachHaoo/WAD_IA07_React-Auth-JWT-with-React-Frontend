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
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { useAuthStore } from "@/stores/useAuthStore";

// Import và cấu hình TanStack Query (React Query) để quản lý state từ server
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Khởi tạo client cho React Query (quản lý cache, fetching data...)
const queryClient = new QueryClient();

function App() {
  // Lấy hàm logout từ store
  const logout = useAuthStore((state) => state.logout);
  const { isAuthenticated, login } = useAuthStore();
  useEffect(() => {
    if (!isAuthenticated) return;

    // Hàm gọi refresh token chủ động
    const silentRefresh = async () => {
      try {
        const { data } = await axiosClient.post("/auth/refresh");
        // Cập nhật lại Access Token mới vào kho
        // Lưu ý: Backend trả về accessToken mới, ta cần cập nhật nó
        const isRemembered = !!localStorage.getItem("accessToken");
        login(data.accessToken, null, isRemembered); // null vì refresh token nằm trong cookie rồi
        console.log("🔄 Silent Refresh thành công!");
      } catch (error) {
        console.log("Silent Refresh lỗi (có thể do hết hạn cookie)", error);
      }
    };

    // Thiết lập Interval: Gọi mỗi 9 giây (vì Access Token sống 10s)
    // Trong thực tế nếu Access Token sống 15p, bạn nên để khoảng 14p (14 * 60 * 1000)
    const intervalId = setInterval(silentRefresh, 9000);

    return () => clearInterval(intervalId); // Dọn dẹp khi unmount
  }, [isAuthenticated, login]);

  useEffect(() => {
    // Hàm xử lý khi Storage thay đổi (ở tab khác)
    const handleStorageChange = (event) => {
      // Nếu key bị thay đổi là "accessToken" và giá trị mới là null (tức là bị xóa)
      if (event.key === "accessToken" && event.newValue === null) {
        console.log("Đã đăng xuất từ tab khác -> Đăng xuất tab này luôn.");
        logout(); // Gọi hàm logout để cập nhật state của tab hiện tại
      }
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener("storage", handleStorageChange);

    // Dọn dẹp khi component unmount
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
          {/* 🔒 BẢO VỆ: Phải đăng nhập mới vào được Home */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* 🔓 CÔNG KHAI: Đã đăng nhập thì không vào đây nữa */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Register cũng nên dùng PublicRoute để user đã login không cần đkí lại */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Component Toaster đặt ở cấp cao nhất để thông báo có thể hiển thị đè lên mọi nội dung.
            - richColors: Tự động tô màu xanh/đỏ/vàng tùy theo loại thông báo (success/error/warning).
            - position: Vị trí xuất hiện thông báo (trên cùng, giữa).
        */}
        <Toaster richColors position="top-center" />
      </div>
    </QueryClientProvider>
  );
}

export default App;
