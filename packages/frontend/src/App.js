import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Container, Box, Typography, Alert } from '@mui/material';
import theme from './theme';
import { useTasks } from './hooks/useTasks';
import AddTaskForm from './components/AddTaskForm';
import TaskToolbar from './components/TaskToolbar';
import TaskList from './components/TaskList';

/**
 * App - Main TODO application component
 */
function App() {
  const {
    tasks,
    loading,
    error,
    filter,
    setFilter,
    sort,
    setSort,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
  } = useTasks();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="sm">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              To Do App
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Keep track of your tasks efficiently
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Add Task Form */}
          <AddTaskForm onAddTask={addTask} loading={loading} />

          {/* Filter & Sort Toolbar */}
          <TaskToolbar
            filter={filter}
            sort={sort}
            onFilterChange={setFilter}
            onSortChange={setSort}
          />

          {/* Task List */}
          <TaskList
            tasks={tasks}
            loading={loading}
            onToggleComplete={toggleComplete}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;