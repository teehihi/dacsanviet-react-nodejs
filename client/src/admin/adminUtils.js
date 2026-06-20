export const orderStatusLabels = {
  PENDING: 'Chờ Xác Nhận',
  CONFIRMED: 'Đã Xác Nhận',
  PROCESSING: 'Đang Xử Lý',
  SHIPPING: 'Đang Giao',
  COMPLETED: 'Đã Giao',
  CANCELLED: 'Đã Hủy',
};

export const paymentStatusLabels = {
  UNPAID: 'Chờ Thanh Toán',
  PENDING: 'Chờ Thanh Toán',
  PAID: 'Đã Thanh Toán',
  FAILED: 'Thất Bại',
};

export const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'N/A';

export const plainDate = (value) =>
  value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value)) : 'N/A';

export function statusTone(status) {
  if (['ACTIVE', 'COMPLETED', 'PAID', true].includes(status)) return 'success';
  if (['PENDING', 'CONFIRMED', 'PROCESSING', 'UNPAID'].includes(status)) return 'warning';
  if (['SHIPPING'].includes(status)) return 'info';
  if (['CANCELLED', 'FAILED', 'ARCHIVED', false].includes(status)) return 'danger';
  return 'muted';
}

export function makeCsv(rows, filename) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
