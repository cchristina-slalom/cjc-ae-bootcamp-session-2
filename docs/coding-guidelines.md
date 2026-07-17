# Coding Guidelines

## Overview

This document describes the coding style and quality principles for the TODO app. All contributors should follow these guidelines to ensure the codebase remains readable, maintainable, and consistent.

---

## 1. General Formatting

- Use **2-space indentation** throughout — no tabs.
- Keep lines under **100 characters** where practical.
- Use **single quotes** for strings in JavaScript/Node.js; JSX attribute values use double quotes.
- Always include a **trailing newline** at the end of every file.
- Remove trailing whitespace before committing.
- Use **semicolons** at the end of statements in JavaScript.

---

## 2. Language & Syntax

- Use **ES6+** features: `const`/`let` (never `var`), arrow functions, destructuring, template literals, optional chaining (`?.`), and nullish coalescing (`??`).
- Prefer `const` by default; use `let` only when reassignment is necessary.
- Use `async/await` over raw `.then()` chains for asynchronous code.
- Avoid deeply nested callbacks or promise chains — extract named functions when nesting exceeds two levels.

---

## 3. Import Organization

Imports should be grouped and ordered as follows, with a blank line between each group:

1. **Node.js built-in modules** (e.g., `path`, `fs`)
2. **Third-party packages** (e.g., `express`, `react`, `@mui/material`)
3. **Internal/local modules** (e.g., `./components/TaskList`, `../utils/formatDate`)

Within each group, sort imports alphabetically. Named imports should be sorted alphabetically within the braces.

```js
// 1. Built-ins
const path = require('path');

// 2. Third-party
const express = require('express');
import React, { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';

// 3. Local
import TaskList from './components/TaskList';
import { formatDate } from './utils/formatDate';
```

---

## 4. Linting

- The frontend uses **ESLint** via `react-scripts` with the `react-app` and `react-app/jest` rule sets.
- Do not disable ESLint rules inline (`// eslint-disable`) without a clear comment explaining why.
- All linting errors must be resolved before merging — warnings should be addressed where practical.
- New code should not introduce new ESLint warnings.

---

## 5. Naming Conventions

| Construct              | Convention              | Example                    |
|------------------------|-------------------------|----------------------------|
| React components       | PascalCase              | `TaskList`, `AddTaskForm`  |
| Functions & variables  | camelCase               | `fetchTasks`, `isLoading`  |
| Constants              | UPPER_SNAKE_CASE        | `MAX_TASK_LENGTH`          |
| Files (components)     | PascalCase              | `TaskList.js`              |
| Files (utilities/hooks)| camelCase               | `useTaskFilter.js`         |
| CSS class names        | kebab-case              | `.task-item--overdue`      |

---

## 6. DRY Principle

- Do not repeat logic — extract shared behavior into utility functions, custom hooks, or shared modules.
- If the same logic appears in more than two places, it must be abstracted.
- Shared frontend utilities belong in `packages/frontend/src/utils/`.
- Shared backend utilities belong in `packages/backend/src/utils/`.

---

## 7. Component Design (Frontend)

- Each React component should have a **single responsibility**.
- Prefer small, focused components over large monolithic ones.
- Extract reusable UI patterns into dedicated components in `packages/frontend/src/components/`.
- Keep business logic out of components — use custom hooks (`packages/frontend/src/hooks/`) for stateful logic and side effects.
- Props should be explicitly typed with PropTypes or documented via JSDoc comments.

---

## 8. API & Backend Style

- All API routes must follow **RESTful conventions** (nouns for resources, HTTP verbs for actions).
- Route handlers should be thin — delegate business logic to service functions.
- Always validate and sanitize request inputs at the API boundary before processing.
- Return consistent JSON error shapes: `{ "error": "Human-readable message" }`.
- Use appropriate HTTP status codes (`200`, `201`, `400`, `404`, `500`).

---

## 9. Error Handling

- Never swallow errors silently — always log unexpected errors with `console.error` at minimum.
- In async functions, wrap risky operations in `try/catch` blocks.
- Surface meaningful error messages to the UI; do not expose raw stack traces or internal details to the client.

---

## 10. Comments & Documentation

- Write **self-documenting code** — prefer clear naming over explanatory comments.
- Add comments only to explain *why* something is done when the reason is non-obvious, not *what* it does.
- All exported functions and React components should have a short JSDoc comment describing their purpose and parameters.
- Keep comments up to date — outdated comments are worse than no comments.
