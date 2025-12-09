import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// Import các icon từ thư viện lucide-react
import { LogOut, CheckCircle2, ShieldCheck } from "lucide-react";
// Import các UI component (thường là từ Shadcn UI)
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
// Import thư viện hiển thị thông báo (toast)
import { toast } from "sonner";

export default function Home() {
  // Hook dùng để điều hướng trang (tuy nhiên trong code này chưa thấy sử dụng trực tiếp)
  const navigate = useNavigate();

  // State quản lý trạng thái tải trang (loading) và dữ liệu người dùng
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // useEffect để giả lập việc gọi API lấy dữ liệu người dùng khi component được mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Set dữ liệu giả lập sau 1 giây
      setUserData({
        name: "Admin User",
        email: "admin@gmail.com",
        role: "Administrator",
        // Format ngày hiện tại thành dạng chuỗi (VD: Oct 24, 2023)
        joinedDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
      });
      // Tắt trạng thái loading
      setIsLoading(false);
    }, 1000);

    // Cleanup function: dọn dẹp timer nếu component bị unmount trước khi timer chạy xong
    return () => clearTimeout(timer);
  }, []);

  // Hàm xử lý sự kiện đăng xuất
  const handleLogout = () => {
    // Hiển thị thông báo đang đăng xuất
    toast.info("Đang đăng xuất...", {
      description: "Hẹn gặp lại bạn sớm!",
      duration: 2000,
    });

    // Đợi 1 giây để người dùng đọc thông báo rồi mới thực hiện xóa token
    setTimeout(() => {
      // Xóa token xác thực trong LocalStorage và SessionStorage
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      // Tải lại trang để reset toàn bộ trạng thái ứng dụng (thường sẽ dẫn về trang Login)
      window.location.reload();
    }, 1000);
  };

  return (
    // Container chính: căn giữa nội dung, chiều cao tối thiểu bằng màn hình, nền xám nhẹ
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      {/* Card chứa thông tin: có hiệu ứng animation xuất hiện (fade-in, zoom-in) */}
      <Card className="w-full max-w-md overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-500 shadow-md">
        {/* Phần Header màu nền (hoặc Skeleton khi đang load) */}
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-none" />
        ) : (
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 h-32 w-full animate-in fade-in duration-700"></div>
        )}

        <CardContent className="px-8 pb-8 flex flex-col items-center relative">
          {/* Avatar container: sử dụng margin âm (-mt-16) để đẩy avatar đè lên phần header màu phía trên */}
          <div className="-mt-16 mb-4 rounded-full p-1.5 bg-white border border-gray-200">
            {isLoading ? (
              <Skeleton className="h-28 w-28 rounded-full" />
            ) : (
              <Avatar className="h-28 w-28 border-4 border-white animate-in fade-in zoom-in-75 duration-500">
                {/* Ảnh avatar lấy từ API dicebear */}
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Phần hiển thị Tên và Email */}
          <div className="text-center space-y-2 w-full flex flex-col items-center">
            {isLoading ? (
              // Hiển thị khung xương (Skeleton) khi đang tải dữ liệu
              <>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-6 w-20 rounded-full" />{" "}
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </>
            ) : (
              // Hiển thị dữ liệu thật khi đã tải xong
              <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {userData.name}
                </h2>
                <p className="text-sm font-medium text-gray-500">
                  {userData.email}
                </p>

                {/* Các huy hiệu trạng thái (Active, Verified) */}
                <div className="flex justify-center gap-2 mt-3">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 hover:bg-green-200 gap-1"
                  >
                    <CheckCircle2 size={12} /> Active
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 gap-1"
                  >
                    <ShieldCheck size={12} /> Verified
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Phần thông tin chi tiết (Role, Joined Date, Last Login) */}
          <div className="w-full space-y-4">
            {isLoading ? (
              // Vòng lặp tạo 3 dòng Skeleton
              [1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  {/* Chỉ hiển thị đường kẻ ngăn cách nếu không phải dòng cuối cùng */}
                  {i !== 3 && <Separator />}
                </div>
              ))
            ) : (
              // Dữ liệu chi tiết thật
              <div className="space-y-4 animate-in fade-in duration-1000">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Role</span>
                  <span className="font-bold text-gray-900">
                    {userData.role}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">
                    Member since
                  </span>
                  <span className="font-bold text-gray-900">
                    {userData.joinedDate}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Last Login</span>
                  <span className="font-bold text-gray-900">Just now</span>
                </div>
              </div>
            )}
          </div>

          {/* Nút đăng xuất */}
          <Button
            onClick={handleLogout}
            className="w-full mt-8 bg-slate-900 hover:bg-slate-800 gap-2"
            size="lg"
            disabled={isLoading} // Disable nút khi đang loading
          >
            <LogOut size={16} />
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
