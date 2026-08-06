import { render, screen } from '@testing-library/react';

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }) => <pre>{children}</pre>,
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}));

jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: () => <button type="button">Sign in with Google</button>,
  googleLogout: jest.fn(),
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

import App from './App';

test('renders DevMind landing brand', () => {
  render(<App />);
  const brands = screen.getAllByText(/DEVMIND/i);
  expect(brands.length).toBeGreaterThan(0);
});
