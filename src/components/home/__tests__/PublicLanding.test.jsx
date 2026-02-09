import React from 'react';
import { render } from '@testing-library/react';
import PublicLanding from '../PublicLanding';

/* ===== MOCK THE FOLDER MODULE (NOT A FILE) ===== */
jest.mock('../public_landing', () => ({
  __esModule: true,
  default: () => <div>PublicLandingContent</div>,
}));

describe('PublicLanding (home)', () => {
  it('renders without crashing', () => {
    const { container } = render(<PublicLanding />);
    expect(container).toBeTruthy();
  });
});
