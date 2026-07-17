import React from 'react';
import { Stack, Button, ButtonGroup, Box } from '@mui/material';

/**
 * TaskToolbar - Provides filter and sort controls
 */
const TaskToolbar = ({ filter, sort, onFilterChange, onSortChange }) => {
  return (
    <Box sx={{ my: 3 }}>
      <Stack spacing={2}>
        {/* Filter Controls */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
          <Box sx={{ fontWeight: 500, minWidth: '80px' }}>Filter:</Box>
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={() => onFilterChange('all')}
              variant={filter === 'all' ? 'contained' : 'outlined'}
            >
              All
            </Button>
            <Button
              onClick={() => onFilterChange('incomplete')}
              variant={filter === 'incomplete' ? 'contained' : 'outlined'}
            >
              Incomplete
            </Button>
            <Button
              onClick={() => onFilterChange('complete')}
              variant={filter === 'complete' ? 'contained' : 'outlined'}
            >
              Complete
            </Button>
          </ButtonGroup>
        </Stack>

        {/* Sort Controls */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
          <Box sx={{ fontWeight: 500, minWidth: '80px' }}>Sort:</Box>
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={() => onSortChange('created_at')}
              variant={sort === 'created_at' ? 'contained' : 'outlined'}
            >
              Newest
            </Button>
            <Button
              onClick={() => onSortChange('due_date_asc')}
              variant={sort === 'due_date_asc' ? 'contained' : 'outlined'}
            >
              Due Date ↑
            </Button>
            <Button
              onClick={() => onSortChange('due_date_desc')}
              variant={sort === 'due_date_desc' ? 'contained' : 'outlined'}
            >
              Due Date ↓
            </Button>
          </ButtonGroup>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TaskToolbar;
