import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore"; // Dùng Store của bạn

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Logic: Nếu chưa đăng nhập -> Đá về Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập -> Cho phép hiển thị nội dung bên trong (children)
  return children;
};