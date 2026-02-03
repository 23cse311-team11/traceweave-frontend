import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPanel from '../DashboardPanel';

// Mock Recharts RecursiveContainer and Charts to avoid complex SVG issues and ResizeObserver strictness,
// though we added a ResizeObserver mock in setup.
// It's often cleaner to verify they are rendered rather than testing the library's internal rendering.
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div />,
    Cell: () => <div />,
    ReferenceLine: () => <div />,
}));

describe('DashboardPanel Component', () => {
    it('renders the main content eventually', async () => {
        render(<DashboardPanel />);

        // Wait for main content to appear (handles both immediate load and loading state)
        await waitFor(() => {
            expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
        });
    });

    it('renders all 4 metric cards', async () => {
        render(<DashboardPanel />);
        await waitFor(() => screen.findByText('Performance Monitor'));

        expect(screen.getByText('Avg Latency')).toBeInTheDocument();
        expect(screen.getByText('Throughput')).toBeInTheDocument();
        expect(screen.getByText('Error Rate')).toBeInTheDocument();
        expect(screen.getByText('Active Services')).toBeInTheDocument();
    });

    it('renders the charts', async () => {
        render(<DashboardPanel />);
        await waitFor(() => screen.findByText('Performance Monitor'));

        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('renders the endpoints table correctly', async () => {
        render(<DashboardPanel />);
        await waitFor(() => screen.findByText('Performance Monitor'));

        expect(screen.getByText('Method')).toBeInTheDocument();
        expect(screen.getByText('Endpoint')).toBeInTheDocument();

        // Check for specific data presence
        expect(screen.getByText('/v1/payments/checkout')).toBeInTheDocument();
        expect(screen.getByText('/v1/users/profile')).toBeInTheDocument();
    });
});
