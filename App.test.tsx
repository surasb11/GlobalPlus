
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import AppWrapper from './App';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to share the spy between mock factory and test
const { MockStatCard } = vi.hoisted(() => {
  return {
    MockStatCard: vi.fn((props: any) => <div data-testid="stat-card">{props.metric.label}</div>),
  };
});

// Mock StatCard as a memoized component wrapping the spy
vi.mock('./components/StatCard', async (importOriginal) => {
  const React = await import('react');
  // We return a memoized component wrapping our spy.
  // If props are stable, React.memo prevents re-render, so MockStatCard won't be called.
  return {
    default: React.memo(MockStatCard),
  };
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn();

describe('App Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('StatCard should NOT re-render when sidebar toggles (optimized)', async () => {
    render(<AppWrapper />);

    // Initial render count
    const initialCalls = MockStatCard.mock.calls.length;
    console.log('Initial StatCard renders:', initialCalls);
    expect(initialCalls).toBeGreaterThan(0);

    // Find the sidebar toggle button (md:hidden one)
    const buttons = screen.getAllByRole('button');
    const menuButton = buttons.find(b => b.className.includes('md:hidden'));

    if (!menuButton) throw new Error('Menu button not found');

    // Trigger state change in App (toggle sidebar)
    await act(async () => {
      fireEvent.click(menuButton);
    });

    const afterClickCalls = MockStatCard.mock.calls.length;
    console.log('After click StatCard renders:', afterClickCalls);

    const reRenders = afterClickCalls - initialCalls;
    console.log('Re-renders triggered:', reRenders);

    // Expect 0 re-renders because props are now stable and component is memoized
    expect(reRenders).toBe(0);
  });
});
