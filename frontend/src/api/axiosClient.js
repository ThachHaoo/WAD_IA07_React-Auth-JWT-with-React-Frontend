import axios from "axios";

// Tạo một instance (bản sao tùy chỉnh) của Axios để dùng chung cho toàn bộ ứng dụng.
// Lợi ích: Không cần lặp lại việc khai báo URL gốc hay headers trong từng file component.
const axiosClient = axios.create({
  // baseURL: Đường dẫn gốc của API server.
  // Logic xử lý:
  // 1. Ưu tiên lấy từ biến môi trường VITE_API_URL (cấu hình trong file .env).
  //    -> Điều này rất quan trọng khi deploy: Dev dùng localhost, Production dùng domain thật.
  // 2. Nếu không tìm thấy biến môi trường, dùng fallback là "http://localhost:3000".
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",

  // Cấu hình headers mặc định gửi kèm trong mọi request.
  headers: {
    // Thông báo cho Server biết dữ liệu client gửi lên là dạng JSON.
    // Đây là chuẩn giao tiếp phổ biến nhất trong RESTful API hiện nay.
    "Content-Type": "application/json",
  },
});

// Xuất axiosClient ra để sử dụng ở các nơi khác (ví dụ: trong Register.jsx).
// Khi cần gọi API, ta sẽ import 'axiosClient' thay vì 'axios' gốc.
export default axiosClient;
