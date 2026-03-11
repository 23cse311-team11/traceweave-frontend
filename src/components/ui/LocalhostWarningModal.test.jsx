import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LocalhostWarningModal from './LocalhostWarningModal';
import { useRouter } from 'next/navigation';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LocalhostWarningModal', () => {
  const mockPush = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockPush });
  });

  test('does not render when isOpen is false', () => {
    render(<LocalhostWarningModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Localhost Blocked by Browser')).not.toBeInTheDocument();
  });

  test('renders correctly when isOpen is true', () => {
    render(<LocalhostWarningModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Localhost Blocked by Browser')).toBeInTheDocument();
    expect(screen.getByText('Get Desktop App')).toBeInTheDocument();
  });

  test('calls onClose and routes to /download when "Get Desktop App" is clicked', () => {
    render(<LocalhostWarningModal isOpen={true} onClose={mockOnClose} />);
    
    const downloadButton = screen.getByRole('button', { name: /Get Desktop App/i });
    fireEvent.click(downloadButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/download');
  });

  test('calls onClose when "Maybe later" is clicked', () => {
    render(<LocalhostWarningModal isOpen={true} onClose={mockOnClose} />);
    
    const maybeLaterButton = screen.getByRole('button', { name: /Maybe later/i });
    fireEvent.click(maybeLaterButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
