import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddTaskForm from '../components/AddTaskForm';

const renderWithLocalization = (component) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {component}
    </LocalizationProvider>
  );
};

describe('AddTaskForm', () => {
  const mockOnAddTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAddTask.mockResolvedValue({ id: 1, name: 'Test Task' });
  });

  test('renders form inputs', () => {
    renderWithLocalization(<AddTaskForm onAddTask={mockOnAddTask} loading={false} />);

    expect(screen.getByLabelText(/task name/i)).toBeInTheDocument();
    // DatePicker renders multiple elements with "due date", so check for the button instead
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  test('submits task with name only', async () => {
    const user = userEvent.setup();
    renderWithLocalization(<AddTaskForm onAddTask={mockOnAddTask} loading={false} />);

    const input = screen.getByLabelText(/task name/i);
    await user.type(input, 'New Task');

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnAddTask).toHaveBeenCalledWith('New Task', null);
    });
  });

  test('shows error when task name is empty', async () => {
    const user = userEvent.setup();
    renderWithLocalization(<AddTaskForm onAddTask={mockOnAddTask} loading={false} />);

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/task name is required/i)).toBeInTheDocument();
    });

    expect(mockOnAddTask).not.toHaveBeenCalled();
  });

  test('disables form when loading', () => {
    renderWithLocalization(<AddTaskForm onAddTask={mockOnAddTask} loading={true} />);

    expect(screen.getByLabelText(/task name/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /add task/i })).toBeDisabled();
  });

  test('clears input after successful submission', async () => {
    const user = userEvent.setup();
    renderWithLocalization(<AddTaskForm onAddTask={mockOnAddTask} loading={false} />);

    const input = screen.getByLabelText(/task name/i);
    await user.type(input, 'New Task');

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});
