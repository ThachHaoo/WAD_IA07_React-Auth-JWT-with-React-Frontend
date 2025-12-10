import axios from "axios";

// --- 1. CẤU HÌNH CƠ BẢN (Instance Config) ---
// Tạo một bản sao của Axios với các thiết lập mặc định.
const axiosClient = axios.create({
  // baseURL: Đường dẫn gốc API.
  // Logic: Lấy từ biến môi trường (khi deploy) hoặc fallback về localhost (khi dev).
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",

  headers: {
    "Content-Type": "application/json",
  },

  // withCredentials: true
  // CỰC KỲ QUAN TRỌNG KHI DÙNG COOKIE:
  // - Cho phép trình duyệt gửi kèm Cookie (chứa Refresh Token) trong các request gọi sang domain khác (CORS).
  // - Nếu thiếu dòng này: Backend sẽ không nhận được Cookie -> Refresh Token thất bại.
  withCredentials: true,
});

// --- 2. REQUEST INTERCEPTOR (Bộ đánh chặn Request) ---
// Chạy TRƯỚC KHI request được gửi đi.
axiosClient.interceptors.request.use(
  (config) => {
    // Bước 1: Tìm Access Token trong kho lưu trữ (Local hoặc Session tùy user chọn "Ghi nhớ" hay không).
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    // Bước 2: Nếu có token, đính kèm vào Header theo chuẩn JWT.
    // Kết quả: Authorization: Bearer eyJhbGciOi...
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 3. RESPONSE INTERCEPTOR (Bộ đánh chặn Response) ---
// Chạy SAU KHI nhận được phản hồi từ Server.
// Nơi lý tưởng để xử lý các lỗi toàn cục như 401 Unauthorized.
axiosClient.interceptors.response.use(
  (response) => response, // Nếu API thành công (200, 201), trả về dữ liệu bình thường.

  async (error) => {
    // Lấy thông tin về request gốc vừa bị lỗi
    const originalRequest = error.config;

    // TRƯỜNG HỢP NGOẠI LỆ:
    // Nếu lỗi 401 xảy ra ngay tại API Login -> Có nghĩa là sai mật khẩu/tài khoản.
    // -> Không cần refresh token làm gì, trả lỗi về cho component Login xử lý hiển thị thông báo.
    if (originalRequest.url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // LOGIC TỰ ĐỘNG REFRESH TOKEN:
    // Điều kiện:
    // 1. Lỗi là 401 (Unauthorized - Hết hạn token hoặc token sai).
    // 2. !originalRequest._retry: Đảm bảo request này chưa từng được thử lại (tránh vòng lặp vô tận).
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu: "Đang thử cứu request này"

      try {
        console.log("Token hết hạn. Đang thử lấy token mới...");

        // Gọi API Refresh Token
        // Lưu ý: Phải dùng 'axios' gốc hoặc instance khác để tránh lặp interceptor này (tuy nhiên dùng axiosClient vẫn được nếu logic if ở trên chặt chẽ).
        // Quan trọng: { withCredentials: true } để gửi kèm Cookie HttpOnly chứa Refresh Token.
        const response = await axios.post(
          `${axiosClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Nếu thành công, Server trả về AccessToken mới
        const { accessToken } = response.data;

        // Lưu token mới vào nơi lưu trữ cũ (cập nhật đè lên token cũ)
        if (localStorage.getItem("accessToken")) {
          localStorage.setItem("accessToken", accessToken);
        } else {
          sessionStorage.setItem("accessToken", accessToken);
        }

        // Cập nhật lại header Authorization cho request gốc bằng token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Gọi lại request gốc một lần nữa (Retry)
        // Lúc này user sẽ không hề biết là token vừa bị hết hạn, trải nghiệm rất mượt.
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // TRƯỜNG HỢP XẤU NHẤT: Refresh Token cũng hết hạn (hoặc không hợp lệ).
        console.log("Phiên đăng nhập hết hạn. Buộc đăng xuất.");

        // Xóa sạch dấu vết
        localStorage.clear();
        sessionStorage.clear();

        // Chuyển hướng cứng về trang Login (Force Logout)
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Nếu lỗi không phải 401 (ví dụ 404, 500), trả lỗi về bình thường.
    return Promise.reject(error);
  }
);

export default axiosClient;
