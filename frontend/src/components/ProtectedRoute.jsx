import { Navigate } from "react-router-dom";
// Import hook lấy state xác thực từ Zustand Store
import { useAuthStore } from "@/stores/useAuthStore";

// Component bảo vệ Route (Pattern: Higher Order Component / Wrapper)
// children: Là các component con nằm bên trong thẻ <ProtectedRoute> (ví dụ: <Home />)
export const ProtectedRoute = ({ children }) => {
  // Lấy trạng thái đăng nhập hiện tại từ Global Store
  // (Biến này đã được khởi tạo dựa trên localStorage/sessionStorage trong file store)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // LOGIC KIỂM TRA QUYỀN TRUY CẬP:

  // Trường hợp 1: Nếu chưa đăng nhập (!isAuthenticated)
  if (!isAuthenticated) {
    // -> Chặn lại ngay lập tức và chuyển hướng (Redirect) về trang Login.
    // replace: Thay thế entry hiện tại trong lịch sử duyệt web.
    // -> Mục đích: Khi user bị đá về Login, nếu họ bấm nút "Back" trên trình duyệt,
    //    họ sẽ không bị quay lại trang Protected này nữa (tránh vòng lặp redirect).
    return <Navigate to="/login" replace />;
  }

  // Trường hợp 2: Nếu đã đăng nhập thành công
  // -> "Mở cổng" cho phép hiển thị nội dung bên trong (children).
  return children;
};
