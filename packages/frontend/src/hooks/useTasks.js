import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing TODO tasks.
 * Handles fetching, creating, updating, deleting tasks and filtering/sorting.
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'complete', 'incomplete'
  const [sort, setSort] = useState('created_at'); // 'created_at', 'due_date_asc', 'due_date_desc'

  // Fetch tasks from the backend
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (sort !== 'created_at') {
        params.append('sort', sort);
      }

      const response = await fetch(`/api/items?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, sort]);

  // Fetch tasks on component mount and when filter/sort changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Add a new task
  const addTask = useCallback(async (name, dueDate = null) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, due_date: dueDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add task');
      }

      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setError(null);
      return newTask;
    } catch (err) {
      setError(err.message);
      console.error('Error adding task:', err);
      throw err;
    }
  }, [tasks]);

  // Update a task (name, completed status, or due date)
  const updateTask = useCallback(async (id, updates) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));
      setError(null);
      return updatedTask;
    } catch (err) {
      setError(err.message);
      console.error('Error updating task:', err);
      throw err;
    }
  }, [tasks]);

  // Delete a task
  const deleteTask = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [tasks]);

  // Toggle task completion status
  const toggleComplete = useCallback(async (id, currentCompleted) => {
    return updateTask(id, { completed: !currentCompleted });
  }, [updateTask]);

  return {
    tasks,
    loading,
    error,
    filter,
    setFilter,
    sort,
    setSort,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    refreshTasks: fetchTasks,
  };
};
