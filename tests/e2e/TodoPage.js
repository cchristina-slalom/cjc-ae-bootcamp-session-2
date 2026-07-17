const { Page } = require('@playwright/test');

/**
 * Page Object Model for the TODO App.
 * Encapsulates selectors and actions for E2E tests.
 */
class TodoPage {
  /**
   * @param {Page} page - Playwright Page instance
   */
  constructor(page) {
    this.page = page;
    this.taskNameInput = page.getByPlaceholder('Enter task name');
    this.addTaskButton = page.getByRole('button', { name: /add task/i });
    this.statusFilter = page.getByLabel(/status/i).first();
  }

  /**
   * Navigate to the app.
   * @param {string} baseURL
   */
  async goto(baseURL) {
    await this.page.goto(baseURL);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Add a new task.
   * @param {string} name - Task name
   */
  async addTask(name) {
    await this.taskNameInput.fill(name);
    await this.addTaskButton.click();
    await this.page.waitForResponse(res => res.url().includes('/api/todos') && res.request().method() === 'POST');
  }

  /**
   * Delete a task by name.
   * @param {string} name - Task name
   */
  async deleteTask(name) {
    const deleteBtn = this.page.getByRole('button', { name: new RegExp(`delete "${name}"`, 'i') });
    await deleteBtn.click();
    await this.page.waitForResponse(res => res.url().includes('/api/todos') && res.request().method() === 'DELETE');
  }

  /**
   * Toggle completion status of a task by name.
   * @param {string} name - Task name
   */
  async toggleTask(name) {
    const checkbox = this.page.getByRole('checkbox', { name: new RegExp(`mark "${name}"`, 'i') });
    await checkbox.click();
    await this.page.waitForResponse(res => res.url().includes('/api/todos') && res.request().method() === 'PUT');
  }

  /**
   * Start editing a task.
   * @param {string} name - Task name
   */
  async startEditTask(name) {
    const editBtn = this.page.getByRole('button', { name: new RegExp(`edit "${name}"`, 'i') });
    await editBtn.click();
  }

  /**
   * Save the currently edited task with a new name.
   * @param {string} newName - New task name
   */
  async saveEdit(newName) {
    const editInput = this.page.getByLabel(/edit task name/i);
    await editInput.fill(newName);
    const saveBtn = this.page.getByRole('button', { name: /save edit/i });
    await saveBtn.click();
    await this.page.waitForResponse(res => res.url().includes('/api/todos') && res.request().method() === 'PUT');
  }

  /**
   * Cancel editing a task.
   */
  async cancelEdit() {
    const cancelBtn = this.page.getByRole('button', { name: /cancel edit/i });
    await cancelBtn.click();
  }

  /**
   * Filter tasks by status.
   * @param {'all'|'active'|'completed'} status
   */
  async filterByStatus(status) {
    await this.statusFilter.click();
    const option = this.page.getByRole('option', { name: new RegExp(status, 'i') });
    await option.click();
    await this.page.waitForResponse(res => res.url().includes('/api/todos') && res.request().method() === 'GET');
  }

  /**
   * Returns whether a task with the given name is visible.
   * @param {string} name
   * @returns {Promise<boolean>}
   */
  async isTaskVisible(name) {
    return this.page.getByText(name, { exact: true }).isVisible();
  }

  /**
   * Returns whether a feedback message is visible.
   * @param {RegExp|string} pattern
   * @returns {Promise<boolean>}
   */
  async isFeedbackVisible(pattern) {
    return this.page.getByRole('status').filter({ hasText: pattern }).isVisible();
  }
}

module.exports = { TodoPage };
