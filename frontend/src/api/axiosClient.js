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
  withCredentials: true, // Cho phép gửi kèm Cookie (nếu có) trong các request giữa các nguồn gốc (Cross-Origin)
});

// 1️⃣ REQUEST INTERCEPTOR: Gắn Token vào mọi request
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage hoặc sessionStorage
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2️⃣ RESPONSE INTERCEPTOR: Xử lý lỗi 401 và Refresh Token
axiosClient.interceptors.response.use(
  (response) => response, // Nếu thành công thì trả về data
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 (Unauthorized) và request này chưa từng được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu đã thử lại để tránh vòng lặp vô tận

      try {
        // Lấy refreshToken từ nơi lưu trữ
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        // Lưu Access Token mới
        if (localStorage.getItem("accessToken")) {
          localStorage.setItem("accessToken", accessToken);
        } else {
          sessionStorage.setItem("accessToken", accessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return axiosClient(originalRequest);

      } catch (refreshError) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Xuất axiosClient ra để sử dụng ở các nơi khác (ví dụ: trong Register.jsx).
// Khi cần gọi API, ta sẽ import 'axiosClient' thay vì 'axios' gốc.
export default axiosClient;
