# Hướng dẫn thiết lập EmailJS cho trang Contact

## Giới thiệu

EmailJS cho phép bạn gửi email trực tiếp từ client-side JavaScript mà không cần backend. Trang liên hệ đã được cấu hình để sử dụng EmailJS, nhưng bạn cần thiết lập tài khoản và cấu hình dịch vụ trước khi sử dụng.

## Các bước thiết lập

### 1. Đăng ký tài khoản EmailJS

1. Truy cập [EmailJS.com](https://www.emailjs.com/) và đăng ký tài khoản miễn phí
2. Xác minh email của bạn để kích hoạt tài khoản

### 2. Tạo Email Service

1. Đăng nhập vào EmailJS Dashboard
2. Chọn "Email Services" từ menu chính
3. Nhấp vào "Add New Service"
4. Chọn Gmail làm nhà cung cấp dịch vụ email
5. Đăng nhập vào tài khoản Gmail của bạn và cấp quyền cho EmailJS
6. Đặt tên cho dịch vụ (ví dụ: "cinema_contact_service")
7. Lưu lại **Service ID** để sử dụng sau này

### 3. Tạo Email Template

1. Từ EmailJS Dashboard, chọn "Email Templates"
2. Nhấp vào "Create New Template"
3. Đặt tên cho template (ví dụ: "contact_form")
4. Thiết kế template với nội dung như sau:

```
Subject: New Contact Form Submission: {{subject}}

You received a new message from {{name}} ({{email}}):

Message:
{{message}}
```

5. Lưu template và ghi lại **Template ID**

### 4. Lấy Public Key

1. Từ EmailJS Dashboard, chọn "Account"
2. Tìm mục "API Keys"
3. Sao chép **Public Key**

### 5. Cập nhật mã nguồn

Mở file `fe/src/pages/Contact/ContactPage.jsx` và cập nhật các biến sau với thông tin của bạn:

```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Service ID từ bước 2
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Template ID từ bước 3
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Public Key từ bước 4
```

## Kiểm tra

1. Khởi động lại ứng dụng
2. Điền vào form liên hệ
3. Gửi tin nhắn để kiểm tra xem email có được gửi thành công không

## Giới hạn miễn phí

Gói miễn phí của EmailJS cho phép bạn gửi tối đa 200 email mỗi tháng. Nếu bạn cần gửi nhiều hơn, bạn có thể nâng cấp lên gói trả phí.

## Tùy chỉnh thêm

Bạn có thể tùy chỉnh template email, thêm các trường khác, hoặc thay đổi giao diện trang liên hệ theo nhu cầu của bạn.