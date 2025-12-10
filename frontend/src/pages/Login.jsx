import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
// Import Store quản lý auth từ Zustand
import { useAuthStore } from "@/stores/useAuthStore";
// Import các quy tắc validate email/password từ file utils
import { emailValidation, passwordValidation } from "../utils/validations";
// Import hook useMutation (để gọi API thay đổi dữ liệu) và useQueryClient (để quản lý cache)
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

  // Lấy hàm login từ Store để cập nhật trạng thái toàn cục sau khi có token
  const login = useAuthStore((state) => state.login);

  // Hook dùng để thao tác với Cache của React Query
  const queryClient = useQueryClient();

  // Khởi tạo useForm để quản lý form
  const {
    register, // Hàm dùng để đăng ký input vào form hook
    handleSubmit, // Hàm xử lý khi submit form
    formState: { errors }, // Object chứa các lỗi validation
    setValue, // Hàm set giá trị thủ công cho form (dùng cho custom component như Checkbox)
    getValues, // Hàm để lấy giá trị form ngay lập tức mà không cần render lại
  } = useForm({
    mode: "onChange", // Validate ngay khi người dùng nhập liệu (UX tốt hơn)
    delayError: 300, // Đợi 300ms sau khi dừng gõ mới báo lỗi (tránh báo lỗi liên tục khi đang gõ)
  });

  // ✅ USE MUTATION: Quản lý việc gọi API Login
  const mutation = useMutation({
    // Hàm thực hiện gọi API
    mutationFn: async (credentials) => {
      // Gọi API POST /auth/login (axiosClient đã cấu hình base URL)
      return await axiosClient.post("/auth/login", credentials);
    },

    // --- XỬ LÝ KHI THÀNH CÔNG ---
    onSuccess: (response) => {
      // 1. Lấy token và refresh token từ response trả về của NestJS
      const { accessToken, refreshToken } = response.data;

      // 2. Kiểm tra xem người dùng có tick vào "Ghi nhớ đăng nhập" không
      const isRemembered = getValues("remember");

      // 3. Quan trọng: Xóa sạch Cache cũ của React Query
      // Để đảm bảo User mới đăng nhập không nhìn thấy dữ liệu cũ của User trước (nếu dùng chung máy)
      queryClient.removeQueries();

      // 4. Gọi hàm login của Zustand
      // Hàm này sẽ tự động lưu Token vào LocalStorage/SessionStorage và set isAuthenticated = true
      login(accessToken, refreshToken, isRemembered);

      // 5. Hiển thị thông báo thành công
      toast.success("Đăng nhập thành công! 🎉");

      // 6. Chuyển hướng về trang chủ ngay lập tức
      navigate("/");
    },

    // --- XỬ LÝ KHI CÓ LỖI ---
    onError: (error) => {
      // 1. Log lỗi ra console để dev debug
      console.log("Lỗi đăng nhập:", error);

      // 2. Lấy thông báo lỗi từ Backend gửi về
      // Backend NestJS thường trả về object: { statusCode: 401, message: "...", ... }
      const serverMessage = error.response?.data?.message;

      // 3. Xử lý định dạng lỗi:
      // NestJS Class-Validator thường trả về mảng các lỗi (Array), còn lỗi logic thường là chuỗi (String).
      // Ta cần lấy phần tử đầu tiên nếu là mảng.
      const displayMessage = Array.isArray(serverMessage)
        ? serverMessage[0]
        : serverMessage || "Đăng nhập thất bại (Lỗi kết nối)";

      // 4. Hiển thị Toast báo lỗi cho người dùng
      toast.error(displayMessage, {
        description: "Vui lòng kiểm tra lại thông tin.",
      });
    },
  });

  // Hàm này chỉ được gọi khi Form đã Valid (không còn lỗi input)
  const onSubmit = (data) => {
    // Kích hoạt mutation để gọi API
    mutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    // Container chính: căn giữa màn hình, nền xám nhẹ
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      {/* Card chứa form: có animation xuất hiện (fade-in, zoom-in) */}
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
                // Kết nối input với react-hook-form và truyền rules validate
                {...register("email", emailValidation)}
                // Đổi màu viền thành đỏ nếu có lỗi
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {/* Hiển thị dòng text lỗi đỏ bên dưới */}
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
                // LƯU Ý: Shadcn Checkbox là custom component, không có sự kiện onChange chuẩn của HTML.
                // Ta phải dùng onCheckedChange và gọi hàm setValue của React Hook Form thủ công.
                onCheckedChange={(checked) => setValue("remember", checked)}
                tabIndex={-1} // Bỏ qua tab index để UX mượt hơn khi nhấn Tab
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
              // Disable nút khi đang gọi API (tránh click nhiều lần)
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
