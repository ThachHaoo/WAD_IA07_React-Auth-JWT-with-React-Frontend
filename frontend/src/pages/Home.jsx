import { useAuthStore } from "@/stores/useAuthStore";
// Import hook useQuery từ thư viện TanStack Query để fetch dữ liệu
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
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
// Import Component Modal chỉnh sửa thông tin (được tách ra file riêng cho gọn)
import { EditProfileDialog } from "@/components/EditProfileDialog";

export default function Home() {
  // Lấy hàm logout từ Global Store (Zustand)
  const logout = useAuthStore((state) => state.logout);

  // --- SỬ DỤNG USEQUERY ĐỂ FETCH DATA ---
  const {
    data: userData, // Dữ liệu trả về từ API
    isLoading, // Trạng thái đang tải (true/false)
    isError, // Trạng thái lỗi (true/false)
  } = useQuery({
    queryKey: ["userProfile"], // Key định danh duy nhất cho request này (dùng để caching và invalidate sau này)
    queryFn: async () => {
      // Gọi API bảo mật. axiosClient đã được cấu hình Interceptor để tự động gắn Access Token vào Header.
      const response = await axiosClient.get("/user/profile");
      return response.data;
    },
    // --- CẤU HÌNH CACHE & RETRY ---
    // retry: 1 -> Nếu gọi API thất bại, thử lại 1 lần nữa.
    // Nếu vẫn lỗi (VD: Token hết hạn và Refresh Token cũng hết hạn) -> Chuyển sang isError.
    retry: 1,

    // staleTime: 5 phút.
    // Ý nghĩa: Trong vòng 5 phút sau khi fetch, dữ liệu được coi là "tươi mới".
    // Nếu bạn chuyển sang trang khác rồi quay lại Home trong 5p này, nó sẽ dùng cache cũ chứ KHÔNG gọi lại API.
    staleTime: 1000 * 60 * 5,

    // refetchOnWindowFocus: false.
    // Tắt tính năng tự động gọi lại API khi người dùng bấm Alt+Tab ra ngoài rồi quay lại.
    refetchOnWindowFocus: false,
  });

  // XỬ LÝ LỖI NGHIÊM TRỌNG:
  // Nếu isError = true (tức là không thể lấy được profile, kể cả sau khi thử refresh token),
  // ta hiểu là phiên đăng nhập đã hỏng hoàn toàn -> Gọi logout để đá user về trang Login.
  if (isError) {
    logout();
    return null; // Không render gì cả trong lúc chuyển hướng
  }

  // Hàm xử lý khi bấm nút Đăng xuất
  const handleLogout = () => {
    toast.info("Đang đăng xuất...", {
      description: "Hẹn gặp lại bạn sớm!",
      duration: 2000,
    });

    // Delay 1 giây để người dùng kịp đọc thông báo rồi mới thực hiện logout
    setTimeout(() => {
      logout();
    }, 1000);
  };

  return (
    // Container chính: căn giữa nội dung, chiều cao tối thiểu bằng màn hình, nền xám nhẹ
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      {/* Card chứa thông tin: có hiệu ứng animation xuất hiện (fade-in, zoom-in) */}
      <Card className="w-full max-w-md overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-500 shadow-md">
        {/* --- PHẦN HEADER (BANNER) --- */}
        {isLoading ? (
          // Hiển thị Skeleton (khung xương giả lập) nếu đang tải
          <Skeleton className="h-32 w-full rounded-none" />
        ) : (
          // Hiển thị màu nền gradient nếu đã tải xong
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 h-32 w-full animate-in fade-in duration-700"></div>
        )}

        <CardContent className="px-8 pb-8 flex flex-col items-center relative">
          {/* Avatar container: sử dụng margin âm (-mt-16) để đẩy avatar đè lên phần header màu phía trên */}
          <div className="-mt-16 mb-4 rounded-full p-1.5 bg-white border border-gray-200">
            {isLoading ? (
              <Skeleton className="h-28 w-28 rounded-full" />
            ) : (
              <Avatar className="h-28 w-28 border-4 border-white animate-in fade-in zoom-in-75 duration-500">
                {/* Ảnh avatar ngẫu nhiên từ API dicebear dựa trên seed */}
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* --- PHẦN TÊN VÀ EMAIL --- */}
          <div className="text-center space-y-2 w-full flex flex-col items-center">
            {isLoading ? (
              // Skeleton cho tên và email
              <>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-6 w-20 rounded-full" />{" "}
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </>
            ) : (
              // Dữ liệu thật
              <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {/* LOGIC HIỂN THỊ TÊN:
                      1. Ưu tiên hiển thị 'fullName' trong bảng profile (nếu user đã cập nhật).
                      2. Nếu chưa có fullName (null/undefined), lấy phần đầu của email làm tên hiển thị.
                  */}
                  {userData.profile?.fullName || userData.email.split("@")[0]}
                </h2>
                <p className="text-sm font-medium text-gray-500">
                  {userData?.email}
                </p>

                {/* Component Dialog để chỉnh sửa thông tin */}
                <EditProfileDialog user={userData} />

                {/* Các huy hiệu trạng thái (Active, Verified) - Demo giao diện */}
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

          {/* --- PHẦN CHI TIẾT THÔNG TIN (Profile Detail) --- */}
          <div className="w-full space-y-4">
            {isLoading ? (
              // Vòng lặp tạo 3 dòng Skeleton giả lập danh sách thông tin
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
                {/* User ID */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">
                    User ID
                  </span>
                  <span className="font-bold text-foreground">
                    {userData?.id}
                  </span>
                </div>
                <Separator />

                {/* Joined Date */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">
                    Joined Date
                  </span>
                  {/* Format ngày tạo từ Database sang chuẩn Việt Nam (dd/mm/yyyy) */}
                  <span className="font-bold text-foreground">
                    {new Date(userData?.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <Separator />

                {/* Ngày sinh (Birthday) */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">
                    Birthday
                  </span>
                  <span className="font-bold text-foreground">
                    {/* Kiểm tra null: Nếu có ngày sinh thì format, không thì hiện text fallback */}
                    {userData?.profile?.dateOfBirth
                      ? new Date(
                          userData.profile.dateOfBirth
                        ).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </span>
                </div>
                <Separator />

                {/* Địa chỉ (Address) */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">
                    Address
                  </span>
                  {/* truncate max-w-[200px]: Tự động cắt ngắn và thêm dấu '...' nếu địa chỉ quá dài */}
                  <span className="font-bold text-foreground truncate max-w-[200px]">
                    {userData?.profile?.address || "Chưa cập nhật"}
                  </span>
                </div>
                <Separator />

                {/* Last Login (Demo text) */}
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
            disabled={isLoading} // Disable nút khi đang loading để tránh lỗi click nhiều lần
          >
            <LogOut size={16} />
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
