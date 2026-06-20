# 🛍️ Đặc Sản Việt - Nền Tảng Thương Mại Điện Tử Đặc Sản Vùng Miền

[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 🌾 **Đặc Sản Việt** là hệ thống thương mại điện tử hiện đại, chuyên cung cấp và phân phối các loại đặc sản chất lượng cao từ mọi miền Tổ quốc. Dự án được xây dựng trên mô hình nguyên bản hướng khách hàng kết hợp trang quản trị chuyên nghiệp sử dụng công nghệ cốt lõi React, Express và Prisma ORM.

---

## 📌 Giới thiệu dự án

Dự án **Đặc Sản Việt** kết nối trực tiếp khách hàng với các đặc sản địa phương uy tín. Hệ thống giải quyết bài toán giao dịch trực tuyến tiện lợi, cung cấp đầy đủ thông tin xuất xứ sản phẩm, quản lý kho hàng và đơn hàng hiệu quả cho người bán.

### 🌟 Tính năng nổi bật

#### 🛒 Phía Khách hàng (Storefront)
*   🔍 **Tìm kiếm & Phân loại**: Bộ lọc theo vùng miền, danh mục đặc sản nhanh chóng.
*   🛍️ **Giỏ hàng trực tuyến**: Thêm, sửa số lượng sản phẩm trực quan, tính toán giá tự động.
*   💳 **Thanh toán linh hoạt**: Hỗ trợ đặt hàng giao nhận COD và quét mã QR chuyển khoản nhanh.
*   📰 **Tin tức & Cẩm nang**: Cập nhật thông tin văn hóa ẩm thực đặc sản vùng miền.

#### 💼 Phía Quản trị viên (Admin Dashboard)
*   📊 **Thống kê Tổng quan**: Báo cáo doanh thu, đơn hàng, biểu đồ tăng trưởng và danh sách sản phẩm bán chạy.
*   📦 **Quản lý Sản phẩm & Danh mục**: Thêm mới, chỉnh sửa, kiểm soát tồn kho và phân loại sản phẩm.
*   📋 **Quản lý Đơn hàng**: Tiếp nhận, chuyển đổi trạng thái xử lý đơn hàng chi tiết.
*   👥 **Quản lý Người dùng & Khách hàng**: Giám sát danh sách tài khoản mua sắm và vai trò quản trị.
*   🎟️ **Quản lý Khuyến mãi**: Thiết lập các sự kiện ưu đãi, chiết khấu.

---

## 🛠️ Công nghệ sử dụng

| Lớp (Layer) | Công nghệ chính | Mô tả |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Tailwind CSS, Lucide Icons | Xây dựng giao diện mượt mà, tối ưu hóa tốc độ load trang và responsive hoàn hảo |
| **Backend** | Node.js, Express, Multer, Zod, JWT, BcryptJS | RESTful API bảo mật, xác thực người dùng chặt chẽ và chuẩn hóa dữ liệu đầu vào |
| **Database & ORM** | MySQL, Prisma ORM | Quản lý mô hình quan hệ dữ liệu hiệu quả, tối ưu truy vấn dữ liệu lớn |
| **Công cụ hỗ trợ** | Concurrently, Nodemon | Tự động hóa quá trình chạy đồng thời client - server trong môi trường phát triển |

---

## 📂 Cấu trúc thư mục dự án

```text
DacSanViet_Ecommerce/
├── client/              # Frontend React Application (Vite)
│   ├── public/          # Assets tĩnh (ảnh sản phẩm, logos)
│   └── src/
│       ├── admin/       # Layouts & Pages quản trị hệ thống
│       ├── components/  # Các component dùng chung (AppLayout,...)
│       ├── context/     # Quản lý state toàn cục (CartContext,...)
│       ├── pages/       # Các trang phía khách hàng
│       └── styles.css   # Custom CSS / Tailwind config
├── server/              # Backend Express Server
│   ├── prisma/          # Schema định nghĩa cơ sở dữ liệu (MySQL)
│   ├── scripts/         # Các script seed admin & import data
│   └── src/
│       ├── routes/      # Định nghĩa các routes API chính
│       └── index.js     # Điểm khởi chạy API Server
└── package.json         # Workspace Configuration
```

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### 📋 Yêu cầu hệ thống
*   **Node.js**: Phiên bản 18.x trở lên
*   **MySQL**: Phiên bản 8.x trở lên

### 1️⃣ Cài đặt Dependencies
Chạy lệnh sau tại thư mục gốc của dự án để cài đặt thư viện cho cả `client` và `server`:
```bash
npm install
```

### 2️⃣ Cấu hình biến môi trường (`.env`)

*   **Server**: Tạo file `/server/.env` dựa theo mẫu dưới đây:
    ```env
    DATABASE_URL="mysql://username:password@localhost:3306/dsv_shop"
    JWT_SECRET="your_very_long_random_jwt_secret"
    PORT=3000
    CLIENT_ORIGIN="http://localhost:5173"
    ```
*   **Client**: Tạo file `/client/.env` (hoặc kiểm tra file cấu hình môi trường):
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

### 3️⃣ Khởi tạo Cơ sở dữ liệu (Prisma & MySQL)
Tạo bảng dữ liệu và đồng bộ database:
```bash
# Tạo các client files từ schema
npm run db:generate

# Tạo bảng trong MySQL
npm run db:migrate

# Seed tài khoản admin mặc định
npm run seed:admin
```
*(Tài khoản quản trị mặc định: `admin@dacsanviet.site` / `Admin@12345`)*

### 4️⃣ Khởi chạy ứng dụng
Chạy cả Client và Server song song bằng lệnh:
```bash
npm run dev
```

*   **Giao diện Storefront**: [http://localhost:5173](http://localhost:5173)
*   **Trang Quản trị Admin**: [http://localhost:5173/admin](http://localhost:5173/admin)
*   **Đường dẫn API Backend**: [http://localhost:3000/api](http://localhost:3000/api)

---

## 🤝 Thành viên phát triển

*   **Tee** - Phát triển chính & Xây dựng hệ thống
*   **Đội ngũ phát triển Đặc Sản Việt** 🌾
