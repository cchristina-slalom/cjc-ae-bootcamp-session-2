import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../useTasks';

describe('useTasks', () => {
  const mockTasks = [
    { id: 1, name: 'Task 1', completed: 0, due_date: null, created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: 2, name: 'Task 2', completed: 1, due_date: '2026-12-25', created_at: '2026-01-02', updated_at: '2026-01-02' },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and returns tasks on mount', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.error).toBeNull();
  });

  test('handles fetch error gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  test('adds a new task', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockTasks })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, name: 'New Task', completed: 0, due_date: null, created_at: '2026-01-03', updated_at: '2026-01-03' }),
      });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.addTask('New Task', null);
    });

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(mockTasks.length + 1);
    });
  });

  test('toggles task completion', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockTasks })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockTasks[0], completed: 1 }),
      });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggleComplete(1, false);
    });

    await waitFor(() => {
      expect(result.current.tasks[0].completed).toBe(1);
    });
  });

  test('deletes a task', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockTasks })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Deleted' }) });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.deleteTask(1);
    });

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(mockTasks.length - 1);
    });
  });

  test('filters tasks by status', async () => {
    const completeTasks = [mockTasks[1]];

    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => completeTasks });

    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setFilter('complete');
    });

    await waitFor(() => {
      expect(result.current.filter).toBe('complete');
    });
  });

  test('sorts tasks', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockTasks });

    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.setSort('due_date_asc');
    });

    await waitFor(() => {
      expect(result.current.sort).toBe('due_date_asc');
    });
  });
});
