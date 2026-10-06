import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Boards
export const listBoards = (status) =>
  api.get('/boards', { params: status ? { status } : {} }).then((r) => r.data);

export const createBoard = (data) =>
  api.post('/boards', data).then((r) => r.data);

export const getBoard = (id) =>
  api.get(`/boards/${id}`).then((r) => r.data);

export const updateBoard = (id, data) =>
  api.put(`/boards/${id}`, data).then((r) => r.data);

export const deleteBoard = (id) =>
  api.delete(`/boards/${id}`);

export const getBoardDashboard = (id) =>
  api.get(`/boards/${id}/dashboard`).then((r) => r.data);

// Columns
export const createColumn = (boardId, data) =>
  api.post(`/boards/${boardId}/columns`, data).then((r) => r.data);

export const updateColumn = (id, data) =>
  api.put(`/columns/${id}`, data).then((r) => r.data);

export const deleteColumn = (id) =>
  api.delete(`/columns/${id}`);

export const reorderColumns = (columnIds) =>
  api.put('/columns/reorder', { column_ids: columnIds }).then((r) => r.data);

// Cards
export const createCard = (columnId, data) =>
  api.post(`/columns/${columnId}/cards`, data).then((r) => r.data);

export const getCard = (id) =>
  api.get(`/cards/${id}`).then((r) => r.data);

export const updateCard = (id, data) =>
  api.put(`/cards/${id}`, data).then((r) => r.data);

export const moveCard = (id, data) =>
  api.put(`/cards/${id}/move`, data).then((r) => r.data);

export const deleteCard = (id) =>
  api.delete(`/cards/${id}`);

// Dashboard
export const getGeneralDashboard = () =>
  api.get('/dashboard').then((r) => r.data);

export const getGlobalBoard = () =>
  api.get('/dashboard/global-board').then((r) => r.data);

export default api;
