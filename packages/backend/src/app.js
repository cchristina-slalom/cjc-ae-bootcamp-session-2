const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create todos table
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialTodos = [
  { name: 'Buy groceries', due_date: null },
  { name: 'Read a book', due_date: null },
  { name: 'Go for a walk', due_date: null },
];
const insertStmt = db.prepare('INSERT INTO todos (name, due_date) VALUES (?, ?)');

initialTodos.forEach(todo => {
  insertStmt.run(todo.name, todo.due_date);
});

console.log('In-memory database initialized with sample data');

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes

/**
 * GET /api/todos
 * Returns all todos, optionally filtered by status and sorted by field.
 * Query params:
 *   - status: 'all' | 'active' | 'completed'
 *   - sort: 'created_at' | 'due_date'
 *   - order: 'asc' | 'desc'
 */
app.get('/api/todos', (req, res) => {
  try {
    const { status = 'all', sort = 'created_at', order = 'desc' } = req.query;

    const validSorts = ['created_at', 'due_date'];
    const validOrders = ['asc', 'desc'];
    const safeSort = validSorts.includes(sort) ? sort : 'created_at';
    const safeOrder = validOrders.includes(order) ? order : 'desc';

    let query = 'SELECT * FROM todos';
    const params = [];

    if (status === 'active') {
      query += ' WHERE completed = 0';
    } else if (status === 'completed') {
      query += ' WHERE completed = 1';
    }

    query += ` ORDER BY ${safeSort} ${safeOrder.toUpperCase()}`;

    const todos = db.prepare(query).all(...params);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

/**
 * GET /api/todos/:id
 * Returns a single todo by ID.
 */
app.get('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

/**
 * POST /api/todos
 * Creates a new todo.
 * Body: { name: string, due_date?: string }
 */
app.post('/api/todos', (req, res) => {
  try {
    const { name, due_date = null } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Todo name is required' });
    }

    const result = insertStmt.run(name.trim(), due_date || null);
    const id = result.lastInsertRowid;

    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

/**
 * PUT /api/todos/:id
 * Updates an existing todo's name, due_date, and/or completed status.
 * Body: { name?: string, due_date?: string | null, completed?: boolean }
 */
app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { name, due_date, completed } = req.body;

    const updatedName = name !== undefined ? name.trim() : existingTodo.name;
    const updatedDueDate = due_date !== undefined ? (due_date || null) : existingTodo.due_date;
    const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : existingTodo.completed;

    if (name !== undefined && (!updatedName || updatedName === '')) {
      return res.status(400).json({ error: 'Todo name cannot be empty' });
    }

    db.prepare(
      'UPDATE todos SET name = ?, due_date = ?, completed = ? WHERE id = ?'
    ).run(updatedName, updatedDueDate, updatedCompleted, id);

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

/**
 * DELETE /api/todos/:id
 * Deletes a todo by ID.
 */
app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);

    if (result.changes > 0) {
      res.json({ message: 'Todo deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db, insertStmt };