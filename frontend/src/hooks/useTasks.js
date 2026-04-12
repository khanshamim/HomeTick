/**
 * useTasks — fetches and toggles tasks for a user.
 *
 * When userId matches the current logged-in user, uses GET /tasks/me.
 * When viewing another member's tasks (admin), uses GET /tasks/user/{id}.
 *
 * Both routes require the X-User-ID header (set by setAuthUser in AppContext).
 */

import { useState, useCallback } from 'react';
import { getMyTasks, getUserTasks, completeTask } from '../services/api';

export function useTasks(userId, { isCurrentUser = true } = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = isCurrentUser ? await getMyTasks() : await getUserTasks(userId);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [userId, isCurrentUser]);

  const toggleTask = useCallback(
    async (taskId, currentCompleted) => {
      const newCompleted = !currentCompleted;

      // Optimistic update so the UI responds instantly
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: newCompleted } : t))
      );

      try {
        await completeTask(taskId, newCompleted);
      } catch (err) {
        // Revert on failure
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, completed: currentCompleted } : t))
        );
        setError('Could not update task. Please try again.');
      }
    },
    [userId]
  );

  return { tasks, loading, error, refresh, toggleTask };
}
