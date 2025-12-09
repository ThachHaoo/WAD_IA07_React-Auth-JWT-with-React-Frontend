import { QueryClient } from "@tanstack/react-query";

// Tạo instance ở đây để export dùng chung cho toàn App
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false, // Config mặc định luôn cho tiện
    },
  },
});
