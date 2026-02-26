import {
  createRoute,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { BenchmarkPage } from './features/leaderboard/BenchmarkPage';
import { RootLayout } from './routes/RootLayout';

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: BenchmarkPage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
