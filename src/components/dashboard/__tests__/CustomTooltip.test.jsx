import React from 'react';
import { render, screen } from '@testing-library/react';
import { CustomTooltip } from '../dashboard_panel_components/CustomTooltip';

describe('CustomTooltip Component', () => {
    const mockPayload = [
        { name: 'latency', value: 120, color: '#0069D9' },
        { name: 'requests', value: 2000, color: '#22c55e' }
    ];
    const mockLabel = '12:00';

    it('renders nothing when inactive', () => {
        const { container } = render(<CustomTooltip active={false} payload={mockPayload} label={mockLabel} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when payload is empty', () => {
        const { container } = render(<CustomTooltip active={true} payload={[]} label={mockLabel} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders correct data when active and has payload', () => {
        render(<CustomTooltip active={true} payload={mockPayload} label={mockLabel} />);

        // Check label
        expect(screen.getByText('12:00')).toBeInTheDocument();

        // Check first metric
        expect(screen.getByText('latency:')).toBeInTheDocument();
        expect(screen.getByText('120')).toBeInTheDocument();

        // Check second metric
        expect(screen.getByText('requests:')).toBeInTheDocument();
        expect(screen.getByText('2000')).toBeInTheDocument();
    });
});
