import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
// Import các quy tắc validate email/password từ file utils
import { emailValidation, passwordValidation } from "../utils/validations";
// Import các UI component (thường là từ Shadcn UI)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

export default function Login() {
  // Hook dùng để điều hướng trang sau khi login thành công
  const navigate = useNavigate();
  // State để quản lý hiệu ứng loading giả lập khi bấm nút login
  const [isFakeLoading, setIsFakeLoading] = useState(false);

  // Khởi tạo useForm để quản lý form
  const {
    register, // Hàm dùng để đăng ký input vào form hook
    handleSubmit, // Hàm xử lý khi submit form
    formState: { errors }, // Object chứa các lỗi validation
    setValue, // Hàm set giá trị thủ công cho form (dùng cho Checkbox)
    watch, // Hàm theo dõi sự thay đổi giá trị của field
  } = useForm({
    mode: "onChange", // Validate ngay khi người dùng nhập liệu (thay vì lúc submit)
    delayError: 300, // Đợi 300ms sau khi dừng gõ mới báo lỗi (tránh báo lỗi liên tục)
  });

  // Theo dõi giá trị thực tế của checkbox "Ghi nhớ đăng nhập"
  const isRemembered = watch("remember");

  // Hàm xử lý logic khi form hợp lệ và được submit
  const onSubmit = () => {
    // Bật trạng thái loading
    setIsFakeLoading(true);

    // Giả lập độ trễ mạng 1.5 giây
    setTimeout(() => {
      setIsFakeLoading(false);
      // Token giả lập (trong thực tế sẽ nhận từ API response)
      const token = "token_gia_lap_123456";

      // LOGIC QUAN TRỌNG: Xử lý "Ghi nhớ đăng nhập"
      if (isRemembered) {
        // Nếu chọn ghi nhớ: Lưu vào LocalStorage (lưu trữ lâu dài kể cả khi tắt browser)
        localStorage.setItem("accessToken", token);
      } else {
        // Nếu không chọn: Lưu vào SessionStorage (mất đi khi đóng tab/browser)
        sessionStorage.setItem("accessToken", token);
      }

      // Hiển thị thông báo thành công
      toast.success("Chào mừng trở lại! 👋", {
        description: "Đăng nhập thành công. Đang chuyển hướng...",
        duration: 3000,
      });

      // Chuyển hướng về trang chủ sau 1 giây
      setTimeout(() => {
        navigate("/");
        // Reload lại trang để cập nhật state xác thực trên toàn app
        window.location.reload();
      }, 1000);
    }, 1500);
  };

  return (
    // Container chính: căn giữa màn hình, nền xám nhẹ
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      {/* Card chứa form: có animation xuất hiện */}
      <Card className="w-full max-w-md border border-gray-200 shadow-md animate-in fade-in zoom-in-95 duration-700">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Đăng nhập
          </CardTitle>
          <p className="text-sm text-gray-500">
            Nhập email và mật khẩu để truy cập
          </p>
        </CardHeader>

        <CardContent>
          {/* Form wrapper: sử dụng handleSubmit từ useForm */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* --- Input Email --- */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                // Kết nối input với react-hook-form và quy tắc validate
                {...register("email", emailValidation)}
                // Đổi màu viền thành đỏ nếu có lỗi
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {/* Hiển thị dòng thông báo lỗi nếu có */}
              {errors.email && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* --- Input Password --- */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                {...register("password", passwordValidation)}
                className={
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.password && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* --- Checkbox Ghi nhớ đăng nhập --- */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                // Vì Shadcn Checkbox là custom component, cần dùng onCheckedChange để cập nhật value thủ công vào form
                onCheckedChange={(checked) => setValue("remember", checked)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-600"
              >
                Ghi nhớ đăng nhập
              </Label>
            </div>

            {/* --- Nút Submit --- */}
            <Button className="w-full" type="submit" disabled={isFakeLoading}>
              {isFakeLoading ? (
                // Hiển thị Spinner khi đang xử lý
                <>
                  <Spinner className="mr-2" />
                  Đang kiểm tra...
                </>
              ) : (
                "Đăng Nhập"
              )}
            </Button>
          </form>
        </CardContent>

        {/* Footer chuyển hướng trang Đăng ký */}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Đăng ký mới
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
