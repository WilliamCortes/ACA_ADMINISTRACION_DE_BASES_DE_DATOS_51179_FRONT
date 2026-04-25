import { getUsers, createUser, updateUser, deleteUser } from './api.js';

let allUsers = [];
let deleteId = null;

const tbody  = document.getElementById('users-body');
const search = document.getElementById('search-input');
const modalUser   = new bootstrap.Modal(document.getElementById('modalUser'));
const modalDelete = new bootstrap.Modal(document.getElementById('modalDelete'));

// ── Render ─────────────────────────────────────────────
function renderTable(users) {
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No hay usuarios.</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td class="text-muted">${u.user_id}</td>
      <td class="fw-semibold">${u.user_name}</td>
      <td>${u.user_document}</td>
      <td>${u.user_email}</td>
      <td>${u.user_phone_number || '–'}</td>
      <td>${u.user_address || '–'}</td>
      <td>
        <div class="d-flex gap-1 justify-content-end">
          <button class="btn btn-sm btn-outline-primary" onclick="openEdit(${u.user_id})" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="openDelete(${u.user_id}, '${escHtml(u.user_name)}')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

window.filterUsers = function () {
  const q = search.value.toLowerCase();
  const filtered = q
    ? allUsers.filter(u =>
        u.user_name.toLowerCase().includes(q) ||
        u.user_document.toLowerCase().includes(q))
    : allUsers;
  renderTable(filtered);
};

// ── Modal helpers ───────────────────────────────────────
window.openCreate = function () {
  document.getElementById('modal-user-title').textContent = 'Nuevo usuario';
  ['user-id','u-name','u-doc','u-email','u-phone','u-address'].forEach(id =>
    document.getElementById(id).value = '');
};

window.openEdit = function (id) {
  const u = allUsers.find(x => x.user_id === id);
  if (!u) return;
  document.getElementById('modal-user-title').textContent = 'Editar usuario';
  document.getElementById('user-id').value   = u.user_id;
  document.getElementById('u-name').value    = u.user_name;
  document.getElementById('u-doc').value     = u.user_document;
  document.getElementById('u-email').value   = u.user_email;
  document.getElementById('u-phone').value   = u.user_phone_number || '';
  document.getElementById('u-address').value = u.user_address || '';
  modalUser.show();
};

window.openDelete = function (id, name) {
  deleteId = id;
  document.getElementById('del-user-name').textContent = name;
  modalDelete.show();
};

window.saveUser = async function () {
  const id    = document.getElementById('user-id').value;
  const name  = document.getElementById('u-name').value.trim();
  const doc   = document.getElementById('u-doc').value.trim();
  const email = document.getElementById('u-email').value.trim();
  if (!name || !doc || !email) { showAlert('Nombre, documento y email son obligatorios.', 'warning'); return; }

  const payload = {
    user_name:         name,
    user_document:     doc,
    user_email:        email,
    user_phone_number: document.getElementById('u-phone').value.trim()   || '',
    user_address:      document.getElementById('u-address').value.trim() || '',
  };

  try {
    if (id) {
      await updateUser(id, payload);
      showAlert('Usuario actualizado.', 'success');
    } else {
      await createUser(payload);
      showAlert('Usuario creado.', 'success');
    }
    modalUser.hide();
    await reload();
  } catch (e) {
    showAlert('Error: ' + parseError(e), 'danger');
  }
};

window.confirmDelete = async function () {
  if (!deleteId) return;
  try {
    await deleteUser(deleteId);
    showAlert('Usuario eliminado.', 'success');
    modalDelete.hide();
    await reload();
  } catch (e) {
    showAlert('Error: ' + parseError(e), 'danger');
  }
};

// ── Utils ───────────────────────────────────────────────
function showAlert(msg, type = 'info') {
  const box = document.getElementById('alert-box');
  const id  = 'a' + Date.now();
  box.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="alert alert-${type} alert-dismissible shadow-sm fade show mb-2" role="alert">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`);
  setTimeout(() => document.getElementById(id)?.remove(), 4000);
}

function parseError(e) {
  try { const o = JSON.parse(e.message); return Object.values(o).flat().join(' '); }
  catch { return e.message; }
}

function escHtml(s) { return s.replace(/'/g, "\\'"); }

async function reload() {
  try {
    allUsers = await getUsers();
    window.filterUsers();
  } catch {
    showAlert('Error al conectar con el servidor.', 'danger');
  }
}

reload();
