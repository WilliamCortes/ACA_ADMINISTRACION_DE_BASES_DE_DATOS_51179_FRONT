import { getBorrows, getUsers, getBooks, createBorrow, returnBook } from './api.js';

let allBorrows = [];
let currentFilter = '';

const tbody = document.getElementById('borrows-body');
const modalBorrow = new bootstrap.Modal(document.getElementById('modalBorrow'));

// ── Render ─────────────────────────────────────────────
const STATUS_LABEL = { BORROWED: 'Prestado', RETURNED: 'Devuelto', LATE: 'Tardío' };
const STATUS_COLOR = { BORROWED: 'primary', RETURNED: 'success', LATE: 'warning' };

function renderTable(borrows) {
  if (!borrows.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">Sin resultados.</td></tr>';
    return;
  }
  tbody.innerHTML = borrows.map(b => `
    <tr>
      <td class="text-muted">${b.borrow_id}</td>
      <td>${b.user_name ?? b.user}</td>
      <td>${b.book_title ?? b.book}</td>
      <td>${b.borrow_date}</td>
      <td>${b.due_date}</td>
      <td>${b.return_date ?? '–'}</td>
      <td>
        <span class="badge bg-${STATUS_COLOR[b.status]}-subtle text-${STATUS_COLOR[b.status]} border border-${STATUS_COLOR[b.status]}-subtle">
          ${STATUS_LABEL[b.status]}
        </span>
      </td>
      <td>
        ${b.status !== 'RETURNED'
          ? `<button class="btn btn-sm btn-outline-success" onclick="doReturn(${b.borrow_id})" title="Devolver">
               <i class="bi bi-check2-circle"></i> Devolver
             </button>`
          : ''}
      </td>
    </tr>`).join('');
}

function applyFilter() {
  const filtered = currentFilter
    ? allBorrows.filter(b => b.status === currentFilter)
    : allBorrows;
  renderTable(filtered);
}

// ── Filter tabs ────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active', 'btn-primary', 'btn-warning', 'btn-success');
      b.classList.add(b.dataset.status === '' ? 'btn-outline-primary'
                    : b.dataset.status === 'BORROWED' ? 'btn-outline-primary'
                    : b.dataset.status === 'LATE'     ? 'btn-outline-warning'
                    : 'btn-outline-success');
    });
    btn.classList.add('active');
    currentFilter = btn.dataset.status;
    applyFilter();
  });
});

// ── Create borrow ──────────────────────────────────────
async function loadSelects() {
  const [users, books] = await Promise.all([getUsers(), getBooks()]);

  const uSel = document.getElementById('b-user');
  uSel.innerHTML = '<option value="">— Selecciona un usuario —</option>'
    + users.map(u => `<option value="${u.user_id}">${u.user_name} (${u.user_document})</option>`).join('');

  const bSel = document.getElementById('b-book');
  bSel.innerHTML = '<option value="">— Selecciona un libro —</option>'
    + books.filter(b => b.stock > 0)
           .map(b => `<option value="${b.book_id}">${b.title} — stock: ${b.stock}</option>`).join('');

  // Default due date = today + 14 days
  const due = new Date();
  due.setDate(due.getDate() + 14);
  document.getElementById('b-due').value = due.toISOString().slice(0, 10);
}

document.getElementById('modalBorrow').addEventListener('show.bs.modal', loadSelects);

window.saveBorrow = async function () {
  const user_id = document.getElementById('b-user').value;
  const book_id = document.getElementById('b-book').value;
  const due_date= document.getElementById('b-due').value;
  if (!user_id || !book_id || !due_date) {
    showAlert('Completa todos los campos.', 'warning'); return;
  }
  try {
    await createBorrow({ user: parseInt(user_id), book: parseInt(book_id), due_date });
    showAlert('Préstamo creado correctamente.', 'success');
    modalBorrow.hide();
    await reload();
  } catch (e) {
    showAlert('Error: ' + parseError(e), 'danger');
  }
};

window.doReturn = async function (id) {
  try {
    await returnBook(id);
    showAlert('Libro devuelto. Stock actualizado.', 'success');
    await reload();
  } catch (e) {
    showAlert('Error: ' + parseError(e), 'danger');
  }
};

// ── Utils ───────────────────────────────────────────────
function showAlert(msg, type = 'info') {
  const box = document.getElementById('alert-box');
  const aid  = 'a' + Date.now();
  box.insertAdjacentHTML('beforeend', `
    <div id="${aid}" class="alert alert-${type} alert-dismissible shadow-sm fade show mb-2" role="alert">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`);
  setTimeout(() => document.getElementById(aid)?.remove(), 4500);
}

function parseError(e) {
  try { const o = JSON.parse(e.message); return Object.values(o).flat().join(' '); }
  catch { return e.message; }
}

async function reload() {
  try {
    allBorrows = await getBorrows();
    applyFilter();
  } catch {
    showAlert('Error al conectar con el servidor.', 'danger');
  }
}

reload();
