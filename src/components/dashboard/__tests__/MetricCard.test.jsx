import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../dashboard_panel_components/MetricCard';
import { Clock } from 'lucide-react';

describe('MetricCard Component', () => {
    const mockProps = {
        title: 'Avg Latency',
        value: '142',
        unit: 'ms',
        trend: '+12%',
        icon: Clock,
    };

    it('renders the title, value, and unit correctly', () => {
        render(<MetricCard {...mockProps} />);

        expect(screen.getByText('Avg Latency')).toBeInTheDocument();
        expect(screen.getByText('142')).toBeInTheDocument();
        expect(screen.getByText('ms')).toBeInTheDocument();
    });

    it('renders the trend correctly', () => {
        render(<MetricCard {...mockProps} />);

        expect(screen.getByText('+12%')).toBeInTheDocument();
        expect(screen.getByText('vs last hr')).toBeInTheDocument();
    });

    it('applies correct color for bad upward trend', () => {
        // trendUpBad is true by default. +12% should be bad (red)
        const { container } = render(<MetricCard {...mockProps} />);
        // Find the trend container. We can look for the text's parent or check class presence logic
        // The text color logic is: ${isBad ? 'text-red-400' : 'text-emerald-400'}
        // isPositive=+ isBad=true -> red
        const trendElement = screen.getByText('+12%').parentElement;
        expect(trendElement).toHaveClass('text-red-400');
    });

    it('applies correct color for good upward trend', () => {
        render(<MetricCard {...mockProps} trendUpBad={false} />);
        // trendUpBad=false. +12% should be good (emerald)
        const trendElement = screen.getByText('+12%').parentElement;
        expect(trendElement).toHaveClass('text-emerald-400');
    });

    it('applies correct color for good downward trend (default trendUpBad=true)', () => {
        render(<MetricCard {...mockProps} trend="-10%" />);
        // trendUpBad=true. -10% is NOT positive. isBad = !isPositive = !false = true wait.

        // logic:
        // isPositive = trend.startsWith('+')
        // isBad = trendUpBad ? isPositive : !isPositive

        // Case: trend="-10%" (negative)
        // isPositive = false
        // trendUpBad = true (default)
        // isBad = true ? false : !false = true (Wait, if trendUpBad=true, then 'up' is bad. So 'down' must be good?)

        // Let's re-read the code logic in MetricCard.jsx:
        // const isBad = trendUpBad ? isPositive : !isPositive;

        // if trendUpBad=true (default):
        // if + : isPositive=true -> isBad=true. Correct.
        // if - : isPositive=false -> isBad=false. Correct. Down is good.

        // So for trend="-10%", isBad should be false -> emerald.

        const trendElement = screen.getByText('-10%').parentElement;
        expect(trendElement).toHaveClass('text-emerald-400');
    });
});
