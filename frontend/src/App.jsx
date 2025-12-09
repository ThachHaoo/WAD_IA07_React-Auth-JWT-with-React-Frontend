import { Routes, Route, Navigate } from "react-router-dom";
// Import các trang (pages) của ứng dụng
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
// Import component hiển thị thông báo (toast) từ thư viện sonner
import { Toaster } from "@/components/ui/sonner";

// Import và cấu hình TanStack Query (React Query) để quản lý state từ server
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Khởi tạo client cho React Query (quản lý cache, fetching data...)
const queryClient = new QueryClient();

function App() {
  // LOGIC XÁC THỰC (AUTHENTICATION):
  // Kiểm tra xem người dùng đã đăng nhập chưa bằng cách tìm token trong LocalStorage hoặc SessionStorage.
  // Dấu "!!" dùng để ép kiểu giá trị tìm được về dạng boolean (true/false).
  // Ví dụ: nếu có chuỗi token -> true, nếu null/undefined -> false.
  const isAuthenticated =
    !!localStorage.getItem("accessToken") ||
    !!sessionStorage.getItem("accessToken");

  return (
    // Bọc toàn bộ ứng dụng trong QueryClientProvider để các component con có thể sử dụng useQuery/useMutation
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        {/* Container chứa các Route */}
        <Routes>
          {/* --- ROUTE TRANG CHỦ (Protected Route) ---
              Logic: Kiểm tra biến isAuthenticated.
              - Nếu TRUE (đã đăng nhập): Hiển thị trang Home.
              - Nếu FALSE (chưa đăng nhập): Render component <Login /> ngay tại đây (hoặc có thể dùng <Navigate to="/login" />).
          */}
          <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />

          {/* --- ROUTE ĐĂNG NHẬP ---
              Logic ngược lại để ngăn người dùng đã đăng nhập quay lại trang login.
              - Nếu TRUE (đã đăng nhập): Tự động chuyển hướng (Navigate) về trang chủ ("/").
              - Nếu FALSE (chưa đăng nhập): Hiển thị form Login.
          */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />

          {/* --- ROUTE ĐĂNG KÝ --- 
              Cho phép truy cập công khai
          */}
          <Route path="/register" element={<Register />} />

          {/* --- ROUTE 404 (Catch-all) ---
              path="*" đại diện cho tất cả các đường dẫn không khớp với các route đã định nghĩa ở trên.
              Sẽ hiển thị trang NotFound.
          */}
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
