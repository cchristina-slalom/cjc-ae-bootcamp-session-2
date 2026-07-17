import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import dayjs from 'dayjs';

const theme = createTheme({
  palette: {
    primary: { main: '#1976D2', dark: '#115293' },
    secondary: { main: '#9C27B0' },
    background: { default: '#F5F5F5', paper: '#FFFFFF' },
    error: { main: '#D32F2F' },
    success: { main: '#2E7D32' },
    text: { primary: '#212121', secondary: '#757575' },
  },
});

/**
 * Returns true if the given date string is in the past (overdue).
 * @param {string|null} dueDate - ISO date string or null
 * @param {boolean} completed - whether the todo is completed
 */
const isOverdue = (dueDate, completed) => {
  if (!dueDate || completed) return false;
  return dayjs(dueDate).isBefore(dayjs(), 'day');
};

/**
 * Main TODO App component.
 */
function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDueDate, setNewDueDate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDueDate, setEditDueDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchTodos();
  }, [statusFilter, sortField, sortOrder]);

  const showFeedback = (message, severity = 'success') => {
    setFeedback({ message, severity });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: statusFilter, sort: sortField, order: sortOrder });
      const response = await fetch(`/api/todos?${params}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setTodos(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          due_date: newDueDate ? dayjs(newDueDate).format('YYYY-MM-DD') : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to add todo');
      setNewName('');
      setNewDueDate(null);
      showFeedback('Todo added successfully');
      await fetchTodos();
    } catch (err) {
      showFeedback('Error adding todo: ' + err.message, 'error');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      showFeedback(todo.completed ? 'Marked as active' : 'Marked as completed');
      await fetchTodos();
    } catch (err) {
      showFeedback('Error updating todo: ' + err.message, 'error');
    }
  };

  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditName(todo.name);
    setEditDueDate(todo.due_date ? dayjs(todo.due_date) : null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDueDate(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          due_date: editDueDate ? dayjs(editDueDate).format('YYYY-MM-DD') : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      setEditingId(null);
      showFeedback('Todo updated successfully');
      await fetchTodos();
    } catch (err) {
      showFeedback('Error updating todo: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete todo');
      showFeedback('Todo deleted');
      await fetchTodos();
    } catch (err) {
      showFeedback('Error deleting todo: ' + err.message, 'error');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
              To Do App
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Keep track of your tasks
            </Typography>

            {feedback && (
              <Alert severity={feedback.severity} sx={{ mb: 2 }} role="status">
                {feedback.message}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Add Todo Form */}
            <Card elevation={1} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Add New Task</Typography>
                <Box component="form" onSubmit={handleAddTodo}>
                  <Stack spacing={2}>
                    <TextField
                      label="Task name"
                      variant="outlined"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter task name"
                      required
                      fullWidth
                      inputProps={{ 'aria-label': 'Task name' }}
                    />
                    <DatePicker
                      label="Due date (optional)"
                      value={newDueDate}
                      onChange={setNewDueDate}
                      slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      aria-label="Add task"
                    >
                      Add Task
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Filter & Sort Controls */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  inputProps={{ 'aria-label': 'Filter by status' }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortField}
                  label="Sort by"
                  onChange={(e) => setSortField(e.target.value)}
                  inputProps={{ 'aria-label': 'Sort by field' }}
                >
                  <MenuItem value="created_at">Created Date</MenuItem>
                  <MenuItem value="due_date">Due Date</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={(e) => setSortOrder(e.target.value)}
                  inputProps={{ 'aria-label': 'Sort order' }}
                >
                  <MenuItem value="desc">Newest</MenuItem>
                  <MenuItem value="asc">Oldest</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Todo List */}
            <main>
              <Typography variant="h6" gutterBottom>Tasks</Typography>
              {loading && (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress aria-label="Loading tasks" />
                </Box>
              )}

              {!loading && todos.length === 0 && (
                <Typography color="text.secondary" align="center">
                  No tasks found. Add some!
                </Typography>
              )}

              <Stack spacing={1} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {todos.map((todo) => {
                  const overdue = isOverdue(todo.due_date, todo.completed);
                  const isEditing = editingId === todo.id;

                  return (
                    <li key={todo.id}>
                      <Card elevation={1} sx={{ opacity: todo.completed ? 0.75 : 1 }}>
                        <CardContent sx={{ py: '12px !important' }}>
                          {isEditing ? (
                            <Stack spacing={1}>
                              <TextField
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                variant="outlined"
                                size="small"
                                fullWidth
                                inputProps={{ 'aria-label': 'Edit task name' }}
                              />
                              <DatePicker
                                label="Due date"
                                value={editDueDate}
                                onChange={setEditDueDate}
                                slotProps={{ textField: { variant: 'outlined', size: 'small', fullWidth: true } }}
                              />
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  startIcon={<SaveIcon />}
                                  onClick={() => handleSaveEdit(todo.id)}
                                  aria-label="Save edit"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<CancelIcon />}
                                  onClick={handleCancelEdit}
                                  aria-label="Cancel edit"
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </Stack>
                          ) : (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Checkbox
                                checked={Boolean(todo.completed)}
                                onChange={() => handleToggleComplete(todo)}
                                color="primary"
                                inputProps={{ 'aria-label': `Mark "${todo.name}" as ${todo.completed ? 'active' : 'completed'}` }}
                              />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                    color: todo.completed ? 'text.secondary' : 'text.primary',
                                  }}
                                >
                                  {todo.name}
                                </Typography>
                                {todo.due_date && (
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    {overdue && (
                                      <WarningAmberIcon
                                        sx={{ fontSize: 14, color: '#FF5722' }}
                                        aria-label="Overdue"
                                      />
                                    )}
                                    <Typography
                                      variant="caption"
                                      sx={{ color: overdue ? '#FF5722' : 'text.secondary' }}
                                    >
                                      Due: {dayjs(todo.due_date).format('MMM D, YYYY')}
                                      {overdue && ' (Overdue)'}
                                    </Typography>
                                  </Stack>
                                )}
                              </Box>
                              <Tooltip title="Edit task">
                                <IconButton
                                  size="small"
                                  onClick={() => handleStartEdit(todo)}
                                  aria-label={`Edit "${todo.name}"`}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete task">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(todo.id)}
                                  aria-label={`Delete "${todo.name}"`}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </Stack>
            </main>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;