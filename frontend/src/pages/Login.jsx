import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
// Import các quy tắc validate email/password từ file utils
import { emailValidation, passwordValidation } from "../utils/validations";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
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

  const login = useAuthStore((state) => state.login);

  // Khởi tạo useForm để quản lý form
  const {
    register, // Hàm dùng để đăng ký input vào form hook
    handleSubmit, // Hàm xử lý khi submit form
    formState: { errors }, // Object chứa các lỗi validation
    setValue, // Hàm set giá trị thủ công cho form (dùng cho Checkbox)
    getValues, // Hàm để lấy giá trị form mà không gây re-render
  } = useForm({
    mode: "onChange", // Validate ngay khi người dùng nhập liệu (thay vì lúc submit)
    delayError: 300, // Đợi 300ms sau khi dừng gõ mới báo lỗi (tránh báo lỗi liên tục)
  });

  // ✅ THÊM MỚI: Khai báo useMutation để gọi API thật
  const mutation = useMutation({
    mutationFn: async (credentials) => {
      // Gọi API POST /auth/login
      return await axiosClient.post("/auth/login", credentials);
    },
    onSuccess: (response) => {
      // Lấy token từ response trả về
      const { accessToken, refreshToken } = response.data;

      const isRemembered = getValues("remember");

      // 3. GỌI HÀM LOGIN CỦA ZUSTAND
      // (Nó sẽ tự lưu storage và set state isAuthenticated = true)
      login(accessToken, refreshToken, isRemembered);

      toast.success("Đăng nhập thành công! 🎉");
      // 4. Chuyển hướng ngay lập tức (Mượt mà, không reload)
      navigate("/");
    },
    onError: (error) => {
      // 1. Log ra xem cấu trúc lỗi là gì (để debug)
      console.log("Lỗi đăng nhập:", error);

      // 2. Lấy thông báo lỗi từ Backend gửi về
      // NestJS thường trả về: { statusCode: 401, message: "Email hoặc mật khẩu không đúng", ... }
      const serverMessage = error.response?.data?.message;

      // 3. Nếu serverMessage là mảng (do class-validator trả về nhiều lỗi), lấy cái đầu tiên
      const displayMessage = Array.isArray(serverMessage)
        ? serverMessage[0]
        : serverMessage || "Đăng nhập thất bại (Lỗi kết nối)";

      // 4. Hiển thị Toast
      toast.error(displayMessage, {
        description: "Vui lòng kiểm tra lại thông tin.",
      });
    },
  });

  // Hàm xử lý logic khi form hợp lệ và được submit
  const onSubmit = (data) => {
    // Gọi API thật với dữ liệu từ form
    mutation.mutate({
      email: data.email,
      password: data.password,
    });
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
                onCheckedChange={(checked) => setValue("remember", checked)} tabIndex={-1}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-600"
              >
                Ghi nhớ đăng nhập
              </Label>
            </div>

            {/* --- Nút Submit --- */}
            <Button
              className="w-full"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                // Hiển thị Spinner khi đang xử lý
                <>
                  <Spinner className="mr-2" />
                  Đang đăng nhập...
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
