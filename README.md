# aphra-web

> A frontend application scaffolded with [tskickstart](https://github.com/jeportie/tskickstart).

This is a modern React single-page application built with Vite and Tailwind CSS v4. It uses a component-driven architecture with fast hot module replacement for instant feedback during development. The project includes a Welcome page to get you started, pre-configured testing with Vitest and Testing Library, and a quality toolchain that catches issues before they reach production.

---

## Project Snapshot

| Item | Value |
| --- | --- |
| Project type | Frontend Application |
| Primary stack | React + Vite + Tailwind CSS |
| Testing stack | Vitest + Playwright |
| Quality stack | TypeScript, ESLint, Prettier, Secretlint, Commitlint |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v22+ (see `.mise.toml` for pinned version)
- [mise](https://mise.jdx.dev/) (recommended for tool version management)

---

## Getting Started

Install tool versions and dependencies:

```bash
mise install
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:5173 in your browser. You will see the Welcome page with hot module replacement — edits to components appear instantly without a full page reload.

Verify everything works with the full quality gate:

```bash
npm run check
```

---

## Development

```bash
npm run dev
```

Opens the Vite dev server with hot module replacement.

---

## Build

```bash
npm run build
```

Type-checks and builds for production with Vite. Output in `dist/`.

---

## Implementation Workflow

1. **Start the dev server** — run `npm run dev` and open `http://localhost:5173`. Vite HMR is active so every saved change appears instantly in the browser.

2. **Create the component** — add a new `.tsx` file in `src/`. Follow the patterns in `src/Welcome.tsx`: default export, TypeScript props type, Tailwind utility classes for styling.

3. **Write a failing test first** — create a matching test file in `tests/unit/` (e.g. `ComponentName.unit.test.tsx`). Use `render` and `screen` from Testing Library to assert the expected behavior, then run `npm run test:unit` to confirm the test fails.

4. **Implement until tests pass** — fill in the component code until `npm run test:unit` goes green. Check the browser to verify visually — Vite HMR picks up saved changes immediately.

5. **Wire into the app and run the quality gate** — if it is a page, add a `<Route>` in `src/App.tsx`. If it is a shared component, import it in the page that needs it. Then run the full check:

```bash
npm run check    # format, lint, typecheck, spellcheck, secretlint, tests
```

Commit using the conventional format enforced by commitlint:

```bash
git commit -m "feat(ui): add NotificationBanner component"
```

---

## Frontend Tutorial

Three progressive tutorials that build on this project. Each one introduces a real pattern you will use when building features on top of this starter.

### Tutorial 1: Build a NotificationBanner with TDD

A dismissible banner that accepts a message and a variant (`"info"` or `"error"`). This tutorial walks through the full red-green-refactor cycle.

#### Step 1 — Start with the props type and an empty component

Create `src/NotificationBanner.tsx`:

```tsx
import { useState } from 'react';

type NotificationBannerProps = {
  message: string;
  variant: 'info' | 'error';
};

export default function NotificationBanner({
  message,
  variant,
}: NotificationBannerProps) {
  return null; // start empty — tests will drive the implementation
}
```

#### Step 2 — Write failing tests

Create `tests/unit/NotificationBanner.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NotificationBanner from '../../src/NotificationBanner';

describe('NotificationBanner', () => {
  it('renders the message', () => {
    render(<NotificationBanner message="Saved" variant="info" />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('applies info styling for info variant', () => {
    render(<NotificationBanner message="Saved" variant="info" />);

    expect(screen.getByRole('alert')).toHaveClass('bg-blue-100');
  });

  it('applies error styling for error variant', () => {
    render(<NotificationBanner message="Failed" variant="error" />);

    expect(screen.getByRole('alert')).toHaveClass('bg-red-100');
  });

  it('hides when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationBanner message="Saved" variant="info" />);

    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });
});
```

Run the tests — all 4 should fail:

```bash
npm run test:unit
```

#### Step 3 — Implement until green

Update `src/NotificationBanner.tsx`:

```tsx
import { useState } from 'react';

type NotificationBannerProps = {
  message: string;
  variant: 'info' | 'error';
};

export default function NotificationBanner({
  message,
  variant,
}: NotificationBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
        variant === 'info'
          ? 'bg-blue-100 text-blue-900'
          : 'bg-red-100 text-red-900'
      }`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-4 font-bold hover:opacity-70"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
}
```

Run again — all 4 pass:

```bash
npm run test:unit
```

#### Step 4 — Use it

Import the component in `src/Welcome.tsx` and place it above the counter card:

```tsx
import NotificationBanner from './NotificationBanner';

// inside the return, before the counter <div>:
<NotificationBanner message="Welcome to the app!" variant="info" />
```

Check the browser at `http://localhost:5173` — the blue banner appears and dismisses on click.

**What you learned**: TypeScript props, conditional Tailwind classes, `useState` for UI state, `aria-label` for accessible button targeting in tests, `queryByText` for asserting element absence.

---

### Tutorial 2: Add an About page with routing

This project uses React Router v7 (`react-router` package). The existing route is defined in `src/App.tsx`. This tutorial adds a second page and wires up navigation between them.

#### Step 1 — Create the page component

Create `src/About.tsx`:

```tsx
export default function About() {
  return (
    <div className="min-h-screen bg-gray-200 text-black flex flex-col items-center font-sans">
      <h1 className="mt-16 text-4xl font-bold">About</h1>
      <p className="mt-4 max-w-md text-center text-gray-700">
        This project was scaffolded with tskickstart. It uses React, Vite, and
        Tailwind CSS v4.
      </p>
    </div>
  );
}
```

The outer `<div>` mirrors the layout from `Welcome.tsx` for visual consistency.

#### Step 2 — Write a unit test

Create `tests/unit/About.unit.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import About from '../../src/About';

describe('About', () => {
  it('renders the heading', () => {
    render(<About />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'About',
    );
  });

  it('renders the description', () => {
    render(<About />);

    expect(
      screen.getByText(/scaffolded with tskickstart/i),
    ).toBeInTheDocument();
  });
});
```

#### Step 3 — Register the route

Update `src/App.tsx`:

```tsx
import { BrowserRouter, Route, Routes } from 'react-router';

import About from './About';
import Welcome from './Welcome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

#### Step 4 — Write a routing integration test

In unit tests you render a component directly. To test routing you need `MemoryRouter` — this is the key gotcha because `BrowserRouter` does not work in the Vitest/happy-dom test environment.

Create `tests/integration/About.int.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

import About from '../../src/About';

describe('About page routing', () => {
  it('renders About when navigating to /about', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Routes>
          <Route path="/about" element={<About />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'About',
    );
  });
});
```

#### Step 5 — Add navigation links

In `src/Welcome.tsx`, add a link to the About page. Import `Link` from `react-router`:

```tsx
import { Link } from 'react-router';

