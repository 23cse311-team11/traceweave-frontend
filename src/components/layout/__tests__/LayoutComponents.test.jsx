import { render } from '@testing-library/react';

// 🔒 Mock heavy / portal-based components if any
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node,
}));

import Header from '../Header';
import InviteMembersModal from '../InviteMembersModal';
import MainSidebar from '../MainSidebar';
import NewArtifactModal from '../NewArtifactModal';
import ResizablePanel from '../ResizablePanel';

describe('Layout Components', () => {
  const COMPONENTS = [
    { name: 'Header', Component: Header },
    { name: 'MainSidebar', Component: MainSidebar },
    { name: 'ResizablePanel', Component: ResizablePanel },
  ];

  COMPONENTS.forEach(({ name, Component }) => {
    it(`${name} renders without crashing`, () => {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    });
  });

  it('InviteMembersModal renders without crashing', () => {
    const { container } = render(<InviteMembersModal open={true} onClose={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('NewArtifactModal renders without crashing', () => {
    const { container } = render(<NewArtifactModal open={true} onClose={() => {}} />);
    expect(container).toBeTruthy();
  });
});
