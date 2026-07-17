import React from 'react';
import { Stack, Typography, CircularProgress, Box } from '@mui/material';
import TaskItem from './TaskItem';

/**
 * TaskList - Displays a list of tasks
 */
const TaskList = ({
  tasks,
  loading,
  onToggleComplete,
  onUpdateTask,
  onDeleteTask,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No tasks found. Add one to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          loading={loading}
        />
      ))}
    </Stack>
  );
};

export default TaskList;
