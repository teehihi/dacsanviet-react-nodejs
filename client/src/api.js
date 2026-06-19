const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('dsv_admin_token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Không thể tải dữ liệu');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const money = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0));
