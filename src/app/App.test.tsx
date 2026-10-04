import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Bootstrap', () => {
  it('renders the initial heading', () => {
    render(<App />);
    expect(screen.getByText('Mis Finanzas')).toBeDefined();
  });
});
