import { describe, it, expect } from 'vitest';
import { calculateTotalSpent, calculateRemainingBudget, calculatePayoffMonths } from './budget';

describe('Budget Utils', () => {

  describe('calculateRemainingBudget', () => {
    it('subtracts normally', () => {
      expect(calculateRemainingBudget("100", "20")).toBe(80);
      expect(calculateRemainingBudget(100, 20)).toBe(80);
    });

    it('handles zero values and edge cases gracefully', () => {
      expect(calculateRemainingBudget(0, 0)).toBe(0);
      expect(calculateRemainingBudget("abc", 50)).toBe(0);
      expect(calculateRemainingBudget(100, "xyz")).toBe(100);
    });

    it('does not return negative numbers natively', () => {
      expect(calculateRemainingBudget(100, 150)).toBe(0);
    });
  });

  describe('calculatePayoffMonths', () => {
    it('calculates 0 interest precisely', () => {
       const months = calculatePayoffMonths({ amount: 1000, rate: 0, min: 100, isCreditCard: false });
       expect(months).toBe(10); // 1000 / 100
    });

    it('calculates credit card compounding accurately', () => {
       // $1000 at 20% APR with $100 min should take exactly 12 months due to daily compounding!
       const months = calculatePayoffMonths({ amount: 1000, rate: 20, min: 100, isCreditCard: true });
       expect(months).toBe(12);
    });
    
    it('calculates simple interest amortized accurately', () => {
       // $1000 at 5% APR with $100 min should take 11 months
       const months = calculatePayoffMonths({ amount: 1000, rate: 5, min: 100, isCreditCard: false });
       expect(months).toBe(11);
    });

    it('returns Infinity for negative amortization (min payment non-viable)', () => {
       const months = calculatePayoffMonths({ amount: 10000, rate: 25, min: 10, isCreditCard: true });
       expect(months).toBe(Infinity);
    });

    it('ignores negative interest rates and normalizes to 0%', () => {
       const months = calculatePayoffMonths({ amount: 500, rate: -5, min: 100, isCreditCard: false });
       expect(months).toBe(5); // 500/100
    });

    it('returns 0 immediately if amount is 0', () => {
       expect(calculatePayoffMonths({ amount: 0, rate: 20, min: 10, isCreditCard: true })).toBe(0);
    });
  });
});
