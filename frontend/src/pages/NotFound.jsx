import { Link } from "react-router-dom";
// Import UI components
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    // Container chính: Flexbox căn giữa nội dung (ngang và dọc), chiều cao tối thiểu bằng màn hình (min-h-screen)
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4 text-center">
      {/* Tiêu đề số "404" khổng lồ 
        - text-[10rem]: Cỡ chữ cực lớn (custom size)
        - text-transparent + bg-clip-text + bg-linear-to-r: Tạo hiệu ứng chữ gradient (màu chuyển từ xanh dương sang chàm)
        - select-none: Ngăn người dùng bôi đen/copy text này
      */}
      <h1 className="text-[10rem] font-extrabold leading-none tracking-tight text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 select-none">
        404
      </h1>

      {/* Khu vực chứa thông báo chi tiết */}
      <div className="mt-6 space-y-4">
        {/* Tiêu đề thông báo lỗi */}
        <h3 className="text-2xl font-bold md:text-3xl text-gray-900">
          Oops! Trang này không tồn tại.
        </h3>

        {/* Đoạn văn giải thích nguyên nhân, giới hạn chiều rộng (max-w-md) để dễ đọc hơn */}
        <p className="text-gray-500 max-w-md mx-auto text-base">
          Có vẻ như đường dẫn bạn truy cập bị sai, trang đã bị xóa hoặc đã
          chuyển sang địa chỉ mới.
        </p>

        {/* Khu vực chứa nút điều hướng */}
        <div className="flex justify-center gap-4 mt-8">
          {/* Link của react-router-dom để quay về trang chủ ("/") */}
          <Link to="/">
            <Button
              size="lg"
              className="gap-2 border border-blue-700 bg-blue-600 hover:bg-blue-700"
            >
              {/* Icon Home từ thư viện Lucide */}
              <Home size={18} />
              Về Trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
