import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TaskItem from '../components/TaskItem';

const renderWithLocalization = (component) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {component}
    </LocalizationProvider>
  );
};

describe('TaskItem', () => {
  const mockTask = {
    id: 1,
    name: 'Test Task',
    completed: 0,
    due_date: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  };

  const mockCallbacks = {
    onToggleComplete: jest.fn(),
    onUpdateTask: jest.fn(),
    onDeleteTask: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCallbacks.onUpdateTask.mockResolvedValue({ ...mockTask });
  });

  test('renders task name', () => {
    renderWithLocalization(
      <TaskItem task={mockTask} {...mockCallbacks} loading={false} />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('displays due date when set', () => {
    const taskWithDueDate = { ...mockTask, due_date: '2026-12-25' };

    renderWithLocalization(
      <TaskItem task={taskWithDueDate} {...mockCallbacks} loading={false} />
    );

    expect(screen.getByText(/due:/i)).toBeInTheDocument();
  });

  test('toggles completion when checkbox clicked', async () => {
    const user = userEvent.setup();
    renderWithLocalization(
      <TaskItem task={mockTask} {...mockCallbacks} loading={false} />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockCallbacks.onToggleComplete).toHaveBeenCalledWith(1, 0);
    });
  });

  test('applies strikethrough to completed tasks', () => {
    const completedTask = { ...mockTask, completed: 1 };

    renderWithLocalization(
      <TaskItem task={completedTask} {...mockCallbacks} loading={false} />
    );

    const taskName = screen.getByText('Test Task');
    expect(taskName).toHaveStyle({ textDecoration: 'line-through' });
  });

  test('shows overdue indicator for past due dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const overdueTask = {
      ...mockTask,
      due_date: pastDate.toISOString().split('T')[0],
      completed: 0,
    };

    renderWithLocalization(
      <TaskItem task={overdueTask} {...mockCallbacks} loading={false} />
    );

    expect(screen.getByLabelText(/overdue/i)).toBeInTheDocument();
  });

  test('enters edit mode when edit button clicked', async () => {
    const user = userEvent.setup();
    renderWithLocalization(
      <TaskItem task={mockTask} {...mockCallbacks} loading={false} />
    );

    const editButton = screen.getByLabelText(/edit task/i);
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
  });

  test('deletes task when delete button clicked', async () => {
    const user = userEvent.setup();
    renderWithLocalization(
      <TaskItem task={mockTask} {...mockCallbacks} loading={false} />
    );

    const deleteButton = screen.getByLabelText(/delete task/i);
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockCallbacks.onDeleteTask).toHaveBeenCalledWith(1);
    });
  });

  test('disables buttons when loading', () => {
    renderWithLocalization(
      <TaskItem task={mockTask} {...mockCallbacks} loading={true} />
    );

    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByLabelText(/edit task/i)).toBeDisabled();
    expect(screen.getByLabelText(/delete task/i)).toBeDisabled();
  });
});
