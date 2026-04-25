import api from './axios';

/**
 * Fetch all tasks (admin gets all, user gets assigned)
 */
export const fetchTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

/**
 * Fetch tasks assigned to current user
 */
export const fetchMyTasks = async () => {
  const response = await api.get('/tasks/my');
  return response.data;
};

/**
 * Create a new task (admin only)
 */
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

/**
 * Update task status
 */
export const updateStatus = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
};

/**
 * Update full task (admin only)
 */
export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

/**
 * Delete a task (admin only)
 */
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

/**
 * Fetch all users (admin only — for assignment picker)
 */
export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};
