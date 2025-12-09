import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

// Shadcn UI
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
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: user?.profile?.fullName || "",
      // Check kỹ profile có tồn tại không trước khi split
      dateOfBirth: user?.profile?.dateOfBirth
        ? user.profile.dateOfBirth.toString().split("T")[0]
        : "",
      address: user?.profile?.address || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Chỉ gửi những trường có dữ liệu
      return await axiosClient.patch("/user/profile", data);
    },
    onSuccess: () => {
      toast.success("Cập nhật thành công!");
      // 👇 Quan trọng: Báo cho React Query biết data 'userProfile' đã cũ, cần fetch lại ngay
      queryClient.invalidateQueries(["userProfile"]);
      setOpen(false); // Đóng modal
    },
    onError: () => {
      toast.error("Cập nhật thất bại.");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil size={14} /> Chỉnh sửa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật thông tin</DialogTitle>
          <DialogDescription>
            Thay đổi thông tin cá nhân của bạn tại đây.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dateOfBirth">Ngày sinh</Label>
            <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Hà Nội, Việt Nam"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
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
