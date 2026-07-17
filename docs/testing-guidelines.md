# Testing Guidelines

## Overview

This document defines the testing principles and standards for the TODO app. All new features must include appropriate tests following these guidelines.

---

## 1. Unit Tests

- Use **Jest** to test individual functions and React components in isolation.
- File naming convention: `*.test.js` or `*.test.ts`
- Backend unit tests: `packages/backend/__tests__/`
- Frontend unit tests: `packages/frontend/src/__tests__/`
- Name test files to match the file being tested (e.g., `app.test.js` for `app.js`).

---

## 2. Integration Tests

- Use **Jest + Supertest** to test backend API endpoints with real HTTP requests.
- File naming convention: `*.test.js` or `*.test.ts`
- Location: `packages/backend/__tests__/integration/`
- Name integration test files based on what they test (e.g., `todos-api.test.js` for TODO API endpoints).

---

## 3. End-to-End (E2E) Tests

- Use **Playwright** (required framework) to test complete UI workflows through browser automation.
- File naming convention: `*.spec.js` or `*.spec.ts`
- Location: `tests/e2e/`
- Name E2E test files based on the user journey they test (e.g., `todo-workflow.spec.js`).
- **Use one browser only** — do not run tests across multiple browsers.
- **Use the Page Object Model (POM) pattern** for all E2E tests to ensure maintainability.
- **Limit E2E tests to 5–8 critical user journeys** — focus on happy paths and key edge cases, not exhaustive coverage.

---

## 4. Port Configuration

Always use environment variables with sensible defaults for port configuration to allow CI/CD workflows to dynamically detect ports:

- **Backend**: `const PORT = process.env.PORT || 3030;`
- **Frontend**: React's default port is `3000`, but can be overridden with the `PORT` environment variable.

---

## 5. General Principles

- **All tests must be isolated and independent** — each test sets up its own data and does not rely on the state or outcome of other tests.
- **Setup and teardown hooks are required** — use `beforeEach`/`afterEach` (or `beforeAll`/`afterAll` where appropriate) so tests succeed on repeated runs.
- **All new features must include appropriate tests** — unit tests for logic, integration tests for API endpoints, and E2E tests for critical user journeys.
- Tests must be maintainable and follow best practices — avoid hardcoded data, magic numbers, and tightly coupled assertions.
