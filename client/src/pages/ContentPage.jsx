import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function ContentPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    api(`/pages/${slug}`).then(setPage).catch(() => setPage({ title: 'Đặc Sản Việt', body: 'Nội dung đang được cập nhật.' }));
  }, [slug]);

  return (
    <section className="container page content-page">
      <h1>{page?.title || 'Đang tải...'}</h1>
      {page?.imageUrl && <img src={page.imageUrl} alt={page.title} />}
      <div dangerouslySetInnerHTML={{ __html: page?.body || '' }} />
    </section>
  );
}