// inside the return, after the logos paragraph:
<Link
  to="/about"
  className="mt-2 text-blue-600 underline hover:text-blue-800"
>
  About this project
</Link>
```

Add a matching link back in `src/About.tsx`:

```tsx
import { Link } from 'react-router';

// inside the return, after the <p>:
<Link to="/" className="mt-4 text-blue-600 underline hover:text-blue-800">
  Back to home
</Link>
```

#### Step 6 — Write an E2E test

Create `tests/e2e/about.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('About page', () => {
  test('navigates to about page via link', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About this project' }).click();
    await expect(
      page.getByRole('heading', { name: 'About' }),
    ).toBeVisible();
  });

  test('navigates back to home', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(
      page.getByRole('heading', { name: 'Vite + React + Tailwind' }),
    ).toBeVisible();
  });
});
```

Run all tests:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

**What you learned**: Page layout consistency with Tailwind, React Router v7 route registration, `MemoryRouter` with `initialEntries` for test-time routing, `Link` for client-side navigation, Playwright E2E tests for cross-page flows.

---

### Tutorial 3: Fetch data with React Query

`@tanstack/react-query` is already installed in this project. This tutorial wires it up end-to-end: provider setup, custom hook, data-driven component, and tests with mocked fetch.

#### Step 1 — Add the QueryClientProvider

Update `src/main.tsx` to wrap the app with `QueryClientProvider`. Place it inside `ErrorBoundary` so query errors are caught, but around `App` so all routes have access:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

export function AppSetup() {
  return (
    <StrictMode>
      <ErrorBoundary
        fallback={<p className="text-red-600">An Error has occurred.</p>}
      >
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<AppSetup />);
```

