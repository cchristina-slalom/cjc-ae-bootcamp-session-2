const request = require('supertest');
const { app, db } = require('../../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Helper to create a todo
const createTodo = async (name = 'Integration Test Todo', due_date = null) => {
  const response = await request(app)
    .post('/api/todos')
    .send({ name, due_date })
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  return response.body;
};

describe('TODO API Integration Tests', () => {
  describe('Full CRUD lifecycle', () => {
    it('should create, read, update, and delete a todo', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/todos')
        .send({ name: 'Lifecycle Todo', due_date: '2025-12-01' })
        .set('Accept', 'application/json');
      expect(createRes.status).toBe(201);
      const todoId = createRes.body.id;
      expect(createRes.body.name).toBe('Lifecycle Todo');
      expect(createRes.body.due_date).toBe('2025-12-01');
      expect(createRes.body.completed).toBe(0);

      // Read single
      const getRes = await request(app).get(`/api/todos/${todoId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.id).toBe(todoId);

      // Update name and complete it
      const updateRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ name: 'Updated Lifecycle Todo', completed: true });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.name).toBe('Updated Lifecycle Todo');
      expect(updateRes.body.completed).toBe(1);

      // Read all - should appear in completed filter
      const listRes = await request(app).get('/api/todos?status=completed');
      expect(listRes.status).toBe(200);
      expect(listRes.body.some(t => t.id === todoId)).toBe(true);

      // Delete
      const deleteRes = await request(app).delete(`/api/todos/${todoId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toEqual({ message: 'Todo deleted successfully', id: todoId });

      // Confirm deletion
      const afterDeleteRes = await request(app).get(`/api/todos/${todoId}`);
      expect(afterDeleteRes.status).toBe(404);
    });
  });

  describe('GET /api/todos - filtering and sorting', () => {
    let activeTodoId;
    let completedTodoId;

    beforeEach(async () => {
      const active = await createTodo('Active Integration Todo');
      activeTodoId = active.id;

      const completed = await createTodo('Completed Integration Todo');
      completedTodoId = completed.id;
      await request(app).put(`/api/todos/${completedTodoId}`).send({ completed: true });
    });

    afterEach(async () => {
      await request(app).delete(`/api/todos/${activeTodoId}`);
      await request(app).delete(`/api/todos/${completedTodoId}`);
    });

    it('should return all todos when status=all', async () => {
      const response = await request(app).get('/api/todos?status=all');
      expect(response.status).toBe(200);
      const ids = response.body.map(t => t.id);
      expect(ids).toContain(activeTodoId);
      expect(ids).toContain(completedTodoId);
    });

    it('should only return active todos when status=active', async () => {
      const response = await request(app).get('/api/todos?status=active');
      expect(response.status).toBe(200);
      const ids = response.body.map(t => t.id);
      expect(ids).toContain(activeTodoId);
      expect(ids).not.toContain(completedTodoId);
      response.body.forEach(todo => expect(todo.completed).toBe(0));
    });

    it('should only return completed todos when status=completed', async () => {
      const response = await request(app).get('/api/todos?status=completed');
      expect(response.status).toBe(200);
      const ids = response.body.map(t => t.id);
      expect(ids).toContain(completedTodoId);
      expect(ids).not.toContain(activeTodoId);
      response.body.forEach(todo => expect(todo.completed).toBe(1));
    });

    it('should accept sort=created_at parameter', async () => {
      const response = await request(app).get('/api/todos?sort=created_at&order=asc');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should accept sort=due_date parameter', async () => {
      const response = await request(app).get('/api/todos?sort=due_date&order=asc');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/todos - validation', () => {
    it('should trim whitespace from todo name', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ name: '  Trimmed Name  ' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Trimmed Name');

      await request(app).delete(`/api/todos/${response.body.id}`);
    });

    it('should reject whitespace-only name', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ name: '   ' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/todos/:id - partial updates', () => {
    let todoId;

    beforeEach(async () => {
      const todo = await createTodo('Partial Update Todo', '2025-10-01');
      todoId = todo.id;
    });

    afterEach(async () => {
      await request(app).delete(`/api/todos/${todoId}`);
    });

    it('should only update name, leaving other fields unchanged', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ name: 'Only Name Updated' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Only Name Updated');
      expect(response.body.due_date).toBe('2025-10-01');
      expect(response.body.completed).toBe(0);
    });

    it('should toggle completed status', async () => {
      const completeRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ completed: true });
      expect(completeRes.body.completed).toBe(1);

      const uncompleteRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ completed: false });
      expect(uncompleteRes.body.completed).toBe(0);
    });

    it('should clear due_date when set to null', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ due_date: null });

      expect(response.status).toBe(200);
      expect(response.body.due_date).toBeNull();
    });
  });
});
