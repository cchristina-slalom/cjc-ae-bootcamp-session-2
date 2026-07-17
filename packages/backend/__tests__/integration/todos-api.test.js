const request = require('supertest');
const { app, db } = require('../app');

describe('TODO API Integration Tests', () => {
  beforeEach(() => {
    // Clear the database before each test
    db.prepare('DELETE FROM items').run();
    
    // Insert test data
    const insertStmt = db.prepare('INSERT INTO items (name, due_date, completed) VALUES (?, ?, ?)');
    insertStmt.run('Task 1', null, 0);
    insertStmt.run('Task 2', '2026-12-25', 1);
    insertStmt.run('Task 3', '2026-01-10', 0);
  });

  describe('GET /api/items', () => {
    test('returns all items', async () => {
      const response = await request(app).get('/api/items');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
    });

    test('filters incomplete tasks', async () => {
      const response = await request(app).get('/api/items?status=incomplete');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.every(task => task.completed === 0)).toBe(true);
    });

    test('filters complete tasks', async () => {
      const response = await request(app).get('/api/items?status=complete');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].completed).toBe(1);
    });

    test('sorts by due date ascending', async () => {
      const response = await request(app).get('/api/items?sort=due_date_asc');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
    });

    test('sorts by due date descending', async () => {
      const response = await request(app).get('/api/items?sort=due_date_desc');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
    });
  });

  describe('POST /api/items', () => {
    test('creates a new item', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'New Task' });
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Task');
      expect(response.body.id).toBeDefined();
    });

    test('creates item with due date', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'New Task', due_date: '2026-12-31' });
      
      expect(response.status).toBe(201);
      expect(response.body.due_date).toBe('2026-12-31');
    });

    test('returns 400 for empty name', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('returns 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({});
      
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/items/:id', () => {
    test('updates task name', async () => {
      const response = await request(app)
        .put('/api/items/1')
        .send({ name: 'Updated Task' });
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Task');
    });

    test('updates task completion status', async () => {
      const response = await request(app)
        .put('/api/items/1')
        .send({ completed: 1 });
      
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(1);
    });

    test('updates task due date', async () => {
      const response = await request(app)
        .put('/api/items/1')
        .send({ due_date: '2026-12-25' });
      
      expect(response.status).toBe(200);
      expect(response.body.due_date).toBe('2026-12-25');
    });

    test('updates multiple fields', async () => {
      const response = await request(app)
        .put('/api/items/1')
        .send({ name: 'Updated', completed: 1, due_date: '2026-12-31' });
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated');
      expect(response.body.completed).toBe(1);
      expect(response.body.due_date).toBe('2026-12-31');
    });

    test('returns 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/items/999')
        .send({ name: 'Updated' });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    test('returns 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/api/items/invalid')
        .send({ name: 'Updated' });
      
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/items/:id', () => {
    test('deletes an item', async () => {
      const response = await request(app).delete('/api/items/1');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);

      // Verify deletion
      const getResponse = await request(app).get('/api/items');
      expect(getResponse.body.length).toBe(2);
    });

    test('returns 404 for non-existent item', async () => {
      const response = await request(app).delete('/api/items/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    test('returns 400 for invalid ID', async () => {
      const response = await request(app).delete('/api/items/invalid');
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /', () => {
    test('health check returns ok', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});
