// Mock heavy markdown dependencies used inside request panels
jest.mock('@uiw/react-md-editor', () => ({
  __esModule: true,
  default: () => <div data-testid="md-editor" />,
}));

jest.mock('@uiw/react-markdown-preview', () => ({
  __esModule: true,
  default: () => <div data-testid="md-preview" />,
}));

import { render } from '@testing-library/react';

import GraphqlRequestPanel from '../GraphqlRequestPanel';
import GrpcRequestPanel from '../GrpcRequestPanel';
import HttpRequestPanel from '../HttpRequestPanel';
import WebSocketRequestPanel from '../WebSocketRequestPanel';

describe('Request Panel Components', () => {
  it('GraphQL request panel renders without crashing', () => {
    const { container } = render(<GraphqlRequestPanel />);
    expect(container).toBeTruthy();
  });

  it('gRPC request panel renders without crashing', () => {
    const { container } = render(<GrpcRequestPanel />);
    expect(container).toBeTruthy();
  });

  it('HTTP request panel renders without crashing', () => {
    const { container } = render(<HttpRequestPanel />);
    expect(container).toBeTruthy();
  });

  it('WebSocket request panel renders without crashing', () => {
    const { container } = render(<WebSocketRequestPanel />);
    expect(container).toBeTruthy();
  });
});
