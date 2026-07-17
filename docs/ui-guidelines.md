# UI Guidelines

## Overview

This document defines the core UI guidelines for the TODO app. All frontend development should follow these standards to ensure a consistent, accessible, and visually cohesive user experience.

---

## 1. Component Library

- Use **Material UI (MUI)** as the primary component library.
- Prefer MUI components (e.g., `Button`, `TextField`, `Checkbox`, `Card`, `IconButton`) over custom HTML elements.
- Do not mix component libraries — avoid Bootstrap, Ant Design, or other UI frameworks alongside MUI.

---

## 2. Color Palette

| Role             | Color Token               | Hex       |
|------------------|---------------------------|-----------|
| Primary          | `primary.main`            | `#1976D2` |
| Primary Dark     | `primary.dark`            | `#115293` |
| Secondary        | `secondary.main`          | `#9C27B0` |
| Background       | `background.default`      | `#F5F5F5` |
| Surface / Cards  | `background.paper`        | `#FFFFFF` |
| Error            | `error.main`              | `#D32F2F` |
| Success          | `success.main`            | `#2E7D32` |
| Text Primary     | `text.primary`            | `#212121` |
| Text Secondary   | `text.secondary`          | `#757575` |
| Overdue Indicator| N/A                       | `#FF5722` |

Use the MUI `ThemeProvider` to apply these tokens globally rather than inline styles.

---

## 3. Typography

- Use the default MUI typography scale (`h1`–`h6`, `body1`, `body2`, `caption`).
- Font family: **Roboto** (loaded via MUI's default theme).
- App title: `h4` variant.
- Task names: `body1` variant.
- Metadata (due date, timestamps): `caption` variant.

---

## 4. Button Styles

- **Primary action** (e.g., Add Task, Save): `variant="contained"` with `color="primary"`.
- **Secondary/cancel action**: `variant="outlined"` with `color="primary"`.
- **Destructive action** (e.g., Delete): `variant="outlined"` with `color="error"`.
- Icon-only actions (e.g., edit, delete inline): use `IconButton` with a tooltip via `Tooltip` component.
- Buttons must always include a descriptive `aria-label` when text is not visible.

---

## 5. Layout

- The app uses a centered single-column layout with a max width of `600px`.
- Use MUI `Container` for page-level centering.
- Use MUI `Stack` or `Box` with `gap` for spacing between elements.
- Consistent spacing unit: `8px` base (MUI default `theme.spacing(1) = 8px`).
- Task list items are rendered in MUI `Card` components with `elevation={1}`.

---

## 6. Forms & Input

- Use MUI `TextField` with `variant="outlined"` for all text inputs.
- Use MUI `DatePicker` (from `@mui/x-date-pickers`) for due date selection.
- Inline form validation errors must be shown using the `helperText` and `error` props on `TextField`.
- Required fields must be marked with an asterisk (MUI default behavior with `required` prop).

---

## 7. Accessibility

- All interactive elements must be keyboard-navigable.
- Color alone must not be the only means of conveying information (e.g., overdue tasks must also have a text label or icon, not just a color change).
- All images and icons must have descriptive `alt` text or `aria-label`.
- Minimum contrast ratio of **4.5:1** for normal text (WCAG AA compliance).
- Focus indicators must be visible on all interactive elements.
- Use semantic HTML elements (`<main>`, `<header>`, `<ul>`, `<li>`) where appropriate alongside MUI components.

---

## 8. Responsive Design

- The app must be fully functional on screen widths from `320px` to `1440px`.
- Use MUI's responsive `sx` prop or `useMediaQuery` hook for breakpoint-specific styles.
- Touch targets must be at least `44x44px` for mobile usability.

---

## 9. Feedback & State Indicators

- Use MUI `CircularProgress` for loading states.
- Use MUI `Alert` (severity `error` or `success`) to display operation feedback messages.
- Completed tasks must use a `Checkbox` (checked state) and apply `text-decoration: line-through` to the task name.
- Overdue tasks must display the due date in the overdue color (`#FF5722`) with a warning icon (`WarningAmberIcon`).
