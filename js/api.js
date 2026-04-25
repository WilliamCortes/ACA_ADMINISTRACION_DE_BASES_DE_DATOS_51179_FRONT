import { API_BASE as BASE_URL } from './config.js';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(JSON.stringify(err));
  }
  if (res.status === 204) return null;
  return res.json();
}

// --- Users ---
export const getUsers    = ()        => request('/users/');
export const getUser     = (id)      => request(`/users/${id}/`);
export const createUser  = (data)    => request('/users/', { method: 'POST', body: JSON.stringify(data) });
export const updateUser  = (id, data)=> request(`/users/${id}/`, { method: 'PUT',  body: JSON.stringify(data) });
export const deleteUser  = (id)      => request(`/users/${id}/`, { method: 'DELETE' });

// --- Books ---
export const getBooks    = ()        => request('/books/');
export const getBook     = (id)      => request(`/books/${id}/`);
export const createBook  = (data)    => request('/books/', { method: 'POST', body: JSON.stringify(data) });
export const updateBook  = (id, data)=> request(`/books/${id}/`, { method: 'PUT',  body: JSON.stringify(data) });
export const deleteBook  = (id)      => request(`/books/${id}/`, { method: 'DELETE' });

// --- Borrows ---
export const getBorrows     = ()          => request('/borrows/');
export const getBorrow      = (id)        => request(`/borrows/${id}/`);
export const createBorrow   = (data)      => request('/borrows/create_borrow/', { method: 'POST', body: JSON.stringify(data) });
export const returnBook     = (id)        => request(`/borrows/${id}/return_book/`, { method: 'PATCH' });
