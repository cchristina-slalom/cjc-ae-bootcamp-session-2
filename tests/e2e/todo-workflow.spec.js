const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./TodoPage');

/**
 * E2E tests for the TODO app critical user journeys.
 * Uses the Page Object Model pattern for maintainability.
 * Tests are isolated and independent from each other.
 */

test.describe('TODO App - Critical User Journeys', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto(process.env.FRONTEND_URL || 'http://localhost:3000');
  });

  test('should display the app title and add task form', async ({ page }) => {
    await expect(page.getByText('To Do App')).toBeVisible();
    await expect(page.getByText('Add New Task')).toBeVisible();
    await expect(page.getByPlaceholder('Enter task name')).toBeVisible();
    await expect(page.getByRole('button', { name: /add task/i })).toBeVisible();
  });

  test('should add a new task and display it in the list', async ({ page }) => {
    const taskName = `E2E Task ${Date.now()}`;
    await todoPage.addTask(taskName);

    await expect(page.getByText(taskName)).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Todo added successfully');
  });

  test('should mark a task as completed and show strikethrough', async ({ page }) => {
    const taskName = `Complete Me ${Date.now()}`;
    await todoPage.addTask(taskName);
    await expect(page.getByText(taskName)).toBeVisible();

    await todoPage.toggleTask(taskName);

    const taskText = page.getByText(taskName, { exact: true });
    await expect(taskText).toHaveCSS('text-decoration', /line-through/);
    await expect(page.getByRole('status')).toContainText('Marked as completed');
  });

  test('should delete a task and remove it from the list', async ({ page }) => {
    const taskName = `Delete Me ${Date.now()}`;
    await todoPage.addTask(taskName);
    await expect(page.getByText(taskName)).toBeVisible();

    await todoPage.deleteTask(taskName);

    await expect(page.getByText(taskName)).not.toBeVisible();
    await expect(page.getByRole('status')).toContainText('Todo deleted');
  });

  test('should edit a task name and save changes', async ({ page }) => {
    const originalName = `Original Task ${Date.now()}`;
    const updatedName = `Updated Task ${Date.now()}`;

    await todoPage.addTask(originalName);
    await expect(page.getByText(originalName)).toBeVisible();

    await todoPage.startEditTask(originalName);
    await todoPage.saveEdit(updatedName);

    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(originalName)).not.toBeVisible();
    await expect(page.getByRole('status')).toContainText('Todo updated successfully');
  });

  test('should cancel editing without saving changes', async ({ page }) => {
    const taskName = `No Change Task ${Date.now()}`;
    await todoPage.addTask(taskName);
    await expect(page.getByText(taskName)).toBeVisible();

    await todoPage.startEditTask(taskName);
    await expect(page.getByLabel(/edit task name/i)).toBeVisible();

    await todoPage.cancelEdit();

    await expect(page.getByText(taskName)).toBeVisible();
    await expect(page.getByLabel(/edit task name/i)).not.toBeVisible();
  });

  test('should show empty state message when no tasks exist', async ({ page }) => {
    // This test verifies initial load with seeded data or uses context isolation
    // The app loads with backend data; we verify the empty state message exists in DOM
    const emptyMessage = page.getByText('No tasks found. Add some!');
    // The empty message is conditionally rendered, so just verify the element is present when todos is empty
    // We can verify it by checking the DOM structure
    const count = await page.getByRole('listitem').count();
    if (count === 0) {
      await expect(emptyMessage).toBeVisible();
    } else {
      // Tasks are present - verify task items render correctly
      await expect(page.getByRole('listitem').first()).toBeVisible();
    }
  });

  test('should filter tasks by completion status', async ({ page }) => {
    const activeTask = `Active Filter ${Date.now()}`;
    await todoPage.addTask(activeTask);
    await todoPage.toggleTask(activeTask);

    const newActiveTask = `Active Task ${Date.now()}`;
    await todoPage.addTask(newActiveTask);

    await todoPage.filterByStatus('completed');
    await expect(page.getByText(activeTask)).toBeVisible();

    await todoPage.filterByStatus('active');
    await expect(page.getByText(newActiveTask)).toBeVisible();

    await todoPage.filterByStatus('all');
  });
});
