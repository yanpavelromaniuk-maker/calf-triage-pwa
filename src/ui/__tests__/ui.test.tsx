// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';

afterEach(cleanup);

describe('App smoke tests', () => {
  it('shows the onboarding disclaimer on first launch', () => {
    window.localStorage.clear();
    render(<App />);
    expect(screen.getByRole('heading', { name: /Прежде чем начать/ })).toBeTruthy();
    expect(screen.getByText(/НЕ ставит диагноз/)).toBeTruthy();
  });

  it('moves to the age step after acknowledging the disclaimer', () => {
    window.localStorage.clear();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Я понимаю/ }));
    expect(screen.getByText(/Шаг 1 из 5/)).toBeTruthy();
    expect(screen.getByLabelText(/Возраст теленка/)).toBeTruthy();
  });

  it('shows the age validation error for out-of-range ages', () => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'ct.settings.v1',
      JSON.stringify({ disclaimerAccepted: true, historyEnabled: false }),
    );
    render(<App />);
    const ageInput = screen.getByLabelText(/Возраст теленка/);
    fireEvent.change(ageInput, { target: { value: '300' } });
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    expect(screen.getByRole('alert').textContent).toMatch(/0 до 180/);
  });

  it('keeps working with a previously accepted disclaimer (reload path)', () => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'ct.settings.v1',
      JSON.stringify({ disclaimerAccepted: true, historyEnabled: false }),
    );
    render(<App />);
    expect(screen.getByText(/Шаг 1 из 5/)).toBeTruthy();
  });
});
