// Admin Customers Management
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;

document.addEventListener('DOMContentLoaded', () => loadCustomers());

async function loadCustomers() {
    try {
        const params = new URLSearchParams({
            page: currentPage - 1,
            size: pageSize
        });
        
        const response = await fetch(`/api/admin/users?${params}`);
        const data = await response.json();
        
        displayCustomers(data.content);
        updatePagination(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); 
                                display: flex; align-items: center; justify-content: center; font-weight: 700;">
                        ${customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div style="font-weight: 600;">${customer.fullName || 'N/A'}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">ID: ${customer.id}</div>
                    </div>
                </div>
            </td>
            <td>
                <div><i class="bi bi-envelope"></i> ${customer.email}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                    <i class="bi bi-telephone"></i> ${customer.phoneNumber || 'N/A'}
                </div>
            </td>
            <td>${customer.totalOrders || 0} orders</td>
            <td><strong>${formatCurrency(customer.totalSpent || 0)}</strong></td>
            <td><span class="status-badge status-active">Active</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewCustomer(${customer.id})" title="Xem">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editCustomer(${customer.id})" title="Sửa">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-btn" onclick="deleteCustomer(${customer.id})" title="Xóa">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination(data) {
    totalPages = data.totalPages;
    document.getElementById('showingStart').textContent = (currentPage - 1) * pageSize + 1;
    document.getElementById('showingEnd').textContent = Math.min(currentPage * pageSize, data.totalElements);
    document.getElementById('totalCustomers').textContent = data.totalElements;
    
    const buttons = document.getElementById('paginationButtons');
    let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-left"></i></button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
             <i class="bi bi-chevron-right"></i></button>`;
    buttons.innerHTML = html;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadCustomers();
}

let searchTimeout;
function searchCustomers() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        loadCustomers();
    }, 500);
}

function filterCustomers() {
    currentPage = 1;
    loadCustomers();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function viewCustomer(id) {
    // Show customer detail modal
    showCustomerDetailModal(id);
}

async function showCustomerDetailModal(id) {
    try {
        const response = await fetch(`/api/admin/users/${id}`);
        const customer = await response.json();
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="customerDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chi Tiết Khách Hàng</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Tên đăng nhập</label>
                                    <p>${customer.username}</p>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Họ tên</label>
                                    <p>${customer.fullName || 'N/A'}</p>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Email</label>
                                    <p>${customer.email}</p>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Số điện thoại</label>
                                    <p>${customer.phoneNumber || 'N/A'}</p>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Tổng đơn hàng</label>
                                    <p>${customer.totalOrders || 0} đơn</p>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Tổng chi tiêu</label>
                                    <p>${formatCurrency(customer.totalSpent || 0)}</p>
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label fw-bold">Ngày đăng ký</label>
                                    <p>${new Date(customer.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-primary" onclick="editCustomer(${id})">Chỉnh Sửa</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('customerDetailModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('customerDetailModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi khi tải thông tin khách hàng');
    }
}

async function editCustomer(id) {
    try {
        const response = await fetch(`/api/admin/users/${id}`);
        const customer = await response.json();
        
        // Create edit modal HTML
        const modalHTML = `
            <div class="modal fade" id="editCustomerModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Chỉnh Sửa Khách Hàng</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="editCustomerForm">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Họ tên *</label>
                                    <input type="text" class="form-control" id="editFullName" value="${customer.fullName || ''}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email *</label>
                                    <input type="email" class="form-control" id="editEmail" value="${customer.email}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Số điện thoại</label>
                                    <input type="tel" class="form-control" id="editPhone" value="${customer.phoneNumber || ''}">
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                                <button type="submit" class="btn btn-primary">Lưu Thay Đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modals
        document.querySelectorAll('.modal').forEach(m => m.remove());
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editCustomerModal'));
        modal.show();
        
        // Handle form submit
        document.getElementById('editCustomerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveCustomer(id);
        });
        
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi khi tải thông tin khách hàng');
    }
}

async function saveCustomer(id) {
    try {
        const data = {
            fullName: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            phoneNumber: document.getElementById('editPhone').value
        };
        
        const response = await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Cập nhật khách hàng thành công!');
            bootstrap.Modal.getInstance(document.getElementById('editCustomerModal')).hide();
            loadCustomers();
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.error || 'Không thể cập nhật'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi khi cập nhật khách hàng');
    }
}

async function deleteCustomer(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;
    
    try {
        const response = await fetch(`/api/admin/users/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Xóa khách hàng thành công!');
            loadCustomers();
        } else if (response.status === 403) {
            alert('⚠️ Bạn không có quyền xóa khách hàng!\nChỉ Quản trị viên mới có thể xóa khách hàng.');
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.error || 'Không thể xóa'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi khi xóa khách hàng');
    }
}

function addCustomer() {
    // Show add customer modal
    const modalHTML = `
        <div class="modal fade" id="addCustomerModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Thêm Khách Hàng Mới</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="addCustomerForm">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Tên đăng nhập *</label>
                                <input type="text" class="form-control" id="addUsername" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Mật khẩu *</label>
                                <input type="password" class="form-control" id="addPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Họ tên *</label>
                                <input type="text" class="form-control" id="addFullName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email *</label>
                                <input type="email" class="form-control" id="addEmail" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Số điện thoại</label>
                                <input type="tel" class="form-control" id="addPhone">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Vai trò *</label>
                                <select class="form-control" id="addRole" required>
                                    <option value="USER">Khách hàng</option>
                                    <option value="STAFF">Nhân viên</option>
                                    <option value="ADMIN">Quản trị viên</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                            <button type="submit" class="btn btn-primary">Thêm Khách Hàng</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('addCustomerModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    modal.show();
    
    // Handle form submit
    document.getElementById('addCustomerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createCustomer();
    });
}

async function createCustomer() {
    try {
        const data = {
            username: document.getElementById('addUsername').value,
            password: document.getElementById('addPassword').value,
            fullName: document.getElementById('addFullName').value,
            email: document.getElementById('addEmail').value,
            phoneNumber: document.getElementById('addPhone').value,
            role: document.getElementById('addRole').value
        };
        
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Thêm khách hàng thành công!');
            bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
            loadCustomers();
        } else {
            const error = await response.json();
            alert('Lỗi: ' + (error.error || 'Không thể thêm khách hàng'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi khi thêm khách hàng');
    }
}

function exportCustomers() {
    window.location.href = '/admin/api/customers/export';
}
