import { render } from '@testing-library/react';

/**
 * Fix React Portal usage (modals)
 */
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node,
}));

import EnvironmentEditModal from '../EnvironmentEditModal';
import EnvironmentManagerPanel from '../EnvironmentManagerPanel';
import SidebarEnvironments from '../SidebarEnvironments';

describe('Environment Components', () => {
  it('EnvironmentManagerPanel renders without crashing', () => {
    const { container } = render(<EnvironmentManagerPanel />);
    expect(container).toBeTruthy();
  });

  it('SidebarEnvironments renders without crashing', () => {
    const { container } = render(<SidebarEnvironments />);
    expect(container).toBeTruthy();
  });

  it('EnvironmentEditModal renders without crashing', () => {
    const { container } = render(
      <EnvironmentEditModal open={true} onClose={() => {}} />
    );
    expect(container).toBeTruthy();
  });
});
