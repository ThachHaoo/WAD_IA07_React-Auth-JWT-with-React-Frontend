import { useForm } from "react-hook-form";
// Import hook useMutation (để gọi API sửa đổi) và useQueryClient (để quản lý cache)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

// Import các thành phần của Shadcn UI để dựng Dialog (Modal)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function EditProfileDialog({ user }) {
  // State quản lý việc Đóng/Mở modal
  const [open, setOpen] = useState(false);

  // Lấy instance của QueryClient để thao tác với Cache dữ liệu
  const queryClient = useQueryClient();

  // Khởi tạo React Hook Form
  const { register, handleSubmit } = useForm({
    // Gán giá trị mặc định cho form bằng dữ liệu user hiện tại
    defaultValues: {
      fullName: user?.profile?.fullName || "",

      // XỬ LÝ ĐỊNH DẠNG NGÀY THÁNG (Quan trọng):
      // - Input type="date" của HTML bắt buộc định dạng "YYYY-MM-DD".
      // - Dữ liệu từ Server (Postgres/TypeORM) trả về thường là ISO string: "2003-10-24T00:00:00.000Z"
      // -> Ta cần cắt chuỗi (split) tại chữ 'T' và lấy phần đầu tiên [0].
      dateOfBirth: user?.profile?.dateOfBirth
        ? user.profile.dateOfBirth.toString().split("T")[0]
        : "",

      address: user?.profile?.address || "",
    },
  });

  // useMutation: Hook chuyên dùng cho các tác vụ thay đổi dữ liệu (Create/Update/Delete)
  const mutation = useMutation({
    mutationFn: async (data) => {
      // Gọi API PATCH để cập nhật thông tin (chỉ cập nhật những trường thay đổi)
      return await axiosClient.patch("/user/profile", data);
    },
    onSuccess: () => {
      toast.success("Cập nhật thành công!");

      // --- DÒNG CODE QUAN TRỌNG NHẤT ---
      // invalidateQueries(["userProfile"]):
      // Ý nghĩa: Đánh dấu dữ liệu có key ["userProfile"] (đang hiển thị ở trang mẹ) là "cũ" (stale).
      // -> React Query sẽ TỰ ĐỘNG gọi lại API lấy profile mới nhất và cập nhật lại giao diện.
      // -> User thấy thông tin đổi ngay lập tức mà không cần F5 reload trang.
      queryClient.invalidateQueries(["userProfile"]);

      setOpen(false); // Đóng modal sau khi cập nhật xong
    },
    onError: () => {
      toast.error("Cập nhật thất bại.");
    },
  });

  // Hàm xử lý khi user nhấn nút Lưu
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    // Component Dialog kiểm soát việc hiển thị Modal
    <Dialog open={open} onOpenChange={setOpen}>
      {/* DialogTrigger: Nút bấm để mở Modal */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil size={14} /> Chỉnh sửa
        </Button>
      </DialogTrigger>

      {/* DialogContent: Nội dung bên trong Modal */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật thông tin</DialogTitle>
          <DialogDescription>
            Thay đổi thông tin cá nhân của bạn tại đây.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Input Họ tên */}
          <div className="grid gap-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              {...register("fullName")} // Kết nối input với Hook Form
              placeholder="Nguyễn Văn A"
            />
          </div>

          {/* Input Ngày sinh */}
          <div className="grid gap-2">
            <Label htmlFor="dateOfBirth">Ngày sinh</Label>
            <Input
              id="dateOfBirth"
              type="date" // Hiển thị lịch chọn ngày
              {...register("dateOfBirth")}
            />
          </div>

          {/* Input Địa chỉ */}
          <div className="grid gap-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Hà Nội, Việt Nam"
            />
          </div>

          <DialogFooter>
            {/* Nút Submit */}
            <Button type="submit" disabled={mutation.isPending}>
              {/* Hiển thị vòng xoay loading nếu đang gọi API */}
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
