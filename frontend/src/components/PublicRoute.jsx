import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Logic: Nếu đã đăng nhập -> Đá về Home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Nếu chưa -> Cho phép vào (Login/Register)
  return children;
};
