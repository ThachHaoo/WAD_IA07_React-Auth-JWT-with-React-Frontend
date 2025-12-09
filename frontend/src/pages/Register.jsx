import { useForm } from "react-hook-form";
// Import hook useMutation từ TanStack Query để xử lý các yêu cầu thay đổi dữ liệu (POST/PUT/DELETE)
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
// Import các quy tắc validate từ utils
import { emailValidation, passwordValidation } from "../utils/validations";
import { AlertCircle } from "lucide-react";
// Import các UI component
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export default function Register() {
  const navigate = useNavigate();

  // Khởi tạo React Hook Form
  const {
    register, // Hàm đăng ký input
    handleSubmit, // Hàm xử lý submit
    setValue, // Hàm set giá trị thủ công (dùng cho custom component như Checkbox)
    watch, // Hàm theo dõi giá trị của field
    formState: { errors }, // Object chứa lỗi validation
  } = useForm({
    mode: "onChange", // Validate ngay khi người dùng nhập liệu
    delayError: 300, // Trì hoãn hiển thị lỗi 300ms để tránh giật giao diện
  });

  // Theo dõi xem người dùng đã tick vào ô "Đồng ý điều khoản" chưa
  const termsAccepted = watch("terms");

  // Sử dụng useMutation để xử lý việc gọi API đăng ký
  const mutation = useMutation({
    // Hàm thực hiện gọi API
    mutationFn: async (newUser) => {
      // Gửi request POST đến endpoint /user/register
      return await axiosClient.post("/user/register", newUser);
    },
    // Callback chạy khi đăng ký thành công
    onSuccess: () => {
      toast.success("Đăng ký thành công! 🎉", {
        description: "Bạn sẽ được chuyển sang trang đăng nhập ngay bây giờ.",
        duration: 3000,
      });
      // Chuyển hướng người dùng về trang đăng nhập
      navigate("/login");
    },
    // Callback chạy khi có lỗi từ server
    onError: (error) => {
      // Lấy message lỗi từ response của server hoặc dùng message mặc định
      const message = error.response?.data?.message || "Có lỗi xảy ra";
      toast.error("Đăng ký thất bại", {
        description: message,
      });
    },
  });

  // Hàm được gọi khi form hợp lệ
  const onSubmit = (data) => {
    // Kích hoạt mutation để gọi API với dữ liệu form
    mutation.mutate(data);
  };

  return (
    // Container chính: căn giữa, nền xám
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md border border-gray-200 animate-in fade-in zoom-in-95 duration-500 shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Đăng Ký Tài Khoản
          </CardTitle>
          <p className="text-sm text-gray-500">
            Tạo tài khoản mới để bắt đầu trải nghiệm
          </p>
        </CardHeader>

        <CardContent>
          {/* Hiển thị thông báo lỗi (Alert) nếu API trả về lỗi.
             mutation.isError: true nếu mutation gặp lỗi.
          */}
          {mutation.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi đăng ký</AlertTitle>
              <AlertDescription>
                {/* Hiển thị chi tiết lỗi từ backend */}
                {mutation.error?.response?.data?.message ||
                  "Đã xảy ra lỗi không xác định."}
              </AlertDescription>
            </Alert>
          )}

          {/* Form wrapper */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* --- Input Email --- */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email", emailValidation)}
                // Đổi màu viền đỏ nếu có lỗi
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {/* Message lỗi */}
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

            {/* --- Checkbox Terms --- */}
            <div className="flex items-top space-x-2">
              <Checkbox
                id="terms"
                // Checkbox của Shadcn không phải input native, cần dùng setValue để cập nhật form hook
                onCheckedChange={(checked) => setValue("terms", checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-600"
                >
                  Tôi đồng ý với các{" "}
                  <span className="text-blue-600 underline hover:text-blue-500">
                    điều khoản và dịch vụ
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bạn cần đồng ý để tiếp tục.
                </p>
              </div>
            </div>

            {/* --- Nút Submit --- */}
            <Button
              className="w-full"
              type="submit"
              // Disable nút khi:
              // 1. Đang gọi API (mutation.isPending)
              // 2. Hoặc chưa đồng ý điều khoản (!termsAccepted)
              disabled={mutation.isPending || !termsAccepted}
            >
              {mutation.isPending ? (
                // Hiển thị loading state
                <>
                  <Spinner className="mr-2" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng Ký"
              )}
            </Button>
          </form>
        </CardContent>

        {/* Footer chuyển hướng sang trang Login */}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/"
              className="font-semibold text-blue-600 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
