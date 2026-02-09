import { render } from '@testing-library/react';

/**
 * Mock dnd-kit core & sortable
 */
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  useSensor: jest.fn(),
  useSensors: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  ...jest.requireActual('@dnd-kit/sortable'),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
  }),
  SortableContext: ({ children }) => <div>{children}</div>,
  verticalListSortingStrategy: jest.fn(),
}));

import SidebarCollections from '../SidebarCollections';
import { SortableCollection } from '../SortableCollection';
import { SortableRequest } from '../SortableRequest';

describe('Collections Components', () => {
  it('SidebarCollections renders without crashing', () => {
    const { container } = render(<SidebarCollections />);
    expect(container).toBeTruthy();
  });

  it('SortableCollection renders without crashing', () => {
    const { container } = render(
      <SortableCollection
        id="col-1"
        collection={{
          id: 'col-1',
          name: 'Test Collection',
          collapsed: false,
          items: [
            {
              id: 'req-1',
              name: 'Test Request',
              method: 'GET',
            },
          ],
        }}
      />
    );

    expect(container).toBeTruthy();
  });

  it('SortableRequest renders without crashing', () => {
    const { container } = render(
      <SortableRequest
        id="req-1"
        request={{
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
        }}
      />
    );

    expect(container).toBeTruthy();
  });
});
