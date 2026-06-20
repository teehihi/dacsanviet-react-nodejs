import { Save } from 'lucide-react';

export default function AdminSettings() {
  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div><h1>Cài Đặt</h1><p>Thông tin vận hành cơ bản cho trang Đặc Sản Việt</p></div>
        <button className="admin-primary"><Save size={18} />Lưu Cài Đặt</button>
      </header>
      <div className="admin-dashboard-grid">
        <section className="admin-card">
          <div className="admin-card-head"><h2>Thông Tin Cửa Hàng</h2></div>
          <div className="admin-form-grid one">
            <label>Tên cửa hàng<input defaultValue="Đặc Sản Việt" /></label>
            <label>Email<input defaultValue="hcth@hcmute.edu.vn" /></label>
            <label>Số điện thoại<input defaultValue="(028) 3896 8641" /></label>
            <label>Địa chỉ<textarea defaultValue="01 Võ Văn Ngân, Phường Thủ Đức, TP Hồ Chí Minh" /></label>
          </div>
        </section>
        <section className="admin-card">
          <div className="admin-card-head"><h2>Thiết Lập Giao Diện</h2></div>
          <div className="admin-form-grid one">
            <label>Màu nhấn<input type="color" defaultValue="#ff6334" /></label>
            <label>Logo URL<input defaultValue="/assets/dacsanvietLogowTnB.png" /></label>
            <label className="admin-check"><input type="checkbox" defaultChecked />Hiển thị banner trang chủ</label>
            <label className="admin-check"><input type="checkbox" defaultChecked />Hiển thị tin tức ngoài trang chủ</label>
          </div>
        </section>
      </div>
    </section>
  );
}
