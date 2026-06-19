import { Facebook, Instagram, Mail, MapPin, Phone, Send, Youtube } from 'lucide-react';

export default function ContactPage() {
  return (
    <section className="wp-contact-page">
      <div className="container wp-page-title">Liên hệ</div>

      <div className="container wp-contact-map">
        <iframe
          title="Trường Đại học Công nghệ Kỹ Thuật, Thủ Đức"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d16878.059304473314!2d106.75285868771793!3d10.850632400000022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752763f23816ab%3A0x282f711441b6916f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgS-G7uSB0aHXhuq10IFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaA!5e1!3m2!1svi!2sus!4v1781843796383!5m2!1svi!2sus"
          loading="lazy"
        />
      </div>

      <section className="container wp-contact-content">
        <div className="wp-contact-info">
          <h2>LIÊN HỆ VỚI CHÚNG TÔI</h2>
          <p><strong>Công ty TNHH Đặc Sản Việt</strong></p>
          <ul>
            <li><MapPin /> <span><strong>Trụ sở chính:</strong> Trường Đại học Công nghệ Kỹ thuật Thành phố Hồ Chí Minh</span></li>
            <li><MapPin /> <span><strong>Địa chỉ:</strong> 01, Đường Võ Văn Ngân, Phường Thủ Đức, TP Hồ Chí Minh</span></li>
            <li><Phone /> <span><strong>Hotline:</strong> (028) 3722 1223</span></li>
            <li><Mail /> <span><strong>Email:</strong> dacsanviethotro@gmail.com</span></li>
          </ul>
          <div className="wp-contact-socials">
            <a href="https://www.facebook.com/hcmute.edu.vn" target="_blank" rel="noreferrer"><Facebook /> Facebook</a>
            <a href="https://www.youtube.com/@tee.2105" target="_blank" rel="noreferrer"><Youtube /> Youtube</a>
            <a href="https://www.instagram.com/_im.nkqt.tee/" aria-label="Instagram"><Instagram /> Instagram</a>
          </div>
        </div>

        <form className="wp-contact-form">
          <h3>Liên hệ tư vấn mua hàng</h3>
          <input placeholder="Họ và tên của bạn..." />
          <input placeholder="Số điện thoại..." />
          <textarea placeholder="Nội dung cần tư vấn..." />
          <button className="btn btn-primary" type="button"><Send size={16} /> Gửi yêu cầu</button>
        </form>
      </section>
    </section>
  );
}
