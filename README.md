# Báo cáo đại lý STL (Sơn Thăng Long)

Ứng dụng web React được tối ưu hoá cho thiết bị di động (mobile-first), phục vụ việc ghi nhận báo cáo thị trường và thăm đại lý hàng ngày của nhân viên kinh doanh Sơn Thăng Long.

## Tính năng chính

- **Giao diện thân thiện di động**: Thiết kế một cột, nút to dễ thao tác bằng ngón tay cái khi đi thị trường, thanh công cụ cố định ở đáy màn hình.
- **Tự động lưu định danh nhân viên**: Nhớ tên nhân viên kinh doanh trên thiết bị, cho phép thay đổi bất kỳ lúc nào.
- **Câu nói truyền cảm hứng mỗi ngày**: Hiệu ứng chữ chạy (marquee) câu nói động viên bán hàng thay đổi theo từng ngày.
- **Biểu mẫu ghi nhận đầy đủ**:
  1. Tên đại lý (bắt buộc, tự động kiểm tra lỗi)
  2. Địa điểm (xã / huyện)
  3. Số điện thoại chủ đại lý
  4. Hãng sơn đại lý đang bán (chọn nhanh nhiều chip: Dulux, Nippon, Jotun, Kova, Expo, Mykolor, Mutolux, Khác)
  5. Kết quả thăm đại lý (Chào lần đầu, Ghé chăm sóc, Đã gửi báo giá, Nhập hàng trưng bày, Có đơn hàng, Hẹn quay lại, Chưa quan tâm)
  6. Ghi chú thêm (hỗ trợ nhập liệu bằng giọng nói tiếng Việt qua Web Speech API)
- **Hỗ trợ chế độ ngoại tuyến & Hàng chờ gửi tự động (Offline First)**:
  - Khi mất mạng hoặc sóng 3G/4G yếu, dữ liệu sẽ được lưu an toàn trên máy (`localStorage`).
  - Tự động gửi lại khi có mạng trở lại (`online` event) hoặc bấm nút "Gửi lại".
- **Lịch sử trong ngày**:
  - Xem danh sách các đại lý đã ghé thăm trong ngày với giờ ghé thăm và kết quả.
  - Nhấn vào từng đại lý để xem chi tiết đầy đủ (SĐT, khu vực, sơn đang bán, ghi chú).
  - Nút sao chép báo cáo tổng hợp nhanh gửi qua Zalo / Viber cho trưởng nhóm.
- **Tích hợp Google Sheets**: Dễ dàng kết nối với Web App của Google Apps Script qua hộp thoại cài đặt.

## Cài đặt và phát triển

```bash
# Cài đặt thư viện
npm install

# Khởi chạy dev server (cổng 3000)
npm run dev

# Kiểm tra lỗi type
npm run lint

# Build cho sản phẩm
npm run build
```
