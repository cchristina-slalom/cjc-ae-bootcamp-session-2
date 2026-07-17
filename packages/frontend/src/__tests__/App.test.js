import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const mockTodos = [
  { id: 1, name: 'Buy groceries', due_date: null, completed: 0, created_at: '2024-01-01T00:00:00.000Z' },
  { id: 2, name: 'Read a book', due_date: '2099-12-31', completed: 0, created_at: '2024-01-02T00:00:00.000Z' },
  { id: 3, name: 'Go for a walk', due_date: null, completed: 1, created_at: '2024-01-03T00:00:00.000Z' },
];

// Mock server to intercept API requests
const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    const status = req.url.searchParams.get('status') || 'all';
    let filtered = mockTodos;
    if (status === 'active') filtered = mockTodos.filter(t => !t.completed);
    if (status === 'completed') filtered = mockTodos.filter(t => t.completed);
    return res(ctx.status(200), ctx.json(filtered));
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Todo name is required' }));
    }
    return res(
      ctx.status(201),
      ctx.json({ id: 99, name, due_date: null, completed: 0, created_at: new Date().toISOString() })
    );
  }),

  rest.put('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    const todo = mockTodos.find(t => t.id === parseInt(id));
    if (!todo) return res(ctx.status(404), ctx.json({ error: 'Todo not found' }));
    const { name, due_date, completed } = req.body;
    return res(
      ctx.status(200),
      ctx.json({
        ...todo,
        name: name !== undefined ? name : todo.name,
        due_date: due_date !== undefined ? due_date : todo.due_date,
        completed: completed !== undefined ? (completed ? 1 : 0) : todo.completed,
      })
    );
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.status(200), ctx.json({ message: 'Todo deleted successfully', id: parseInt(id) }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the app title', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('To Do App')).toBeInTheDocument();
    });
  });

  test('renders the add task form', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Enter task name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  test('loads and displays todos', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      expect(screen.getByText('Read a book')).toBeInTheDocument();
    });
  });

  test('displays loading indicator initially', () => {
    render(<App />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('adds a new todo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    const input = screen.getByPlaceholderText('Enter task name');
    await user.type(input, 'New Test Task');

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Todo added successfully')).toBeInTheDocument();
    });
  });

  test('marks a todo as completed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Buy groceries')).toBeInTheDocument());

    // Find the list item containing 'Buy groceries' and click its checkbox
    const taskItems = screen.getAllByRole('listitem');
    const groceriesItem = taskItems.find(item => within(item).queryByText('Buy groceries'));
    const checkbox = within(groceriesItem).getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/marked as completed/i);
    });
  });

  test('deletes a todo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Buy groceries')).toBeInTheDocument());

    const deleteButton = screen.getByLabelText(/delete "buy groceries"/i);
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Todo deleted');
    });
  });

  test('shows empty state when no todos', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No tasks found. Add some!')).toBeInTheDocument();
    });
  });

  test('shows error message when API fails', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch todos/i)).toBeInTheDocument();
    });
  });

  test('shows overdue indicator for past due todos', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([
          { id: 5, name: 'Overdue Task', due_date: '2020-01-01', completed: 0, created_at: '2024-01-01T00:00:00.000Z' },
        ]));
      })
    );

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Overdue Task')).toBeInTheDocument();
    });
    // The due date text should include "(Overdue)"
    expect(screen.getByText(/\(Overdue\)/)).toBeInTheDocument();
  });

  test('starts editing a todo and cancels', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => expect(screen.getByText('Buy groceries')).toBeInTheDocument());

    const editButton = screen.getByLabelText(/edit "buy groceries"/i);
    await user.click(editButton);

    // Should show edit UI - save/cancel buttons
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel edit/i })).toBeInTheDocument();
    });

    // Cancel edit
    await user.click(screen.getByRole('button', { name: /cancel edit/i }));
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /save edit/i })).not.toBeInTheDocument();
    });
  });
});
