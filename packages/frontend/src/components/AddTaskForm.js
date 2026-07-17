import React, { useState } from 'react';
import { Box, Button, TextField, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

/**
 * AddTaskForm - Component for adding a new task with optional due date
 */
const AddTaskForm = ({ onAddTask, loading }) => {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!taskName.trim()) {
      setError('Task name is required');
      return;
    }

    try {
      const dueDateString = dueDate ? dueDate.toISOString().split('T')[0] : null;
      await onAddTask(taskName.trim(), dueDateString);
      setTaskName('');
      setDueDate(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 3 }}>
      <Stack spacing={2}>
        <TextField
          label="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          variant="outlined"
          fullWidth
          required
          disabled={loading}
          error={!!error}
          helperText={error}
          placeholder="Enter task name"
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Due Date (Optional)"
            value={dueDate}
            onChange={setDueDate}
            disabled={loading}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
              },
            }}
          />
        </LocalizationProvider>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          Add Task
        </Button>
      </Stack>
    </Box>
  );
};

export default AddTaskForm;
