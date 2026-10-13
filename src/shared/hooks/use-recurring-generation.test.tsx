import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { recurringRepo } from '@/shared/db/repos/recurring.repo';
import { todayISO } from '@/shared/lib/dates';
import { useRecurringGeneration } from './use-recurring-generation';

describe('useRecurringGeneration', () => {
  const generateSpy = vi.spyOn(recurringRepo, 'generateUpTo');

  beforeEach(() => {
    generateSpy.mockReset();
    generateSpy.mockResolvedValue(0);
  });

  afterEach(() => {
    generateSpy.mockRestore();
  });

  it('generates recurring transactions once per session', async () => {
    const { rerender } = renderHook(() => useRecurringGeneration());

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalledTimes(1);
    });
    expect(generateSpy).toHaveBeenCalledWith(todayISO());

    rerender();
    expect(generateSpy).toHaveBeenCalledTimes(1);
  });
});
