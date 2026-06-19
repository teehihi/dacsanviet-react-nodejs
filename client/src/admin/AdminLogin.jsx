import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@dacsanviet.site');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('dsv_admin_token', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="admin-login">
      <form onSubmit={submit}>
        <img src="/assets/dacsanvietLogowTnB.png" alt="Đặc Sản Việt" />
        <h1>Đăng nhập quản trị</h1>
        {error && <p className="form-error">{error}</p>}
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn btn-primary">Đăng nhập</button>
      </form>
    </section>
  );
}
