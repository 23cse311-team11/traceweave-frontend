import { render, screen } from '@testing-library/react';
import ResponsePane from '../ResponsePane';

// Mock Next.js navigation if used inside component
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ResponsePane', () => {
  it('renders response pane', () => {
    render(<ResponsePane />);
    expect(screen.getByText(/response/i)).toBeInTheDocument();
  });
});
