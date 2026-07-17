import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Stack,
  Checkbox,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Box,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import dayjs from 'dayjs';

/**
 * TaskItem - Individual task card with edit, delete, and completion toggle
 */
const TaskItem = ({ task, onToggleComplete, onUpdateTask, onDeleteTask, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editDueDate, setEditDueDate] = useState(task.due_date ? dayjs(task.due_date) : null);
  const [editError, setEditError] = useState('');

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  const handleSaveEdit = async () => {
    setEditError('');
    if (!editName.trim()) {
      setEditError('Task name cannot be empty');
      return;
    }

    try {
      const dueDateString = editDueDate ? editDueDate.toISOString().split('T')[0] : null;
      await onUpdateTask(task.id, { name: editName.trim(), due_date: dueDateString });
      setIsEditing(false);
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleCancel = () => {
    setEditName(task.name);
    setEditDueDate(task.due_date ? dayjs(task.due_date) : null);
    setEditError('');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card sx={{ elevation: 1, p: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Task Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            variant="outlined"
            fullWidth
            error={!!editError}
            helperText={editError}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Due Date"
              value={editDueDate}
              onChange={setEditDueDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                },
              }}
            />
          </LocalizationProvider>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEdit}
              disabled={loading}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ elevation: 1 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {/* Checkbox for completion */}
          <Checkbox
            checked={task.completed}
            onChange={() => onToggleComplete(task.id, task.completed)}
            disabled={loading}
            sx={{ mt: 0.5 }}
          />

          {/* Task content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? 'text.secondary' : 'text.primary',
              }}
            >
              {task.name}
            </Typography>

            {/* Due date and overdue indicator */}
            {task.due_date && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                {isOverdue && (
                  <WarningAmberIcon
                    sx={{ fontSize: '1rem', color: '#FF5722' }}
                    aria-label="Task is overdue"
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: isOverdue ? '#FF5722' : 'text.secondary',
                    fontWeight: isOverdue ? 500 : 400,
                  }}
                >
                  {`Due: ${new Date(task.due_date).toLocaleDateString()}`}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Action buttons */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit task">
              <IconButton
                onClick={() => setIsEditing(true)}
                disabled={loading}
                size="small"
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete task">
              <IconButton
                onClick={() => onDeleteTask(task.id)}
                disabled={loading}
                size="small"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
