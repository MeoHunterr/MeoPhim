# MèoPhim - iOS Anime Streaming (TrollStore)

MèoPhim là ứng dụng giải trí mã nguồn mở cho iOS (hỗ trợ TrollStore), cho phép tìm kiếm và xem phim/anime từ các nguồn Torrent và HTTP trực tuyến với trải nghiệm mượt mà.

## 🚀 Tính năng chính
- **P2P Streaming:** Xem phim ngay lập tức từ magnet link mà không cần tải hết file.
- **Addon Ecosystem:** Tương thích với giao thức Stremio (Torrentio, Cinemeta, Kitsu...).
- **Multi-Subtitles:** Hỗ trợ phụ đề tiếng Việt tự động từ MSubtitles.
- **Dark Mode UI:** Thiết kế hiện đại, tối giản bằng NativeWind (Tailwind CSS).
- **TrollStore Ready:** Hoạt động hoàn hảo trên iOS 16+ qua TrollStore.

## 🛠 Công nghệ sử dụng
- **React Native (Bare Workflow)**
- **NativeWind:** Styling cực nhanh với Tailwind.
- **WebTorrent:** Engine streaming torrent tuần tự.
- **Zustand:** Quản lý trạng thái lịch sử và yêu thích.

## 📦 Cài đặt Dev
```bash
npm install
cd ios && pod install
npx react-native run-ios
```

## 🏗 Build IPA
Ứng dụng sử dụng GitHub Actions để tự động tạo file IPA. Bạn có thể tìm thấy trong tab **Actions** của repository này sau khi push code.

## ⚖️ Giấy phép
Dự án được tạo ra cho mục đích học tập và nghiên cứu. Chúng tôi không lưu trữ bất kỳ nội dung video nào trên máy chủ.
