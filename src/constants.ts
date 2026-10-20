export const BRANDS = [
  'Rober',
  'Rober Gold',
  'TF5',
  'Dulux',
  'Nippon',
  'Jotun',
  'Kova',
  'Khác'
];

export const RESULTS = [
  'Mới',
  'Mới - Nhập hàng',
  'Cũ - Ghé thăm',
  'Cũ - Nhập hàng'
];

export const THU = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy'
];

export const QUOTES = [
  'Có công mài sắt, có ngày nên kim.',
  'Kiến tha lâu cũng đầy tổ.',
  'Đi một ngày đàng, học một sàng khôn.',
  'Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao.',
  'Thất bại là mẹ thành công.',
  'Nước chảy đá mòn.',
  'Mỗi đại lý ghé thăm hôm nay là một cánh cửa mở cho tháng sau.',
  'Khách chưa mua hôm nay vẫn nhớ người đã đến tận nơi.',
  'Đại lý tin người trước, rồi mới tin sản phẩm.',
  'Một lời hỏi thăm chân thành đáng giá hơn mười tờ báo giá.',
  'Hôm nay chăm một đại lý, mai có thêm một người bạn làm ăn.',
  'Lời từ chối hôm nay chỉ là lời hẹn cho lần ghé sau.',
  'Sơn tốt nhờ từng lớp đều tay, khách bền nhờ từng lần ghé thăm.',
  'Đi nhiều thì biết nhiều, biết nhiều thì bán được nhiều.',
  'Không có đại lý khó, chỉ có lần ghé chưa đủ.',
  'Ghi lại hôm nay để ngày mai bán tốt hơn.',
  'Hiểu đại lý cần gì là đã bán được một nửa.',
  'Người bán giỏi là người lắng nghe nhiều hơn nói.',
  'Mỗi chuyến đi là một cơ hội, mỗi cuộc gặp là một bài học.',
  'Uy tín xây bằng việc nhỏ làm đều đặn mỗi ngày.',
  'Chất lượng sản phẩm giữ khách, chất lượng người bán kéo khách về.',
  'Bắt đầu ngày mới bằng một nụ cười, đại lý sẽ đón bằng một tách trà.',
  'Hạt giống gieo hôm nay sẽ thành mùa vụ cuối năm.',
  'Kiên trì là thứ đối thủ khó sao chép nhất.',
  'Ít mà chắc còn hơn nhiều mà hời hợt.',
  'Mỗi đại lý mới là một điểm sáng trên bản đồ Thăng Long.',
  'Đường dài mới biết ngựa hay, đi nhiều mới biết đại lý hay.',
  'Làm tốt việc hôm nay là cách chắc nhất để có ngày mai tốt hơn.',
  'Cả đội cùng tiến, doanh số cùng lên. Khẳng định CHẤT!',
  'Chăm chỉ không bao giờ lỗi thời.'
];

export const pad = (n: number) => String(n).padStart(2, '0');

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const getTodayQuote = () => {
  const d = new Date();
  const dayNo = Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 86400000
  );
  const q = QUOTES[((dayNo % QUOTES.length) + QUOTES.length) % QUOTES.length];
  return q;
};
