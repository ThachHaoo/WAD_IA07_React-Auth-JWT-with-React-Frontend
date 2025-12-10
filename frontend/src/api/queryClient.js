import { QueryClient } from "@tanstack/react-query";

// Tạo instance QueryClient tại đây và export ra.
// LÝ DO TÁCH RA FILE RIÊNG (Thay vì tạo trực tiếp trong App.jsx):
// 1. Giúp code gọn gàng, tập trung cấu hình (Config) tại một chỗ.
// 2. QUAN TRỌNG NHẤT: Để có thể import `queryClient` vào các file JS thường (Non-React Component).
//    -> Ví dụ: Bạn cần import nó vào 'useAuthStore.js' (Zustand) để gọi hàm `queryClient.removeQueries()` khi Logout.
//    -> Nếu tạo trong App.jsx, bạn sẽ không thể export nó ra để dùng ở chỗ khác được.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // retry: Số lần tự động thử lại request nếu gặp lỗi (VD: mạng chập chờn).
      // Mặc định là 3 lần (khá nhiều).
      // Set là 1 -> Nếu lỗi, thử lại 1 lần nữa. Nếu vẫn lỗi -> Ném ra Error cho UI xử lý.
      retry: 1,

      // refetchOnWindowFocus: Tự động gọi lại API khi người dùng click chuột lại vào tab trình duyệt (Alt+Tab).
      // Mặc định là true (Rất tốt cho dữ liệu chứng khoán, tin tức cần real-time).
      // Nhưng với các app quản lý (CRUD), việc này gây spam request không cần thiết -> Set false để tắt.
      refetchOnWindowFocus: false,
    },
  },
});
