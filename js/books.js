import { getBooks, getUsers, getBorrows, createBook, updateBook, deleteBook } from './api.js';

let allBooks = [];
let deleteId = null;

const grid    = document.getElementById('books-grid');
const search  = document.getElementById('search-input');
const modalBook   = new bootstrap.Modal(document.getElementById('modalBook'));
const modalDetail = new bootstrap.Modal(document.getElementById('modalDetail'));

// ── Stats ──────────────────────────────────────────────
async function loadStats() {
  try {
    const [books, users, borrows] = await Promise.all([getBooks(), getUsers(), getBorrows()]);
    document.getElementById('stat-books').textContent   = books.length;
    document.getElementById('stat-users').textContent   = users.length;
    const active = borrows.filter(b => b.status === 'BORROWED').length;
    document.getElementById('stat-borrows').textContent = active;
    return books;
  } catch (e) {
    showAlert('Error al conectar con el servidor. ¿Está corriendo el backend?', 'danger');
    return [];
  }
}

// ── Render ─────────────────────────────────────────────
function renderGrid(books) {
  if (!books.length) {
    grid.innerHTML = '<div class="col-12 text-center py-5 text-muted">No hay libros.</div>';
    return;
  }
  grid.innerHTML = books.map(b => `
    <div class="col-6 col-md-3 col-lg-2">
      <div class="card book-card">
        <img src="${b.cover_url || 'https://placehold.co/200x200?text=Sin+portada'}"
             alt="${b.title}"
             onerror="this.src='https://placehold.co/200x200?text=Sin+portada'" />
        <div class="card-body">
          <div class="card-title">${b.title}</div>
          <div class="card-text">${b.author}</div>
          <div class="d-flex align-items-center justify-content-between mt-2">
            <span class="badge bg-${b.stock > 0 ? 'success' : 'danger'} bg-opacity-10 text-${b.stock > 0 ? 'success' : 'danger'}">
              Stock: ${b.stock}
            </span>
            <div class="d-flex gap-1">
              <button class="btn btn-sm btn-outline-primary p-0 px-1" onclick="openEdit(${b.book_id})" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger p-0 px-1" onclick="openDelete(${b.book_id}, '${escHtml(b.title)}')" title="Eliminar">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>`).join('');
}

function filterBooks() {
  const q = search.value.toLowerCase();
  const filtered = q
    ? allBooks.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    : allBooks;
  renderGrid(filtered);
}

// ── Modal helpers ───────────────────────────────────────
window.openCreate = function () {
  document.getElementById('modal-book-title').textContent = 'Nuevo libro';
  document.getElementById('book-id').value  = '';
  document.getElementById('b-title').value  = '';
  document.getElementById('b-author').value = '';
  document.getElementById('b-year').value   = '';
  document.getElementById('b-stock').value  = '1';
  document.getElementById('b-desc').value   = '';
  document.getElementById('b-cover').value  = '';
};

window.openEdit = function (id) {
  const b = allBooks.find(x => x.book_id === id);
  if (!b) return;
  document.getElementById('modal-book-title').textContent = 'Editar libro';
  document.getElementById('book-id').value  = b.book_id;
  document.getElementById('b-title').value  = b.title;
  document.getElementById('b-author').value = b.author;
  document.getElementById('b-year').value   = b.published_year || '';
  document.getElementById('b-stock').value  = b.stock;
  document.getElementById('b-desc').value   = b.description || '';
  document.getElementById('b-cover').value  = b.cover_url || '';
  modalBook.show();
};

window.openDelete = function (id, name) {
  deleteId = id;
  document.getElementById('del-book-name').textContent = name;
  modalDetail.show();
};

window.saveBook = async function () {
  const id    = document.getElementById('book-id').value;
  const title = document.getElementById('b-title').value.trim();
  const author= document.getElementById('b-author').value.trim();
  if (!title || !author) { showAlert('Título y autor son obligatorios.', 'warning'); return; }

  const payload = {
    title,
    author,
    published_year: document.getElementById('b-year').value  || null,
    stock:          parseInt(document.getElementById('b-stock').value) || 0,
    description:    document.getElementById('b-desc').value.trim()  || null,
    cover_url:      document.getElementById('b-cover').value.trim() || null,
  };

  try {
    if (id) {
      await updateBook(id, payload);
      showAlert('Libro actualizado.', 'success');
    } else {
      await createBook(payload);
      showAlert('Libro creado.', 'success');
    }
    modalBook.hide();
    await reload();
  } catch (e) {
    showAlert('Error: ' + parseError(e), 'danger');
  }
};

window.confirmDelete = async function () {
  if (!deleteId) return;
  try {
    await deleteBook(deleteId);
    showAlert('Libro eliminado.', 'success');
    modalDetail.hide();
    await reload();
  } catch (e) {
    showAlert('Error al eliminar: ' + parseError(e), 'danger');
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
  allBooks = await loadStats();
  filterBooks();
}

// ── Init ────────────────────────────────────────────────
reload();
