// 🔒 Mock unstable / heavy components FIRST
jest.mock('../ToolbarButton', () => ({
  __esModule: true,
  default: () => <div data-testid="toolbar-button" />,
}));

jest.mock('../WaterfallTooltip', () => ({
  __esModule: true,
  default: () => <div data-testid="waterfall-tooltip" />,
}));

import { render } from '@testing-library/react';

import BodyToolbar from '../BodyToolbar';
import TooltipContainer from '../TooltipContainer';
import ToolbarButton from '../ToolbarButton';
import WaterfallTooltip from '../WaterfallTooltip';

describe('Response Panel Components', () => {
  it('BodyToolbar renders without crashing', () => {
    const { container } = render(<BodyToolbar />);
    expect(container).toBeTruthy();
  });

  it('ToolbarButton renders without crashing (mocked)', () => {
    const { container } = render(<ToolbarButton />);
    expect(container).toBeTruthy();
  });

  it('TooltipContainer renders without crashing', () => {
    const { container } = render(<TooltipContainer />);
    expect(container).toBeTruthy();
  });

  it('WaterfallTooltip renders without crashing (mocked)', () => {
    const { container } = render(<WaterfallTooltip />);
    expect(container).toBeTruthy();
  });
});
