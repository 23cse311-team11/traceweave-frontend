import { render } from '@testing-library/react';

import AuthBackground from '../AuthBackground';
import AuthCard from '../AuthCard';
import AuthIllustration from '../AuthIllustration';

describe('Auth Components', () => {
  it('AuthBackground renders without crashing', () => {
    const { container } = render(<AuthBackground />);
    expect(container).toBeTruthy();
  });

  it('AuthCard renders without crashing', () => {
    const { container } = render(
      <AuthCard>
        <div>Test Content</div>
      </AuthCard>
    );
    expect(container).toBeTruthy();
  });

  it('AuthIllustration renders without crashing', () => {
    const { container } = render(<AuthIllustration />);
    expect(container).toBeTruthy();
  });
});
