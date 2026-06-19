import { Heart, Shield, Truck } from 'lucide-react';

function moveBackgroundFocus(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  event.currentTarget.style.setProperty('--focus-x', `${x.toFixed(1)}%`);
  event.currentTarget.style.setProperty('--focus-y', `${y.toFixed(1)}%`);
}

function resetBackgroundFocus(event) {
  event.currentTarget.style.setProperty('--focus-x', '50%');
  event.currentTarget.style.setProperty('--focus-y', '50%');
}

export default function AboutPage() {
  return (
    <section className="wp-about-page">
      <div className="wp-breadcrumb container">Trang chủ / Giới thiệu</div>

      <section
        className="wp-about-cover focus-bg"
        onMouseMove={moveBackgroundFocus}
        onMouseLeave={resetBackgroundFocus}
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.38), rgba(0,0,0,.38)), url('/assets/uploads/2025/09/mtay.jpg')" }}
      >
        <h1>VỀ ĐẶC SẢN VIỆT</h1>
        <p>Kết nối hương vị quê hương đến mọi miền</p>
      </section>

      <section className="container wp-brand-story">
        <img src="/assets/uploads/2025/09/5.10.14.jpg" alt="Câu chuyện thương hiệu Đặc Sản Việt" />
        <div>
          <h2>CÂU CHUYỆN THƯƠNG HIỆU</h2>
          <p>
            <strong>“Đặc Sản Việt”</strong> ra đời với mong muốn đưa những sản phẩm mang đậm hồn quê Việt Nam
            đến gần hơn với mọi người. Từ hương vị mắm cá miền Tây, cà phê Tây Nguyên, đến trái cây sấy thơm ngon
            từ miền Đông hay những đặc sản núi rừng Tây Bắc, tất cả đều được chúng tôi chọn lọc kỹ lưỡng để giữ trọn hương vị quê hương.
          </p>
          <p>
            Không chỉ dừng lại ở việc kinh doanh, Đặc Sản Việt còn là cầu nối giữa người nông dân và khách hàng,
            lan tỏa những giá trị văn hoá truyền thống qua từng sản phẩm.
          </p>
        </div>
      </section>

      <section className="container wp-about-icons">
        <article>
          <Shield />
          <h3>Chất lượng đảm bảo</h3>
          <p>Sản phẩm có nguồn gốc rõ ràng, nhiều mặt hàng đạt chứng nhận OCOP.</p>
        </article>
        <article>
          <Truck />
          <h3>Tiện lợi & nhanh chóng</h3>
          <p>Giao hàng toàn quốc, hỗ trợ nhiều hình thức thanh toán.</p>
        </article>
        <article>
          <Heart />
          <h3>Lan tỏa văn hoá Việt</h3>
          <p>Mỗi sản phẩm là một câu chuyện quê hương.</p>
        </article>
      </section>

      <section
        className="wp-mission focus-bg"
        onMouseMove={moveBackgroundFocus}
        onMouseLeave={resetBackgroundFocus}
        style={{ backgroundImage: "linear-gradient(rgba(10,38,25,.64), rgba(10,38,25,.64)), url('/assets/uploads/2025/09/mt-1.webp')" }}
      >
        <div className="container">
          <h2>SỨ MỆNH VÀ TẦM NHÌN</h2>
          <p>
            Sứ mệnh của “Đặc Sản Việt” không chỉ dừng ở việc kinh doanh trực tuyến, mà còn là cầu nối giúp quảng bá
            nông sản Việt Nam, góp phần gìn giữ và lan tỏa giá trị văn hoá ẩm thực truyền thống.
          </p>
        </div>
      </section>

      <section className="container wp-about-bottom">
        <div className="wp-about-article">
          <h2><span /> ĐẶC SẢN VIỆT TRONG MÔN THƯƠNG MẠI ĐIỆN TỬ <span /></h2>
          <p>
            Website <strong>Đặc Sản Việt</strong> được xây dựng bởi nhóm sinh viên Trường Đại học Công nghệ Kỹ thuật TP. Hồ Chí Minh
            trong khuôn khổ môn học <strong>Thương mại điện tử</strong>. Đây là một sản phẩm học tập mang tính thực hành,
            với mục tiêu vận dụng kiến thức lý thuyết đã được học vào việc triển khai một dự án thực tế.
          </p>
          <p>
            Thông qua website này, nhóm mong muốn tái hiện một mô hình thương mại điện tử B2C hiện đại, thân thiện với người dùng
            và có tính ứng dụng cao. Nội dung website tập trung vào việc giới thiệu, quảng bá và kinh doanh trực tuyến
            các sản phẩm đặc sản vùng miền Việt Nam.
          </p>
          <p>
            Website Đặc Sản Việt đồng thời phản ánh tầm nhìn của nhóm: kết nối hương vị quê hương đến với mọi miền,
            gìn giữ và lan tỏa giá trị văn hoá Việt Nam thông qua nền tảng số.
          </p>
        </div>
        <aside className="wp-about-sidebar">
          <div className="video-card">
            <iframe
              title="YouTube video player"
              src="https://www.youtube.com/embed/POkxhP5bOnE?si=zn_p4XSXx19NLSGs"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="facebook-card">
            <iframe
              title="Facebook Nguyễn Nhật Thiên"
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fnhatthien.nguyen.566%2F%3Fref%3Dembed_page%23&tabs=timeline&width=420&height=620&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </aside>
      </section>
    </section>
  );
}
