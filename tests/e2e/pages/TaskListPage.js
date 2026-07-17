/**
 * TaskListPage - Page Object Model for the TODO app task list
 */
export class TaskListPage {
  constructor(page) {
    this.page = page;
    this.taskNameInput = page.locator('input[placeholder="Enter task name"]');
    this.addButton = page.locator('button:has-text("Add Task")');
    this.taskItems = page.locator('div[class*="MuiCard"]');
    this.filterButtons = page.locator('button').filter({ hasText: /All|Incomplete|Complete/ });
    this.sortButtons = page.locator('button').filter({ hasText: /Newest|Due Date/ });
    this.deleteButtons = page.locator('button[aria-label="Delete task"]');
    this.editButtons = page.locator('button[aria-label="Edit task"]');
    this.checkboxes = page.locator('input[type="checkbox"]');
    this.errorAlert = page.locator('[role="alert"]').first();
  }

  async goto() {
    await this.page.goto('http://localhost:3000');
    await this.page.waitForTimeout(1000); // Wait for app to load
  }

  async addTask(name, dueDate = null) {
    await this.taskNameInput.fill(name);

    if (dueDate) {
      // Click on due date picker
      await this.page.locator('input[placeholder*="Due Date"]').click();
      await this.page.locator(`button:has-text("${dueDate}")`).first().click();
    }

    await this.addButton.click();
    await this.page.waitForTimeout(500); // Wait for task to be added
  }

  async editTask(taskIndex, newName, newDueDate = null) {
    const taskItem = this.taskItems.nth(taskIndex);
    const editButton = taskItem.locator('button[aria-label="Edit task"]');
    await editButton.click();

    const taskNameInput = taskItem.locator('input[label="Task Name"]');
    await taskNameInput.fill(newName);

    if (newDueDate) {
      const dueDateInput = taskItem.locator('input[label="Due Date"]');
      await dueDateInput.click();
      await this.page.locator(`button:has-text("${newDueDate}")`).first().click();
    }

    const saveButton = taskItem.locator('button:has-text("Save")');
    await saveButton.click();
    await this.page.waitForTimeout(500);
  }

  async deleteTask(taskIndex) {
    const taskItem = this.taskItems.nth(taskIndex);
    const deleteButton = taskItem.locator('button[aria-label="Delete task"]');
    await deleteButton.click();
    await this.page.waitForTimeout(500);
  }

  async toggleTaskCompletion(taskIndex) {
    const taskItem = this.taskItems.nth(taskIndex);
    const checkbox = taskItem.locator('input[type="checkbox"]');
    await checkbox.click();
    await this.page.waitForTimeout(500);
  }

  async filterBy(status) {
    // status: 'all', 'incomplete', or 'complete'
    const buttonText = status.charAt(0).toUpperCase() + status.slice(1);
    await this.page.locator(`button:has-text("${buttonText}")`).first().click();
    await this.page.waitForTimeout(500);
  }

  async sortBy(order) {
    // order: 'newest', 'due_asc', or 'due_desc'
    const orderText = order === 'newest' ? 'Newest' : order === 'due_asc' ? 'Due Date ↑' : 'Due Date ↓';
    await this.page.locator(`button:has-text("${orderText}")`).click();
    await this.page.waitForTimeout(500);
  }

  async getTaskCount() {
    return await this.taskItems.count();
  }

  async getTaskNames() {
    const names = [];
    const count = await this.taskItems.count();

    for (let i = 0; i < count; i++) {
      const taskItem = this.taskItems.nth(i);
      const name = await taskItem.locator('p:first-of-type').textContent();
      names.push(name);
    }

    return names;
  }

  async isTaskComplete(taskIndex) {
    const taskItem = this.taskItems.nth(taskIndex);
    const checkbox = taskItem.locator('input[type="checkbox"]');
    return await checkbox.isChecked();
  }

  async hasErrorMessage() {
    return await this.errorAlert.isVisible();
  }

  async getErrorMessage() {
    return await this.errorAlert.textContent();
  }
}
