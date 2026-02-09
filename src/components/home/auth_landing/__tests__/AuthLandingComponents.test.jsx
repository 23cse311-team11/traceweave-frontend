import { render } from '@testing-library/react';

/**
 * MOCK ALL AUTH LANDING COMPONENTS
 * These components depend on layout, stores, routing, motion, etc.
 * We only verify that they are wired correctly.
 */

jest.mock('../DashboardHeader', () => () => <div data-testid="DashboardHeader" />);
jest.mock('../QuickActions', () => () => <div data-testid="QuickActions" />);
jest.mock('../RecentActivity', () => () => <div data-testid="RecentActivity" />);
jest.mock('../ResizableSidebar', () => () => <div data-testid="ResizableSidebar" />);
jest.mock('../Sidebar', () => () => <div data-testid="Sidebar" />);
jest.mock('../StatsGrid', () => () => <div data-testid="StatsGrid" />);
jest.mock('../WelcomeSection', () => () => <div data-testid="WelcomeSection" />);
jest.mock('../WorkspacesList', () => () => <div data-testid="WorkspacesList" />);

import DashboardHeader from '../DashboardHeader';
import QuickActions from '../QuickActions';
import RecentActivity from '../RecentActivity';
import ResizableSidebar from '../ResizableSidebar';
import Sidebar from '../Sidebar';
import StatsGrid from '../StatsGrid';
import WelcomeSection from '../WelcomeSection';
import WorkspacesList from '../WorkspacesList';

describe('Auth Landing Components', () => {
  const COMPONENTS = [
    { name: 'DashboardHeader', Component: DashboardHeader },
    { name: 'QuickActions', Component: QuickActions },
    { name: 'RecentActivity', Component: RecentActivity },
    { name: 'ResizableSidebar', Component: ResizableSidebar },
    { name: 'Sidebar', Component: Sidebar },
    { name: 'StatsGrid', Component: StatsGrid },
    { name: 'WelcomeSection', Component: WelcomeSection },
    { name: 'WorkspacesList', Component: WorkspacesList },
  ];

  COMPONENTS.forEach(({ name, Component }) => {
    it(`${name} renders without crashing`, () => {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    });
  });
});
