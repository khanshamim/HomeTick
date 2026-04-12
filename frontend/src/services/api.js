/**
 * Centralised API service.
 *
 * Auth model:
 *   After a user selects their profile, call setAuthUser(userId).
 *   This sets the X-User-ID header on all subsequent requests so the
 *   backend can identify the caller and enforce family-level isolation.
 */

import axios from 'axios';

// ─── Configuration ────────────────────────────────────────────────────────────
// Replace with your machine's LAN IP when testing on a physical device.
// e.g. 'http://192.168.1.42:8000'
export const API_BASE_URL = 'http://localhost:8005';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Set (or clear) the X-User-ID header.
 * Call with a userId string after login, and with null on logout.
 */
export const setAuthUser = (userId) => {
  if (userId) {
    api.defaults.headers.common['X-User-ID'] = String(userId);
  } else {
    delete api.defaults.headers.common['X-User-ID'];
  }
};

// Log errors globally during development
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.detail || error.message;
    console.error('[API Error]', msg);
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Identify a user by name within a family.
 * Returns { user_id, family_id, name, role }.
 */
export const selectUserByName = (name, familyId) =>
  api.post('/auth/select-user', { name, family_id: familyId }).then((r) => r.data);

// ─── Families ─────────────────────────────────────────────────────────────────

export const getFamilies = () => api.get('/families/').then((r) => r.data);

export const createFamily = (name) =>
  api.post('/families/', { name }).then((r) => r.data);

export const getFamily = (familyId) =>
  api.get(`/families/${familyId}`).then((r) => r.data);

/** Public endpoint — does not require X-User-ID header. */
export const getFamilyUsers = (familyId) =>
  api.get(`/families/${familyId}/users`).then((r) => r.data);

// ─── Users ────────────────────────────────────────────────────────────────────

/** Requires auth — returns users in the current user's family. */
export const getUsers = () => api.get('/users/').then((r) => r.data);

export const getUserById = (userId) =>
  api.get(`/users/${userId}`).then((r) => r.data);

/** Create a user in a specific family — called during setup (no auth required). */
export const createUser = (name, role = 'member', familyId) =>
  api.post('/users/', { name, role, family_id: familyId }).then((r) => r.data);

/** Update the FCM token for the currently authenticated user. */
export const updateFCMToken = (token) =>
  api.put('/users/fcm-token', { token }).then((r) => r.data);

// ─── Tasks ────────────────────────────────────────────────────────────────────

/** Today's tasks for the current user (authenticated). */
export const getMyTasks = () => api.get('/tasks/me').then((r) => r.data);

/** All tasks in the current family (admin use). */
export const getAllTasks = () => api.get('/tasks/').then((r) => r.data);

/** Today's tasks for a specific family member (admin view). */
export const getUserTasks = (userId) =>
  api.get(`/tasks/user/${userId}`).then((r) => r.data);

/** Admin only: create a task. created_by and family_id are set by the backend. */
export const createTask = ({ title, assigned_to, is_daily, due_time }) =>
  api
    .post('/tasks/', { title, assigned_to, is_daily, due_time: due_time || null })
    .then((r) => r.data);

// ─── Task Status ───────────────────────────────────────────────────────────────

/** Toggle completion for the current user (user_id taken from X-User-ID header). */
export const completeTask = (taskId, completed = true) =>
  api.post(`/tasks/${taskId}/complete`, { completed }).then((r) => r.data);

export const getMyStatus = () => api.get('/tasks/status/me').then((r) => r.data);

export const getUserStatus = (userId) =>
  api.get(`/tasks/status/${userId}`).then((r) => r.data);

// ─── Family Overview ──────────────────────────────────────────────────────────

export const getFamilyOverview = () =>
  api.get('/tasks/overview').then((r) => r.data);

// ─── Notifications ────────────────────────────────────────────────────────────

export const triggerNotification = (type) =>
  api.post('/notifications/trigger', { type }).then((r) => r.data);