#### Step 2 — Create a custom data-fetching hook

Create `src/useUsers.ts`:

```ts
import { useQuery } from '@tanstack/react-query';

type User = {
  id: number;
  name: string;
  email: string;
};

async function fetchUsers(): Promise<User[]> {
  const response = await fetch(
    'https://jsonplaceholder.typicode.com/users',
  );
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
}
```

The `queryKey` is a stable array React Query uses for caching and refetching. The `queryFn` is a plain async function that returns data or throws.

#### Step 3 — Build the UserList component

Create `src/UserList.tsx`:

```tsx
import { useUsers } from './useUsers';

export default function UserList() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  return (
    <ul className="mt-4 space-y-2">
      {users?.map((user) => (
        <li key={user.id} className="rounded-lg bg-white px-4 py-3 shadow">
          <span className="font-medium">{user.name}</span>
          <span className="ml-2 text-gray-500">{user.email}</span>
        </li>
      ))}
    </ul>
  );
}
```

#### Step 4 — Test it

Create `tests/unit/UserList.unit.test.tsx`. The key pattern: wrap each test in a fresh `QueryClientProvider` with `retry: false` to avoid flaky retries, and mock `fetch` with `vi.fn()`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import UserList from '../../src/UserList';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('UserList', () => {
  it('shows loading state initially', () => {
    globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<UserList />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('renders users after fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: 1, name: 'Alice', email: 'alice@example.com' },
        ]),
    });

    render(<UserList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });

    render(<UserList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
```

#### Step 5 — Add a route and navigate to it

In `src/App.tsx`, add the route:

```tsx
import UserList from './UserList';

// inside <Routes>:
<Route path="/users" element={<UserList />} />
```

Add a link in `src/Welcome.tsx`:

```tsx
<Link to="/users" className="mt-2 text-blue-600 underline hover:text-blue-800">
  View users
</Link>
```

Visit `http://localhost:5173/users` — you will see a list of 10 users fetched from the JSONPlaceholder API, each in a white card with their name and email.

**What you learned**: Where to place `QueryClientProvider` relative to `ErrorBoundary`, separating fetch logic into a custom hook, the `useQuery` return shape (`data`, `isLoading`, `error`), testing async components with `waitFor`, mocking `fetch` with `vi.fn()`, creating a fresh `QueryClient` per test.

---

## Testing

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
```

```bash
npm run test:coverage  # With coverage report
```

```bash
npm run test:e2e       # Run Playwright E2E tests
npm run test:e2e:ui    # Interactive UI mode
```

---

## Testing Workflow

1. **Run tests closest to your change first** (unit > integration > e2e).

2. **Keep tests behavior-focused**: assert outputs, side effects, and user-visible outcomes rather than implementation details.

3. **Core test loop (Vitest)**

```bash
npm test
npm run test:unit
npm run test:integration
```

4. **Coverage checks**

```bash
npm run test:coverage
```

5. **E2E checks (Playwright)**

```bash
npm run test:e2e
```

6. **Run the release gate before opening a PR**

```bash
npm run check
```

---

## Quality Checks

```bash
npm run check
```

Runs formatting, linting, type checking, secret scanning, and tests in sequence.

---

## Project Structure

```
src/
  main.tsx         # React entry point — renders App into #root with StrictMode
  App.tsx          # Router setup — defines routes using React Router
  Welcome.tsx      # Welcome page component — the landing page you see on first run
                   # Replace this with your own pages. Add new routes in App.tsx
  index.css        # Tailwind CSS v4 entry — @import "tailwindcss" is all you need
tests/
  unit/            # Component unit tests with @testing-library/react
  integration/     # Integration tests for multi-component flows
```

---

## Common Tasks

### How to add a new page

1. Create a component in `src/`, e.g. `src/About.tsx`:

```tsx
export function About() {
  return <h1>About</h1>;
}
```

2. Add a route in `src/App.tsx`:

```tsx
<Route path="/about" element={<About />} />
```

3. Add a unit test in `tests/unit/` for the new component.

### How to add a new component

Create the component in `src/` as a named export:

```tsx
export function StatusBadge({ online }: { online: boolean }) {
  return (
    <span className={online ? 'text-green-600' : 'text-red-600'}>
      {online ? 'Online' : 'Offline'}
    </span>
  );
}
```

Import and use it in any page component.

### How to style with Tailwind CSS

Use utility classes directly in JSX. Tailwind CSS v4 is configured via `src/index.css` — no `tailwind.config.js` needed.

```tsx
<div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow">
  <h2 className="text-xl font-bold">Card Title</h2>
</div>
```

---

## Tools

- **React** + **Vite** + **Tailwind CSS v4**
- **TypeScript** — strict type checking
- **ESLint** v9 + **Prettier** — code quality and formatting
- **Secretlint** — secret detection
- **Commitlint** — conventional commit enforcement
- **Vitest** — test runner
- **Playwright** — E2E testing

---

## Tool Playbooks

### TypeScript

TypeScript is configured in strict mode with JSX support. In this React project, it validates component props, hook usage, and event handlers at compile time. The `tsconfig.json` is split into app and node configs for optimal checking.

Use cases:
- Validate component props and prevent missing or wrong-type props
- Catch stale closure bugs in useEffect dependencies
- Ensure event handler signatures match DOM events

```ts
type User = { id: string; name: string };

export function formatUser(user: User): string {
  return `${user.name} (${user.id})`;
}
```

### ESLint + Prettier

ESLint includes React-specific plugins (react-hooks, react-refresh). It enforces Rules of Hooks, prevents stale closures in effects, and validates that components are safe for hot module replacement.

Prettier keeps formatting automatic and low-friction — no debates about style, just consistent code.

```bash
npm run lint
npm run format
```

### React + Vite + Tailwind CSS

This stack gives fast feedback loops, modern component composition, and utility-first styling.

Use cases:
- Build composable UI with reusable components
- Iterate quickly with Vite hot module replacement
- Style with utility classes instead of writing CSS files

```tsx
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      className="rounded bg-blue-600 px-4 py-2 text-white"
      onClick={() => setCount((n) => n + 1)}
    >
      Count: {count}
    </button>
  );
}
```

### Vitest

Vitest is configured with jsdom and @testing-library/react for component testing. In this frontend project, use it to verify component rendering, user interactions, and hook behavior.

Use cases:
- Render components and assert DOM output
- Simulate user clicks, typing, and form submissions
- Test custom hooks in isolation with renderHook

```ts
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Welcome } from '../src/Welcome';

describe('Welcome', () => {
  it('renders heading', () => {
    render(<Welcome />);
    expect(screen.getByRole('heading')).toBeDefined();
  });
});
```

### Playwright

Playwright adds browser-level confidence for critical user paths. It runs real browsers and can test across Chrome, Firefox, and Safari.

Use cases:
- Smoke tests for deployment safety
- End-to-end tests across multi-page user flows
- Visual regression testing

```ts
import { test, expect } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

### Secretlint

Secretlint scans the repository for API keys, tokens, and other accidental secrets before they reach version control.

Use cases:
- Prevent committing sensitive credentials
- Add a safety net before pushes and PRs
- Catch leaked tokens in test fixtures

```bash
npm run secretlint
```

### Commitlint

Commitlint enforces predictable commit messages following the Conventional Commits standard. This enables automated changelogs and semantic versioning.

Use cases:
- Keep commit history searchable and structured
- Enable automated release note generation
- Enforce team-wide commit message conventions

```bash
git commit -m "feat(cli): add doctor command"
```

---

## Scripts Reference

| Script | Description |
| --- | --- |
| `npm run check` | Run all quality checks |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with TypeScript |
| `npm run secretlint` | Scan for secrets |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:coverage` | Tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright interactive mode |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
