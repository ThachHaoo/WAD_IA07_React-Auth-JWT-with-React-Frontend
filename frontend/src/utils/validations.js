// File này chứa các quy tắc kiểm tra dữ liệu (validation rules) dùng chung cho toàn bộ ứng dụng.
// Việc tách riêng ra giúp code gọn gàng hơn và dễ dàng tái sử dụng ở nhiều form khác nhau (Login, Register, Profile, v.v.).

export const emailValidation = {
  // Rule 1: Bắt buộc nhập (Required)
  // Nếu người dùng bỏ trống, thư viện sẽ trả về lỗi với message này.
  required: "Vui lòng nhập email",

  // Rule 2: Kiểm tra định dạng (Pattern)
  pattern: {
    // Biểu thức chính quy (Regex) chuẩn để kiểm tra một địa chỉ email hợp lệ
    // (Bao gồm: ký tự trước @, ký tự @, domain, và đuôi domain như .com, .vn)
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "Email không hợp lệ (ví dụ: abc@gmail.com)",
  },
};

export const passwordValidation = {
  // Rule 1: Bắt buộc nhập (Required)
  required: "Vui lòng nhập mật khẩu",

  // Rule 2: Độ dài tối thiểu (MinLength)
  minLength: {
    value: 6, // Yêu cầu mật khẩu phải có ít nhất 6 ký tự
    message: "Mật khẩu phải có ít nhất 6 ký tự",
  },
};
