import { Navigate } from "react-router-dom";
// Import hook để lấy state từ Zustand Store
import { useAuthStore } from "@/stores/useAuthStore";

// PublicRoute: Component "bảo vệ ngược" (Inverse Protection).
// Mục đích: Dùng để bọc các trang chỉ dành cho KHÁCH (Guest) chưa đăng nhập.
// Ví dụ: Trang Đăng nhập (/login), Trang Đăng ký (/register).
export const PublicRoute = ({ children }) => {
  // Lấy trạng thái xác thực hiện tại
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // LOGIC KIỂM TRA:

  // Nếu người dùng ĐÃ đăng nhập thành công (isAuthenticated = true)
  // -> Mà họ lại cố tình truy cập vào trang Login hoặc Register
  // -> Hệ thống sẽ chặn lại và tự động chuyển hướng họ về Trang chủ (Home).
  if (isAuthenticated) {
    // replace: true -> Thay thế lịch sử duyệt web hiện tại.
    // Tác dụng: Khi user bị đá về Home, nếu họ bấm nút "Back" trên trình duyệt,
    // họ sẽ không bị quay lại trang Login nữa (tránh vòng lặp luẩn quẩn).
    return <Navigate to="/" replace />;
  }

  // Nếu CHƯA đăng nhập
  // -> Cho phép hiển thị nội dung bên trong (children) bình thường (Form Login/Register).
  return children;
};
